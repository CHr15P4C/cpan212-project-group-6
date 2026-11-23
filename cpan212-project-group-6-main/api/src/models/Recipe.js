import mongoose from 'mongoose';
import { LIMITS } from '../constants.js';
import { jsonOptions } from './toJSON.js';

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'ingredient name is required'],
      maxlength: [LIMITS.ingredientName, `ingredient name must be ${LIMITS.ingredientName} characters or fewer`],
    },
    measure: {
      type: String,
      trim: true,
      default: '',
      maxlength: [LIMITS.ingredientMeasure, `measure must be ${LIMITS.ingredientMeasure} characters or fewer`],
    },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'title is required'],
      maxlength: [LIMITS.title, `title must be ${LIMITS.title} characters or fewer`],
    },
    ingredients: {
      type: [ingredientSchema],
      validate: [
        {
          validator: (list) => Array.isArray(list) && list.length >= 1,
          message: 'at least one ingredient is required',
        },
        {
          validator: (list) => !Array.isArray(list) || list.length <= LIMITS.maxIngredients,
          message: `a recipe can have at most ${LIMITS.maxIngredients} ingredients`,
        },
      ],
    },
    instructions: {
      type: String,
      trim: true,
      required: [true, 'instructions are required'],
      maxlength: [LIMITS.instructions, `instructions must be ${LIMITS.instructions} characters or fewer`],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [LIMITS.category, `category must be ${LIMITS.category} characters or fewer`],
    },
    area: {
      type: String,
      trim: true,
      maxlength: [LIMITS.area, `area must be ${LIMITS.area} characters or fewer`],
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [LIMITS.imageUrl, `imageUrl must be ${LIMITS.imageUrl} characters or fewer`],
      validate: { validator: isHttpUrl, message: 'imageUrl must be a valid URL' },
    },
    sourceMealId: {
      type: String,
      trim: true,
      maxlength: [LIMITS.sourceMealId, `sourceMealId must be ${LIMITS.sourceMealId} characters or fewer`],
    },
  },
  { timestamps: true, toJSON: jsonOptions },
);

// The list page filters on category and sorts by date added by default.
recipeSchema.index({ category: 1 });
recipeSchema.index({ createdAt: -1 });

export const Recipe = mongoose.model('Recipe', recipeSchema);
