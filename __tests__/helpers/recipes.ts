import crypto from "crypto";
import Recipe from "@/database/RecipeSchema";
import { normalizeNutrition } from "@/lib/nutrition";

// These functions are used for generating mock recipes for testing purpouses

export async function seedRecipes(count: number, overrides: any = {}) {
  const recipes = Array.from({ length: count }, () => {
    const id = crypto.randomUUID();
    return makeRecipe({
      ...overrides,
      _id: id,
      name: overrides.name ? `${overrides.name} ${id}` : `Vegetable Soup ${id}`,
    });
  });
  await Recipe.insertMany(recipes);
  return recipes;
}

export function makeIngredient(overrides = {}) {
  return {
    name: "Carrot",
    quantity: 2,
    units: "g",
    ...overrides,
  };
}

export function makeRecipe(overrides: any = {}) {
  const tags = overrides.tags ?? overrides.filters ?? ["Side", "Soup", "Vegetarian"];
  const id = overrides._id ?? crypto.randomUUID();

  return {
    _id: id,
    name: `Vegetable Soup ${id}`,
    serving: 4,
    tags,
    filters: overrides.filters ?? tags,
    ingredients: [makeIngredient(), makeIngredient({ name: "Potato", quantity: 3 })],
    instructions: "Chop vegetables and simmer.",
    comments: "Test fixture",
    nutritional_info: normalizeNutrition({ calories: 200, protein: 8, fat: 4, fiber: 6, sodium: 480 }),
    isDraft: false,
    ...overrides,
  };
}
