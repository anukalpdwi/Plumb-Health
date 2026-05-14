import express from 'express'
import mongoose from 'mongoose'
import Report from '../models/Report.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/reports
// @desc    Get all reports for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-extractedText') // Exclude large text field from list view

    res.json({
      success: true,
      count: reports.length,
      reports
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    })
  }
})

// @route   GET /api/reports/trends
// @desc    Aggregate biomarker time-series data across all user reports
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    // ── MongoDB aggregation: unwind labResults across reports ──────────
    const pipeline = [
      // 1. Only this user's reports
      { $match: { user: userId } },
      // 2. Chronological order so data points are always time-ordered
      { $sort: { createdAt: 1 } },
      // 3. Flatten labResults — one document per (report × biomarker)
      { $unwind: '$labResults' },
      // 4. Only include tests with a real numeric value (skip nulls)
      { $match: { 'labResults.numeric_value': { $ne: null, $type: 'number' } } },
      // 5. Group by canonical biomarker name, collect time-series data points
      {
        $group: {
          _id: '$labResults.test_name',
          dataPoints: {
            $push: {
              date: '$createdAt',
              reportId: '$_id',
              fileName: '$fileName',
              value: '$labResults.numeric_value',
              displayValue: '$labResults.value',
              unit: '$labResults.unit',
              status: '$labResults.status',
              // Per-point reference range — labs may differ between reports
              reference_range: '$labResults.reference_range'
            }
          },
          latestUnit: { $last: '$labResults.unit' },
          latestReferenceRange: { $last: '$labResults.reference_range' }
        }
      },
      // 6. Drop biomarkers that only appear in 1 report — a single dot is meaningless
      { $match: { $expr: { $gte: [{ $size: '$dataPoints' }, 2] } } },
      // 7. Alphabetical order for consistent pill ordering in the UI
      { $sort: { _id: 1 } }
    ]

    const rawTrends = await Report.aggregate(pipeline)

    // ── Compute "biggest change" summary cards server-side ─────────────
    // Compare the two most recent data points for each biomarker and
    // generate a human-readable sentence for display above the chart.
    const biggestChanges = []

    for (const trend of rawTrends) {
      const pts = trend.dataPoints
      if (pts.length < 2) continue

      const prev = pts[pts.length - 2]
      const curr = pts[pts.length - 1]

      if (!prev.value || prev.value === 0) continue

      const diff = curr.value - prev.value
      const pct = (diff / Math.abs(prev.value)) * 100

      if (Math.abs(pct) < 3) continue // ignore statistical noise

      const direction = diff > 0 ? 'increased' : 'decreased'
      const prevDate = new Date(prev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const absPct = Math.abs(pct).toFixed(1)
      const unitStr = trend.latestUnit ? ` ${trend.latestUnit}` : ''

      biggestChanges.push({
        biomarker: trend._id,
        direction,
        percentChange: parseFloat(absPct),
        prevValue: prev.value,
        currValue: curr.value,
        unit: trend.latestUnit,
        prevDate,
        currDate: new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        currentStatus: curr.status,
        summary: `${trend._id} ${direction} by ${absPct}% (${prev.value}${unitStr} → ${curr.value}${unitStr}) since ${prevDate}`
      })
    }

    // Largest absolute % change first
    biggestChanges.sort((a, b) => b.percentChange - a.percentChange)

    // ── Shape response ─────────────────────────────────────────────────
    const trends = rawTrends.map(t => ({
      biomarker: t._id,
      unit: t.latestUnit,
      latestReferenceRange: t.latestReferenceRange,
      dataPoints: t.dataPoints.map(dp => ({
        date: dp.date,
        reportId: dp.reportId,
        fileName: dp.fileName,
        value: dp.value,
        displayValue: dp.displayValue,
        unit: dp.unit,
        status: dp.status,
        reference_range: dp.reference_range
      }))
    }))

    res.json({
      success: true,
      totalBiomarkers: trends.length,
      trends,
      biggestChanges: biggestChanges.slice(0, 5)
    })
  } catch (error) {
    console.error('Get trends error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch biomarker trends'
    })
  }
})

// @route   GET /api/reports/:id
// @desc    Get a specific report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('Get report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    })
  }
})

// @route   DELETE /api/reports/:id
// @desc    Delete a specific report
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    })
  } catch (error) {
    console.error('Delete report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    })
  }
})

export default router
