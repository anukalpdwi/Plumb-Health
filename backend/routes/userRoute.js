import express from 'express'
import User from '../models/User.js'
import Consultation from '../models/Consultation.js'
import { protect } from '../middleware/auth.js'
import { sendProUpgradeEmail, sendInvoiceEmail } from '../services/emailService.js'

const router = express.Router()

// @route   GET /api/user/profile
// @desc    Get current user profile with membership info
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        membershipType: user.membershipType,
        consultationsAvailable: user.consultationsAvailable,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    })
  }
})

// @route   GET /api/user/reset-pro
// @desc    RESET user to FREE membership (for testing purposes)
// @access  Private
router.get('/reset-pro', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    user.membershipType = 'free'
    user.consultationsAvailable = 0
    await user.save()

    res.json({
      success: true,
      message: 'Account reset to FREE. You can now test the Upgrade flow again!',
      user: {
        id: user._id,
        membershipType: user.membershipType
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Reset failed' })
  }
})

// @route   POST /api/user/upgrade
// @desc    Upgrade user to PRO membership (simulated checkout)
// @access  Private
router.post('/upgrade', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.membershipType === 'pro') {
      return res.status(400).json({
        success: false,
        message: 'You are already a PRO member!'
      })
    }

    // Simulate payment processing
    // In production, this would integrate with Stripe/Razorpay
    user.membershipType = 'pro'
    user.consultationsAvailable = 1 // 1 free consultation with PRO
    await user.save()


    // 📧 Send PRO Upgrade Notification Email
    sendProUpgradeEmail(user.email, user.name)
      .catch(err => console.error('⚠️ [Upgrade] Post-upgrade email failed:', err.message))

    // 🧾 Send Invoice Email (do not await)
    const invoiceData = {
      invoiceId: `INV-${user._id.toString().slice(-6)}-${Date.now()}`,
      amount: 499,
      date: new Date().toLocaleDateString('en-IN')
    }
    sendInvoiceEmail(user.email, user.name, invoiceData)
      .catch(err => console.error('⚠️ [Upgrade] Invoice email failed:', err.message))

    res.json({
      success: true,
      message: 'Congratulations! You are now a PRO member!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        membershipType: user.membershipType,
        consultationsAvailable: user.consultationsAvailable
      }
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    res.status(500).json({
      success: false,
      message: 'Upgrade failed'
    })
  }
})

// @route   POST /api/user/consultation
// @desc    Request a doctor consultation (PRO only)
// @access  Private
router.post('/consultation', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.membershipType !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'Doctor consultation is a PRO feature. Please upgrade your membership.'
      })
    }

    if (user.consultationsAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No consultations available. You have used your free consultation.'
      })
    }

    const { message, symptoms, reportId, priority } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please describe your concern'
      })
    }

    // Create consultation request
    const consultation = await Consultation.create({
      user: req.user.id,
      report: reportId || null,
      message,
      symptoms: symptoms || '',
      priority: priority || 'medium'
    })

    // Decrement available consultations
    user.consultationsAvailable -= 1
    await user.save()

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully! A doctor will review your case shortly.',
      consultation,
      consultationsRemaining: user.consultationsAvailable
    })
  } catch (error) {
    console.error('Consultation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit consultation request'
    })
  }
})

// @route   GET /api/user/consultations
// @desc    Get all consultations for the current user
// @access  Private
router.get('/consultations', protect, async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('report', 'fileName overallRisk createdAt')

    res.json({
      success: true,
      count: consultations.length,
      consultations
    })
  } catch (error) {
    console.error('Get consultations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultations'
    })
  }
})

// @route   POST /api/user/video-consultation
// @desc    Generate a video consultation room link (Jitsi)
// @access  Private (PRO only)
router.post('/video-consultation', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.membershipType !== 'pro') {
      return res.status(403).json({ success: false, message: 'Video consultation is a PRO feature.' })
    }
    // Generate a unique Jitsi room name
    const room = `plumb-health-video-${user._id.toString().slice(-6)}-${Date.now()}`
    const jitsiUrl = `https://meet.jit.si/${room}`
    res.json({ success: true, url: jitsiUrl })
  } catch (error) {
    console.error('Video consultation error:', error)
    res.status(500).json({ success: false, message: 'Failed to create video consultation link' })
  }
})

export default router
