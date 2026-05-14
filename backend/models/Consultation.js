import mongoose from 'mongoose'

const consultationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'completed', 'cancelled'],
      default: 'pending'
    },
    symptoms: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Please describe your concern']
    },
    doctorNotes: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  { timestamps: true }
)

consultationSchema.index({ user: 1, createdAt: -1 })

const Consultation = mongoose.model('Consultation', consultationSchema)

export default Consultation
