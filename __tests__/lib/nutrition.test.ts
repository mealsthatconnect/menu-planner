import { hasMeaningfulNutrition, normalizeNutrition, sumNutrition } from "@/lib/nutrition";

describe("normalizeNutrition", () => {
  it("maps legacy fatPercentage fields onto current keys", () => {
    const nutrition = normalizeNutrition({
      calories: 100,
      // Legacy Mongo shape from before the schema rename.
      fatPercentage: 12,
      saturatedFatPercentage: 3,
    } as any);

    expect(nutrition.calories).toBe(100);
    expect(nutrition.fat).toBe(12);
    expect(nutrition.saturatedFat).toBe(3);
    expect(nutrition.protein).toBe(0);
  });

  it("prefers current keys over legacy aliases", () => {
    const nutrition = normalizeNutrition({
      fat: 8,
      fatPercentage: 99,
      saturatedFat: 2,
      saturatedFatPercentage: 50,
    } as any);

    expect(nutrition.fat).toBe(8);
    expect(nutrition.saturatedFat).toBe(2);
  });
});

describe("hasMeaningfulNutrition", () => {
  it("returns false for missing or all-zero nutrition", () => {
    expect(hasMeaningfulNutrition(undefined)).toBe(false);
    expect(hasMeaningfulNutrition(null)).toBe(false);
    expect(hasMeaningfulNutrition({ calories: 0, protein: 0 })).toBe(false);
  });

  it("returns true for legacy non-zero values", () => {
    expect(hasMeaningfulNutrition({ fatPercentage: 4 } as any)).toBe(true);
  });
});

describe("sumNutrition", () => {
  it("sums normalized values including legacy aliases", () => {
    const total = sumNutrition([{ fatPercentage: 4 } as any, { fat: 6 }]);
    expect(total.fat).toBe(10);
  });
});
