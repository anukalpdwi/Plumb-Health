import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import authRoutes from './routes/auth.js'
import uploadRoutes from './routes/uploadRoute.js'
import reportRoutes from './routes/reportRoute.js'
import userRoutes from './routes/userRoute.js'
import dietRoutes from './routes/dietRoute.js'
import { protect } from './middleware/auth.js'
import Report from './models/Report.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { analyzeReport } from './services/llmAnalyzer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ override: true })

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plumb-health'

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message)
    console.log('💡 Make sure MongoDB is running or update MONGODB_URI in .env')
  })

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Plumb Health AI Backend Running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Authentication routes
app.use('/auth', authRoutes)

// Upload routes
app.use('/', uploadRoutes)

// Report history routes
app.use('/reports', reportRoutes)

// User / membership routes
app.use('/user', userRoutes)

// Diet tracking routes
app.use('/diet', dietRoutes)

// ─────────────────────────────────────────────────────────────
// AI-Powered Report Analysis (Gemini → Groq fallback)
// ─────────────────────────────────────────────────────────────
app.post('/analyze-report', protect, async (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      })
    }

    if (!fs.existsSync(filePath)) {
      // Try resolving relative to backend root just in case
      const alternativePath = path.resolve(process.cwd(), filePath)
      if (!fs.existsSync(alternativePath)) {
        console.error('❌ [Analysis] File not found at:', filePath, 'or', alternativePath)
        return res.status(404).json({
          success: false,
          message: 'Report file not found on server'
        })
      }
    }

    const resolvedFilePath = path.resolve(filePath)
    console.log('🔬 [Analysis] Starting AI analysis for:', path.basename(resolvedFilePath))

    // ── Fetch Previous Report for Comparison ──
    let previousReport = null;
    try {
      previousReport = await Report.findOne({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select('labResults overallRisk createdAt');
    } catch (err) {
      console.warn('⚠️ [Analysis] Could not fetch previous report:', err.message);
    }

    // ── Single-step LLM analysis (Gemini primary, Groq fallback) ──
    let analysis;
    try {
      analysis = await analyzeReport(resolvedFilePath, previousReport)
    } catch (aiError) {
      console.error('❌ [Analysis] AI engine failed:', aiError.message)
      throw aiError // Re-throw to be caught by the outer catch
    }

    console.log(`✅ [Analysis] AI complete: ${analysis.totalTestsFound} tests via ${analysis._provider}`)

    // ── Save to MongoDB ──
    const report = await Report.create({
      user: req.user.id,
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).toLowerCase() === '.pdf' ? 'pdf' : 'image',
      extractedText: analysis.extractedText,
      totalPages: 1,
      labResults: analysis.labResults,
      totalTestsFound: analysis.totalTestsFound,
      riskAssessment: analysis.riskAssessment,
      overallRisk: {
        level: analysis.overallRisk.level,
        score: analysis.overallRisk.score,
        summary: analysis.overallRisk.summary,
        description: analysis.overallRisk.description
      },
      recommendations: analysis.recommendations,
      lifestyleRecommendations: analysis.lifestyleRecommendations,
      precautions: analysis.precautions,
      patientInfo: analysis.patientInfo,
      clinicalSummary: analysis.clinicalSummary,
      comparisonSummary: analysis.comparisonSummary,
      exerciseRecommendations: analysis.exerciseRecommendations,
      analysisTimestamp: new Date()
    })

    res.json({
      success: true,
      message: 'AI analysis completed successfully',
      reportId: report._id,
      data: {
        ...analysis,
        analysis_timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 [Fatal] Unhandled Rejection in Plumb Health Backend:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during analysis'
    })
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || 'Server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n=================================`)
  console.log(`🚀 [Server] Plumb Health API initialized successfully on port ${PORT}`)
  console.log(`=================================\n`)
})
