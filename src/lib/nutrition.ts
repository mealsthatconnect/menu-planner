import { NUTRITION_KEYS, Nutrition, WEEKLY_NUTRITION_GOALS, ZERO_NUTRITION } from "./types";

export const EMPTY_NUTRITION: Nutrition = { ...ZERO_NUTRITION };

export const DAILY_NUTRITION_GOALS: Nutrition = {
  calories: WEEKLY_NUTRITION_GOALS.calories / 5,
  protein: WEEKLY_NUTRITION_GOALS.protein / 5,
  carbs: WEEKLY_NUTRITION_GOALS.carbs / 5,
  fat: WEEKLY_NUTRITION_GOALS.fat / 5,
  saturatedFat: WEEKLY_NUTRITION_GOALS.saturatedFat / 5,
  transFat: WEEKLY_NUTRITION_GOALS.transFat / 5,
  cholesterol: WEEKLY_NUTRITION_GOALS.cholesterol / 5,
  fiber: WEEKLY_NUTRITION_GOALS.fiber / 5,
  calcium: WEEKLY_NUTRITION_GOALS.calcium / 5,
  iron: WEEKLY_NUTRITION_GOALS.iron / 5,
  sodium: WEEKLY_NUTRITION_GOALS.sodium / 5,
  vitaminA: WEEKLY_NUTRITION_GOALS.vitaminA / 5,
  vitaminC: WEEKLY_NUTRITION_GOALS.vitaminC / 5,
};

export type NutritionSummary = {
  _id: string;
  nutritional_info: Nutrition;
};

export function emptyNutrition(): Nutrition {
  return { ...EMPTY_NUTRITION };
}

export function normalizeNutrition(nutrition?: Partial<Nutrition> | null): Nutrition {
  const result = emptyNutrition();

  for (const key of NUTRITION_KEYS) {
    result[key] = Number(nutrition?.[key]) || 0;
  }

  return result;
}

export function sumNutrition(items: Array<Partial<Nutrition> | null | undefined>): Nutrition {
  return items.reduce<Nutrition>((total, item) => {
    const next = normalizeNutrition(item);
    const result = emptyNutrition();

    for (const key of NUTRITION_KEYS) {
      result[key] = total[key] + next[key];
    }

    return result;
  }, emptyNutrition());
}

export function scaleNutrition(nutrition: Nutrition, multiplier: number): Nutrition {
  const result = emptyNutrition();

  for (const key of NUTRITION_KEYS) {
    result[key] = (nutrition[key] || 0) * multiplier;
  }

  return result;
}
