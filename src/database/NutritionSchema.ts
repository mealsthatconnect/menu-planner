import { Schema } from "mongoose";

const NutritionSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    transFat: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
  },
  { _id: false },
);

export default NutritionSchema;
