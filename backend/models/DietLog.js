import mongoose from 'mongoose';

const DietLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
  imageUrl: { type: String },        // optional: store in Cloudinary or as base64 ref
  imageMimeType: { type: String },

  // AI Analysis Result
  dishName: { type: String },        // e.g. "Dal Tadka with Rice"
  cuisineType: { type: String },     // e.g. "Indian", "Continental"
  portionSize: { type: String },     // e.g. "Medium bowl (~300g)"
  confidenceScore: { type: Number }, // 0-100, how confident Gemini is

  nutrition: {
    calories:     { value: Number, unit: { type: String, default: 'kcal' } },
    protein:      { value: Number, unit: { type: String, default: 'g' } },
    carbohydrates:{ value: Number, unit: { type: String, default: 'g' } },
    fat:          { value: Number, unit: { type: String, default: 'g' } },
    fiber:        { value: Number, unit: { type: String, default: 'g' } },
    sugar:        { value: Number, unit: { type: String, default: 'g' } },
    sodium:       { value: Number, unit: { type: String, default: 'mg' } },
    water:        { value: Number, unit: { type: String, default: 'ml' } },
  },

  ingredients: [{ name: String, estimatedWeight: String }],
  healthFlags: [String],   // e.g. ["High Sodium", "Low Fiber", "Good Protein Source"]
  aiSuggestion: String,    // e.g. "Consider adding a salad to balance this meal"
  warningFlags: [String],  // e.g. ["Exceeds daily sodium limit"]
}, { timestamps: true });

// Index for efficient user-specific queries
DietLogSchema.index({ user: 1, date: -1 });

const DietLog = mongoose.model('DietLog', DietLogSchema);

export default DietLog;
