
import mongoose from 'mongoose';
import { DAYS, MEAL_TYPES, LIMITS } from '../constants.js';
import { isRealDate } from '../utils/dates.js';
import { jsonOptions } from './toJSON.js';

const entrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'day is required'],
      enum: { values: DAYS, message: `day must be one of: ${DAYS.join(', ')}` },
    },
    mealType: {
      type: String,
      required: [true, 'mealType is required'],
      enum: { values: MEAL_TYPES, message: `mealType must be one of: ${MEAL_TYPES.join(', ')}` },
    },
    // The relation: every entry points at a Recipe document.
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'recipeId is required'],
      cast: 'recipeId must be a valid recipe id',
    },
    
batches: {
  type: Number,
  default: 1,
  min: 1,
  max: 20,
  validate: Number.isInteger,
},

    notes: {
      type: String,
      trim: true,
      maxlength: [LIMITS.notes, `notes must be ${LIMITS.notes} characters or fewer`],
    },
  },
  { _id: false },
);

const mealPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name is required'],
      maxlength: [LIMITS.planName, `name must be ${LIMITS.planName} characters or fewer`],
    },
    // Kept as a YYYY-MM-DD string (the same shape the API has always used).
    weekStart: {
      type: String,
      trim: true,
      required: [true, 'weekStart is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'weekStart must look like YYYY-MM-DD'],
      validate: { validator: isRealDate, message: 'weekStart must be a real date' },
    },
    checkedGroceries: {
  type: [String],
  default: [],
},
    entries: {
      type: [entrySchema],
      default: [],
      validate: {
        validator: (list) => !Array.isArray(list) || list.length <= LIMITS.maxEntries,
        message: `a meal plan can have at most ${LIMITS.maxEntries} entries`,
      },
    },
  },
  { timestamps: true, toJSON: jsonOptions },
);

// Deleting a recipe looks up the plans that use it.
mealPlanSchema.index({ 'entries.recipeId': 1 });

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);


