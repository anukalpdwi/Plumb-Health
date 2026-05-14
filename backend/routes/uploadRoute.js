import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { protect } from '../middleware/auth.js'
import User from '../models/User.js'
import { sendReportEmail } from '../services/emailService.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const basename = path.basename(file.originalname, extension)
    cb(null, `${basename}-${uniqueSuffix}${extension}`)
  }
})

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false)
  }
}

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
})

// @route   POST /api/upload-report
// @desc    Upload a health report file
// @access  Private (requires authentication)
router.post('/upload-report', protect, upload.single('report'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    // File information
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/api/uploads/${req.file.filename}` // Relative URL for frontend access

    }

    // Here you could save file info to database for the user
    // For now, we'll just return the file information

    // Send report email to user (do not await)
    try {
      const user = await User.findById(req.user.id)
      if (user) {
        const reportData = {
          summary: 'Your report has been uploaded and is being analyzed.',
          fileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/uploads/${fileInfo.filename}`
        }
        sendReportEmail(user.email, user.name, reportData)
          .catch(err => console.error('⚠️ [Report] Report email failed:', err.message))
      }
    } catch (e) {
      console.error('⚠️ [Report] Could not send report email:', e.message)
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo,
      user: req.user.id // User ID from JWT token
    })

  } catch (error) {
    console.error('Upload Error:', error)

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        })
      }
    }

    // Handle custom file filter errors
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    })
  }
})

// @route   GET /api/uploads/:filename
// @desc    Serve uploaded files
// @access  Private (requires authentication)
router.get('/uploads/:filename', protect, (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, '../uploads/', filename)

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      })
    }
  })
})

export default router
