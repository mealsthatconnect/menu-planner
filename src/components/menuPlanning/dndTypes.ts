import type { Combo, Recipe, RecipeNutritionOnly } from "@/lib/types";

export type SidebarDragData =
  | {
      source: "sidebar";
      itemType: "recipe";
      item: Recipe;
    }
  | {
      source: "sidebar";
      itemType: "combo";
      item: Combo;
    };

export type CalendarDragData = {
  source: "calendar";
  item: RecipeNutritionOnly;
  dayId: string;
};

export type ActiveDragData = SidebarDragData | CalendarDragData;

export type DropZoneData =
  | {
      dest: "calendar";
      dayId: string;
    }
  | {
      dest: "trash";
    }
  | {
      dest: "sidebar";
    };
