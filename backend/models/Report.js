import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      default: 'pdf'
    },
    extractedText: {
      type: String,
      default: ''
    },
    totalPages: {
      type: Number,
      default: 1
    },
    labResults: [
      {
        test_name: String,
        value: String,
        numeric_value: Number,
        unit: String,
        status: {
          type: String,
          enum: ['Normal', 'High', 'Low', 'Unknown'],
          default: 'Normal'
        },
        reference_range: String
      }
    ],
    totalTestsFound: {
      type: Number,
      default: 0
    },
    riskAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    overallRisk: {
      level: {
        type: String,
        default: 'low'
      },
      score: {
        type: Number,
        default: 0
      },
      summary: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      }
    },
    recommendations: [String],
    lifestyleRecommendations: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    precautions: [String],
    patientInfo: {
      name: { type: String, default: '' },
      age: { type: String, default: '' },
      gender: { type: String, default: '' }
    },
    clinicalSummary: {
      type: String,
      default: ''
    },
    trendInsight: {
      type: String,
      default: ''
    },
    comparisonSummary: {
      improved: [String],
      worsened: [String],
      needsAttention: [String],
      overallDelta: String
    },
    exerciseRecommendations: [
      {
        name: String,
        duration: String,
        frequency: String,
        reason: String,
        youtubeVideoId: String
      }
    ],
    safetyDisclaimer: {
      type: String,
      default: 'This analysis is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.'
    },
    analysisTimestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Index for efficient user-specific queries
reportSchema.index({ user: 1, createdAt: -1 })

const Report = mongoose.model('Report', reportSchema)

export default Report
