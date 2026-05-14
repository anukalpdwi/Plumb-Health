/**
 * ═══════════════════════════════════════════════════════════════════
 *  Plumb Health AI — Multimodal LLM Health Report Analyzer
 * ═══════════════════════════════════════════════════════════════════
 *
 *  PRIMARY  : Google Gemini 2.0 Flash (multimodal — sends raw PDF bytes)
 *  FALLBACK : Groq  LLaMA 3 Vision  (text-based — uses pdf-parse extraction)
 *
 *  The service returns a fully structured JSON object that maps directly
 *  to the Report Mongoose model, so the caller just does Report.create(result).
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

// ── Structured prompt shared across all providers ──────────────────
const SYSTEM_PROMPT = `You are Plumb Health AI, the world's most advanced medical health report analyzer.

You will be given the content of a medical / pathology / blood test report.
Your task is to extract EVERY lab test result from the document with clinical precision.

CRITICAL INSTRUCTIONS:
1. Extract ALL test names, their numeric values, units, and reference ranges exactly as written in the report.
2. For each test, determine if the value is "Normal", "High", or "Low" by comparing it against the reference range printed on the report OR standard medical reference ranges.
3. Calculate an overall health risk score from 0 to 100 (0 = perfectly healthy, 100 = critical danger).
4. Determine the overall risk level: "low", "moderate", "high", or "critical".
5. Generate personalized, actionable health recommendations based on abnormal values.
6. Generate lifestyle and dietary recommendations grouped by the test name they relate to.
7. Generate important precautions the patient should follow.
8. If the document mentions the patient's name, age, gender, or any demographic info, extract those too.

You MUST respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{
  "extractedText": "<full text content of the entire report>",
  "patientInfo": {
    "name": "<patient name or empty string>",
    "age": "<patient age or empty string>",
    "gender": "<patient gender or empty string>",
    "referredBy": "<referring doctor or empty string>"
  },
  "labResults": [
    {
      "test_name": "<exact test name>",
      "value": "<value as string>",
      "numeric_value": <numeric value as number or null>,
      "unit": "<unit>",
      "status": "<Normal|High|Low>",
      "reference_range": "<reference range as string e.g. '12.0-16.0 g/dL'>"
    }
  ],
  "totalTestsFound": <number>,
  "riskAssessment": {
    "<test_name>": {
      "value": <numeric value>,
      "status": "<Normal|High|Low>",
      "risk_level": "<Normal|Low Risk|High Risk>",
      "reference_range": "<range string>",
      "unit": "<unit>",
      "deviation": <percentage deviation from midpoint of reference range>
    }
  },
  "overallRisk": {
    "level": "<low|moderate|high|critical>",
    "score": <0-100 number>,
    "summary": "<one-line summary of overall health status>",
    "description": "<2-3 sentence detailed description>"
  },
  "recommendations": [
    "<actionable recommendation string with emoji prefix>"
  ],
  "lifestyleRecommendations": {
    "<test_name>": [
      "<specific lifestyle/dietary recommendation>"
    ]
  },
  "precautions": [
    "<important precaution string>"
  ],
  "exerciseRecommendations": [
    {
      "name": "<exercise name>",
      "duration": "<duration, e.g., 30 mins>",
      "frequency": "<frequency, e.g., 3 times a week>",
      "reason": "<reasoning based on specific biomarkers>",
      "youtubeVideoId": "<a REAL YouTube instructional video ID for this exercise. DO NOT HALLUCINATE. If unsure, leave empty string.>"
    }
  ],
  "comparisonSummary": {
    "improved": ["<what improved>"],
    "worsened": ["<what worsened>"],
    "needsAttention": ["<what needs urgent attention>"],
    "overallDelta": "<a brief 1-2 sentence summary of the change since last report>"
  },
  "clinicalSummary": "<A 3-5 sentence clinical narrative written like a doctor's note. Relate abnormal tests to each other, explain possible causes, and give an overall health assessment in plain language. Start with 'Based on this report...'>"
}

COMPARISON LOGIC:
If a previous report's data is provided in the prompt, compare the current results with the previous ones. Populate the "comparisonSummary" field. If no previous report is provided, leave these fields as empty arrays/string.

EXERCISE RECOMMENDATIONS:
Suggest 3-5 specific exercises tailored to the user's biomarkers. Each recommendation must include duration, frequency, reasoning, and a specific YouTube video ID for a high-quality instructional video.

CRITICAL: DO NOT use 'dQw4w9WgXcQ' (that is a Rick Astley song). DO NOT use 'jawed' or other non-exercise IDs.
Use these reference IDs for common exercises if applicable:
- Brisk Walking: 'aG04S0c02mE' or 'kY7wV2YgK8s'
- Yoga: 'v7AYKMP6rOE' (Yoga with Adriene)
- Resistance Training: 'U88S2oWkOTo'
- Stretching: '17uN_iX0vIs'
- Swimming: 'mYVpXG_vF2A'
If the exercise is not in this list, only provide a YouTube ID if you are 100% certain it is a real, high-quality instructional video for THAT exercise. Otherwise, leave "youtubeVideoId" as an empty string.

IMPORTANT RULES:
- Extract EVERY single test. Do NOT skip any test. Even if a test is new to you, include it.
- If reference ranges are printed on the report, use THOSE ranges. Otherwise, use standard medical ranges.
- numeric_value must be a real number (float/int), NOT a string. Use null if not parseable.
- The "status" field in labResults must be exactly one of: "Normal", "High", or "Low".
- The overallRisk.level must be exactly one of: "low", "moderate", "high", "critical" (lowercase).
- Include at least 3-5 meaningful recommendations.
- Include lifestyle recommendations for every abnormal test.
- Precautions should include general safety advice and test-specific warnings.
- The clinicalSummary MUST be a thoughtful, connected narrative — not a list. Think like a physician presenting findings to a patient.
- Output ONLY the JSON object. No markdown fences, no explanation, nothing else.`

// ── Provider: Google Gemini (Multimodal — Sends raw PDF/Image) ────
// Tries gemini-2.0-flash first, falls back to gemini-1.5-flash (separate quota)
async function analyzeWithGemini(filePath, apiKey, comparisonContext = '') {
  const genAI = new GoogleGenerativeAI(apiKey)
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()

  let mimeType = 'application/pdf'
  if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg'
  else if (ext === '.png') mimeType = 'image/png'

  const filePart = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType
    }
  }

  const contentPayload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          filePart,
          { text: `${comparisonContext}\nAnalyze this medical report completely. Extract every test result. Return ONLY valid JSON.` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 16384
    }
  }

  // Try multiple Gemini models to dodge per-model quota limits
  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite']
  let lastErr = null

  for (const modelName of modelsToTry) {
    try {
      console.log(`    → Trying Gemini model: ${modelName}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(contentPayload)
      const text = result.response.text()
      return parseAIResponse(text, `Gemini/${modelName}`)
    } catch (err) {
      console.warn(`    → ${modelName} failed: ${err.message.substring(0, 120)}`)
      lastErr = err
    }
  }

  throw lastErr || new Error('All Gemini models exhausted')
}

// ── Provider: Groq (Vision-based fallback with PDF-to-Image) ──────
// Converts PDF pages to PNG images, then sends them to Groq's vision model.
// Falls back to text extraction if image conversion fails.
async function analyzeWithGroq(filePath, apiKey, comparisonContext = '') {
  const groq = new Groq({ apiKey })
  const ext = path.extname(filePath).toLowerCase()
  const fileBuffer = fs.readFileSync(filePath)

  // ── Strategy 1: Vision mode (convert PDF/image to images → send to vision LLM) ──
  try {
    let imageBase64List = []

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Already an image — just encode it
      imageBase64List.push(fileBuffer.toString('base64'))
      console.log('    → [Groq Vision] Using uploaded image directly')
    } else {
      // Convert PDF pages to PNG images
      console.log('    → [Groq Vision] Converting PDF pages to images...')
      const require = createRequire(import.meta.url)
      const pdfImgConvert = require('pdf-img-convert')
      const convert = pdfImgConvert.convert || pdfImgConvert.default?.convert || pdfImgConvert.default
      const pagesAsUint8 = await convert(filePath, { 
        width: 1200, 
        height: 1600,
        page_numbers: [1, 2, 3, 4, 5]  // First 5 pages max
      })
      
      for (const pageData of pagesAsUint8) {
        const b64 = Buffer.from(pageData).toString('base64')
        imageBase64List.push(b64)
      }
      console.log(`    → [Groq Vision] Converted ${imageBase64List.length} pages to images`)
    }

    if (imageBase64List.length > 0) {
      // Build multimodal message with images
      const imageParts = imageBase64List.map(b64 => ({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${b64}`
        }
      }))

      const completion = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${comparisonContext}\nAnalyze this medical report completely. These are scanned pages of a health/pathology report. Extract every single test result you can see. Return ONLY valid JSON.` },
              ...imageParts
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })

      const text = completion.choices[0]?.message?.content || ''
      const parsed = parseAIResponse(text, 'Groq-Vision')
      
      // Verify we actually got results
      if (parsed.labResults && parsed.labResults.length > 0) {
        return parsed
      }
      console.warn('    → [Groq Vision] Vision returned 0 tests, falling back to text mode...')
    }
  } catch (visionErr) {
    console.warn('    → [Groq Vision] Vision mode failed:', visionErr.message?.substring(0, 200))
    console.warn('    → [Groq] Falling back to text extraction mode...')
  }

  // ── Strategy 2: Text extraction fallback ──
  let extractedText = ''
  try {
    const require = createRequire(import.meta.url)
    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(fileBuffer)
    extractedText = pdfData.text
    console.log(`    → [Groq Text] Extracted ${extractedText.length} chars from PDF`)
    console.log(`    → [Groq Text] First 200 chars: ${extractedText.substring(0, 200)}`)
  } catch (pdfError) {
    console.warn('    → [Groq Text] PDF parsing failed:', pdfError.message)
    extractedText = fileBuffer.toString('utf-8').substring(0, 10000)
  }

  if (!extractedText || extractedText.trim().length < 10) {
    throw new Error('Could not extract any content from the document (both vision and text modes failed)')
  }

  console.log(`    → [Groq Text] Extracted ${extractedText.length} chars, sending to LLM...`)

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${comparisonContext}\nHere is the full text extracted from a medical report:\n\n---\n${extractedText}\n---\n\nAnalyze this medical report completely. Extract every test result. Return ONLY valid JSON.`
      }
    ],
    temperature: 0.1,
    max_tokens: 4000
  })

  const text = completion.choices[0]?.message?.content || ''
  console.log(`    → [Groq Text] LLM response length: ${text.length}`)
  console.log(`    → [Groq Text] First 300 chars of response: ${text.substring(0, 300)}`)
  return parseAIResponse(text, 'Groq-Text')
}

// ── JSON Parser — robust against markdown fences & trailing text ──
function parseAIResponse(raw, providerName) {
  if (!raw || raw.trim().length === 0) {
    throw new Error(`${providerName} returned empty response`)
  }

  // Strip markdown code fences if the model wrapped output
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  // Try parsing directly
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object from surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        throw new Error(`${providerName}: Could not parse JSON from response. First 500 chars: ${cleaned.substring(0, 500)}`)
      }
    }
    throw new Error(`${providerName}: No JSON object found in response. First 500 chars: ${cleaned.substring(0, 500)}`)
  }
}

// ── Biomarker name alias map — canonical name → known variants ──────
// All comparisons are done lowercase. The canonical name (key) is the
// display name that will be stored in MongoDB for all matching variants.
const BIOMARKER_ALIASES = {
  'Hemoglobin':                ['hb', 'hgb', 'haemoglobin', 'hemoglobin', 'hgb (hemoglobin)'],
  'RBC':                       ['rbc', 'red blood cell', 'red blood cells', 'erythrocytes', 'red cell count'],
  'WBC':                       ['wbc', 'white blood cell', 'white blood cells', 'leukocytes', 'total wbc', 'total leucocyte count', 'tlc'],
  'Platelets':                 ['platelets', 'platelet count', 'plt', 'thrombocytes'],
  'Hematocrit':                ['hematocrit', 'haematocrit', 'pcv', 'packed cell volume'],
  'MCV':                       ['mcv', 'mean corpuscular volume'],
  'MCH':                       ['mch', 'mean corpuscular hemoglobin'],
  'MCHC':                      ['mchc', 'mean corpuscular hemoglobin concentration'],
  'Fasting Blood Sugar':       ['fbs', 'fasting blood sugar', 'fasting glucose', 'blood glucose fasting', 'fasting blood glucose'],
  'Post Prandial Blood Sugar': ['ppbs', 'postprandial blood sugar', 'post prandial glucose', 'pp blood sugar', 'pp glucose'],
  'HbA1c':                     ['hba1c', 'hba 1c', 'glycated hemoglobin', 'glycosylated hemoglobin', 'hemoglobin a1c'],
  'Total Cholesterol':         ['cholesterol', 'total cholesterol', 'serum cholesterol'],
  'LDL':                       ['ldl', 'ldl cholesterol', 'low density lipoprotein', 'ldl-c'],
  'HDL':                       ['hdl', 'hdl cholesterol', 'high density lipoprotein', 'hdl-c'],
  'Triglycerides':             ['triglycerides', 'triglyceride', 'tg', 'serum triglycerides'],
  'VLDL':                      ['vldl', 'vldl cholesterol', 'very low density lipoprotein'],
  'TSH':                       ['tsh', 'tsh - ultrasensitive', 'tsh ultrasensitive', 'thyroid stimulating hormone', 'serum tsh'],
  'T3':                        ['t3', 'total t3', 'tri-iodothyronine', 'total tri-iodothyronine', 'triiodothyronine', 'total tri-iodothyronine (t3)'],
  'T4':                        ['t4', 'total t4', 'thyroxine', 'total thyroxine', 'serum thyroxine'],
  'Free T3':                   ['free t3', 'ft3', 'free triiodothyronine'],
  'Free T4':                   ['free t4', 'ft4', 'free thyroxine'],
  'Creatinine':                ['creatinine', 'serum creatinine', 'creatinine serum'],
  'Blood Urea Nitrogen':       ['bun', 'blood urea nitrogen', 'urea nitrogen', 'blood urea'],
  'Uric Acid':                 ['uric acid', 'serum uric acid'],
  'Sodium':                    ['sodium', 'serum sodium', 'na+', 'na'],
  'Potassium':                 ['potassium', 'serum potassium', 'k+', 'k'],
  'Calcium':                   ['calcium', 'serum calcium', 'ca'],
  'ALT':                       ['alt', 'sgpt', 'alanine aminotransferase', 'alanine transaminase'],
  'AST':                       ['ast', 'sgot', 'aspartate aminotransferase', 'aspartate transaminase'],
  'Alkaline Phosphatase':      ['alp', 'alkaline phosphatase', 'alk phos'],
  'Total Bilirubin':           ['total bilirubin', 'bilirubin total', 'serum bilirubin'],
  'Direct Bilirubin':          ['direct bilirubin', 'conjugated bilirubin', 'bilirubin direct'],
  'Total Protein':             ['total protein', 'serum total protein'],
  'Albumin':                   ['albumin', 'serum albumin'],
  'Vitamin D':                 ['vitamin d', '25-oh vitamin d', '25 oh vitamin d', '25-hydroxyvitamin d', 'vitamin d3', 'vitamin d total'],
  'Vitamin B12':               ['vitamin b12', 'b12', 'cobalamin', 'cyanocobalamin'],
  'Iron':                      ['iron', 'serum iron', 'fe'],
  'Ferritin':                  ['ferritin', 'serum ferritin'],
  'TIBC':                      ['tibc', 'total iron binding capacity'],
}

// Build a reverse lookup: lowercase variant → canonical name
const _ALIAS_REVERSE_MAP = {}
for (const [canonical, variants] of Object.entries(BIOMARKER_ALIASES)) {
  for (const variant of variants) {
    _ALIAS_REVERSE_MAP[variant.toLowerCase()] = canonical
  }
}

/**
 * Normalize a biomarker name to its canonical form.
 * Falls back to Title-casing the original name if no alias found.
 */
