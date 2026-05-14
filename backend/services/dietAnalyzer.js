import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

const DIET_PROMPT = `
You are a professional clinical nutritionist and food scientist.
Analyze this meal photo and return ONLY a valid JSON object. 
No explanation, no markdown, no preamble.

Identify every visible food item. If the image is unclear or 
not food, return { "error": "Not a valid food image" }.

Return this exact structure:
{
  "dishName": "Full descriptive name of the meal",
  "cuisineType": "e.g. Indian / Chinese / Continental",
  "portionSize": "Description with estimated weight e.g. Large plate (~450g)",
  "confidenceScore": 87,
  "ingredients": [
    { "name": "Basmati Rice", "estimatedWeight": "150g" },
    { "name": "Dal Tadka", "estimatedWeight": "120ml" }
  ],
  "nutrition": {
    "calories":      { "value": 520, "unit": "kcal" },
    "protein":       { "value": 18,  "unit": "g" },
    "carbohydrates": { "value": 82,  "unit": "g" },
    "fat":           { "value": 9,   "unit": "g" },
    "fiber":         { "value": 4,   "unit": "g" },
    "sugar":         { "value": 6,   "unit": "g" },
    "sodium":        { "value": 480, "unit": "mg" },
    "water":         { "value": 200, "unit": "ml" }
  },
  "healthFlags": ["Good Protein Source", "High Carbohydrates"],
  "warningFlags": ["Moderate Sodium — watch daily intake"],
  "aiSuggestion": "This is a balanced Indian meal. Consider adding cucumber raita or a green salad to increase fiber and micronutrient intake."
}
`;

/**
 * Clean AI response by removing markdown fences and other noise
 */
function cleanAIResponse(text) {
  let clean = text.replace(/```json|```/g, '').trim();
  // Try to find the first '{' and last '}'
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }
  return clean;
}

/**
 * Analyze diet image using Gemini (Primary)
 */
async function analyzeWithGemini(imageBuffer, mimeType, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try flash models for speed
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastErr = null;

  for (const modelName of models) {
    try {
      console.log(`    → Trying Gemini model for diet: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([DIET_PROMPT, imagePart]);
      const text = result.response.text();
      const clean = cleanAIResponse(text);
      return JSON.parse(clean);
    } catch (err) {
      console.warn(`    → Gemini ${modelName} failed for diet:`, err.message);
      lastErr = err;
    }
  }
  throw lastErr || new Error('All Gemini models exhausted for diet analysis');
}

/**
 * Analyze diet image using Groq (Fallback)
 */
async function analyzeWithGroq(imageBuffer, mimeType, apiKey) {
  const groq = new Groq({ apiKey });
  const base64Image = imageBuffer.toString('base64');

  try {
    console.log('    → Falling back to Groq for diet analysis...');
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // or meta-llama/llama-3.2-11b-vision-preview
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: DIET_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    const text = completion.choices[0]?.message?.content || '';
    const clean = cleanAIResponse(text);
    return JSON.parse(clean);
  } catch (err) {
    console.error('    → Groq failed for diet analysis:', err.message);
    throw err;
  }
}

/**
 * Public service function to analyze diet image
 */
export async function analyzeDietImage(imageBuffer, mimeType) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    throw new Error('No AI API keys configured (Gemini or Groq required)');
  }

  let lastError = null;

  // Try Gemini first
  if (geminiKey) {
    try {
      return await analyzeWithGemini(imageBuffer, mimeType, geminiKey);
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback to Groq
  if (groqKey) {
    try {
      return await analyzeWithGroq(imageBuffer, mimeType, groqKey);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Diet analysis failed: ${lastError?.message || 'Unknown error'}`);
}
