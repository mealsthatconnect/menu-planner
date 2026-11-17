import { withMongo } from "../helpers/mongo";
import { getCalendarNutritionSummaries } from "@/database/calendarNutrition";
import Calendar from "@/database/CalendarSchema";
import Combo from "@/database/ComboSchema";
import Recipe from "@/database/RecipeSchema";
import { makeCombo } from "../helpers/combos";
import { makeRecipe } from "../helpers/recipes";
import { emptyNutrition, normalizeNutrition } from "@/lib/nutrition";

withMongo();

describe("getCalendarNutritionSummaries", () => {
  it("falls back to summing combo recipes when combo nutrition is wiped/zero", async () => {
    const entree = makeRecipe({
      nutritional_info: normalizeNutrition({ calories: 250, protein: 20 }),
    });
    const vegetable = makeRecipe({
      nutritional_info: normalizeNutrition({ calories: 50, fiber: 4 }),
    });
    await Recipe.insertMany([entree, vegetable]);

    const combo = makeCombo({
      entrees: [entree._id],
      vegetables: [vegetable._id],
      nutritional_info: emptyNutrition(),
    });
    await Combo.create(combo);

    await Calendar.create({
      _id: "20260105",
      entrees: [combo._id],
      vegetables: [],
      fruits: [],
      grains: [],
      nutritional_info: emptyNutrition(),
    });

    const [summary] = await getCalendarNutritionSummaries(["20260105"]);

    expect(summary.nutritional_info.calories).toBe(300);
    expect(summary.nutritional_info.protein).toBe(20);
    expect(summary.nutritional_info.fiber).toBe(4);
  });

  it("uses stored combo nutrition when it has meaningful values", async () => {
    const entree = makeRecipe({
      nutritional_info: normalizeNutrition({ calories: 250 }),
    });
    await Recipe.create(entree);

    const combo = makeCombo({
      entrees: [entree._id],
      nutritional_info: normalizeNutrition({ calories: 999, protein: 40 }),
    });
    await Combo.create(combo);

    await Calendar.create({
      _id: "20260106",
      entrees: [combo._id],
      vegetables: [],
      fruits: [],
      grains: [],
      nutritional_info: emptyNutrition(),
    });

    const [summary] = await getCalendarNutritionSummaries(["20260106"]);

    expect(summary.nutritional_info.calories).toBe(999);
    expect(summary.nutritional_info.protein).toBe(40);
  });
});