function normalizeBiomarkerName(rawName) {
  if (!rawName || typeof rawName !== 'string') return 'Unknown'
  const lower = rawName.toLowerCase().trim()
  if (_ALIAS_REVERSE_MAP[lower]) return _ALIAS_REVERSE_MAP[lower]
  // No alias match — return trimmed original (preserves AI-produced names)
  return rawName.trim()
}

// ── Validate & normalize the parsed result against our schema ─────
function normalizeResult(parsed) {
  // Ensure all required fields exist with safe defaults
  const result = {
    extractedText: parsed.extractedText || '',
    patientInfo: {
      name: parsed.patientInfo?.name || '',
      age: parsed.patientInfo?.age || '',
      gender: parsed.patientInfo?.gender || ''
    },
    clinicalSummary: parsed.clinicalSummary || '',
    labResults: [],
    totalTestsFound: 0,
    riskAssessment: {},
    overallRisk: {
      level: 'low',
      score: 0,
      summary: '',
      description: ''
    },
    recommendations: [],
    lifestyleRecommendations: {},
    precautions: [],
    comparisonSummary: {
      improved: parsed.comparisonSummary?.improved || [],
      worsened: parsed.comparisonSummary?.worsened || [],
      needsAttention: parsed.comparisonSummary?.needsAttention || [],
      overallDelta: parsed.comparisonSummary?.overallDelta || ''
    },
    exerciseRecommendations: Array.isArray(parsed.exerciseRecommendations) 
      ? parsed.exerciseRecommendations.map(ex => ({
          name: ex.name || '',
          duration: ex.duration || '',
          frequency: ex.frequency || '',
          reason: ex.reason || '',
          youtubeVideoId: ex.youtubeVideoId || ''
        }))
      : []
  }

  // Normalize lab results — apply canonical biomarker name normalization
  if (Array.isArray(parsed.labResults)) {
    result.labResults = parsed.labResults.map(lr => ({
      test_name: normalizeBiomarkerName(lr.test_name || lr.testName || 'Unknown'),
      value: String(lr.value ?? ''),
      numeric_value: typeof lr.numeric_value === 'number' ? lr.numeric_value : (parseFloat(lr.numeric_value) || null),
      unit: lr.unit || '',
      status: normalizeStatus(lr.status),
      reference_range: lr.reference_range || lr.referenceRange || ''
    }))
    result.totalTestsFound = result.labResults.length
  }

  // Normalize risk assessment
  if (parsed.riskAssessment && typeof parsed.riskAssessment === 'object') {
    result.riskAssessment = {}
    for (const [key, val] of Object.entries(parsed.riskAssessment)) {
      result.riskAssessment[key] = {
        value: val.value ?? null,
        status: normalizeStatus(val.status),
        risk_level: val.risk_level || val.riskLevel || 'Normal',
        reference_range: val.reference_range || val.referenceRange || '',
        unit: val.unit || '',
        deviation: val.deviation ?? 0
      }
    }
  }

  // Normalize overall risk
  if (parsed.overallRisk) {
    const raw = parsed.overallRisk
    result.overallRisk = {
      level: (raw.level || 'low').toLowerCase(),
      score: typeof raw.score === 'number' ? Math.min(100, Math.max(0, Math.round(raw.score))) : 0,
      summary: raw.summary || raw.description || '',
      description: raw.description || raw.summary || ''
    }
  }

  // Normalize recommendations
  if (Array.isArray(parsed.recommendations)) {
    result.recommendations = parsed.recommendations.filter(r => typeof r === 'string' && r.trim())
  }
  if (result.recommendations.length === 0) {
    result.recommendations = [
      '🏥 Regular health screenings are important for preventive care',
      '🩺 Always consult with a healthcare professional for proper interpretation'
    ]
  }

  // Normalize lifestyle recommendations
  if (parsed.lifestyleRecommendations && typeof parsed.lifestyleRecommendations === 'object') {
    result.lifestyleRecommendations = {}
    for (const [key, val] of Object.entries(parsed.lifestyleRecommendations)) {
      if (Array.isArray(val)) {
        result.lifestyleRecommendations[key] = val.filter(r => typeof r === 'string')
      }
    }
  }

  // Normalize precautions
  if (Array.isArray(parsed.precautions)) {
    result.precautions = parsed.precautions.filter(p => typeof p === 'string' && p.trim())
  }
  if (result.precautions.length === 0) {
    result.precautions = [
      'This analysis is AI-generated and should not replace professional medical advice.',
      'Consult your healthcare provider for proper diagnosis and treatment.'
    ]
  }

  return result
}

