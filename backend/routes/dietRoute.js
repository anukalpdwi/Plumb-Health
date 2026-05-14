import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import DietLog from '../models/DietLog.js';
import { analyzeDietImage } from '../services/dietAnalyzer.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/diet/analyze
// @desc    Analyze a food photo and save to log
// @access  Private
router.post('/analyze', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const { mealType } = req.body;
    if (!mealType) {
      return res.status(400).json({ success: false, message: 'Meal type is required' });
    }

    console.log(`🍴 [Diet] Analyzing ${mealType} for user ${req.user.id}`);

    const analysis = await analyzeDietImage(req.file.buffer, req.file.mimetype);

    if (analysis.error) {
      return res.status(400).json({ success: false, message: analysis.error });
    }

    // Save to database
    const dietLog = new DietLog({
      user: req.user.id,
      mealType,
      imageMimeType: req.file.mimetype,
      ...analysis
    });

    await dietLog.save();

    res.json({
      success: true,
      message: 'Meal analyzed and logged successfully',
      data: dietLog
    });

  } catch (error) {
    console.error('Diet Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during diet analysis'
    });
  }
});

// @route   GET /api/diet/logs
// @desc    Get all diet logs for the user
// @access  Private
router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await DietLog.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/diet/summary
// @desc    Get daily/weekly summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startDate }
    });

    // Simple aggregation (can be improved with MongoDB aggregation pipeline)
    const summary = logs.reduce((acc, log) => {
      const dateStr = log.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          meals: []
        };
      }
      acc[dateStr].calories += log.nutrition?.calories?.value || 0;
      acc[dateStr].protein += log.nutrition?.protein?.value || 0;
      acc[dateStr].carbs += log.nutrition?.carbohydrates?.value || 0;
      acc[dateStr].fat += log.nutrition?.fat?.value || 0;
      acc[dateStr].meals.push({
        type: log.mealType,
        dish: log.dishName,
        calories: log.nutrition?.calories?.value || 0
      });
      return acc;
    }, {});

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