function normalizeStatus(status) {
  if (!status) return 'Normal'
  const s = status.toLowerCase().trim()
  if (s === 'high' || s === 'HIGH') return 'High'
  if (s === 'low' || s === 'LOW') return 'Low'
  if (s === 'normal' || s === 'NORMAL') return 'Normal'
  // Handle edge cases like "Within Range", "Abnormal" etc.
  if (s.includes('high') || s.includes('elevated') || s.includes('above')) return 'High'
  if (s.includes('low') || s.includes('below') || s.includes('deficien')) return 'Low'
  return 'Normal'
}

// ══════════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════════

/**
 * Analyze a medical report file using AI.
 *
 * Tries Gemini first (multimodal vision — sends raw file).
 * Falls back to Groq (text extraction + LLM) on failure.
 *
 * @param {string} filePath  Absolute path to PDF or image file
 * @returns {Promise<object>}  Normalized analysis result
 */
export async function analyzeReport(filePath, previousReport = null) {
  // Use dotenv.parse to forcibly read the live .env file 
  // preventing caching bugs from node --watch
  let envConfig = {};
  try {
    envConfig = (await import('dotenv')).default.parse(fs.readFileSync(path.join(process.cwd(), '.env')));
  } catch (err) {
    console.warn('Could not read .env file directly:', err.message);
  }

  const geminiKey = process.env.GEMINI_API_KEY || envConfig.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY || envConfig.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    throw new Error(
      'No AI API keys configured. Set GEMINI_API_KEY and/or GROQ_API_KEY in your .env file.'
    )
  }

  let comparisonContext = '';
  if (previousReport) {
    const prevDate = new Date(previousReport.createdAt).toLocaleDateString();
    const prevResults = (previousReport.labResults || [])
      .map(r => `${r.test_name}: ${r.value} ${r.unit} (${r.status})`)
      .join(', ');
    comparisonContext = `\nCOMPARISON DATA (Previous Report from ${prevDate}):\n${prevResults}\nCompare these previous results with the new report and identify what improved, what worsened, and what needs attention.`;
  }

  let lastError = null

  // ── Attempt 1: Gemini (Multimodal Vision) ──
  if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
    try {
      console.log('  🤖 [LLM] Attempting Gemini multimodal analysis for:', path.basename(filePath))
      const parsed = await analyzeWithGemini(filePath, geminiKey, comparisonContext)
      const result = normalizeResult(parsed)
      console.log(`  ✅ [LLM] Gemini succeeded — ${result.totalTestsFound} tests extracted`)
      result._provider = 'gemini'
      return result
    } catch (err) {
      console.error('  ⚠️ [LLM] Gemini failed:', err.message)
      if (err.message.includes('API key not valid')) {
        console.error('  💡 TIP: Check your GEMINI_API_KEY in .env')
      }
      lastError = err
    }
  }

  // ── Attempt 2: Groq Fallback (Text + LLM) ──
  if (groqKey && groqKey !== 'your-groq-api-key-here') {
    try {
      console.log('  🔄 [LLM] Falling back to Groq text analysis...')
      const parsed = await analyzeWithGroq(filePath, groqKey, comparisonContext)
      const result = normalizeResult(parsed)
      console.log(`  ✅ [LLM] Groq succeeded — ${result.totalTestsFound} tests extracted`)
      result._provider = 'groq'
      return result
    } catch (err) {
      console.error('  ⚠️ [LLM] Groq failed:', err.message)
      if (err.message.includes('API key not valid')) {
        console.error('  💡 TIP: Check your GROQ_API_KEY in .env')
      }
      lastError = err
    }
  }

  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  )
}
