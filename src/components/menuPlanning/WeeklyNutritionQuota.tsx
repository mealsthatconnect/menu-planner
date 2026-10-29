"use client";

import { NUTRIENT_LABELS, WEEKLY_NUTRITION_GOALS } from "@/lib/types";
import type { Nutrition } from "@/lib/types";
import { sumNutrition } from "@/lib/nutrition";

interface WeeklyNutritionQuotaProps {
  dailyTotals: Nutrition[];
}

export default function WeeklyNutritionQuota({ dailyTotals }: WeeklyNutritionQuotaProps) {
  const weeklyTotals = sumNutrition(dailyTotals);

  return (
    <div className="mt-4 rounded-xl border border-pepper/20 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-montserrat text-base font-semibold text-pepper">Weekly Nutrition</h3>
      </div>

      <div className="flex flex-col gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit, isQuotaReference }) => {
          const current = weeklyTotals[key];
          const target = WEEKLY_NUTRITION_GOALS[key];
          const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 font-montserrat text-xs font-medium text-pepper">{label}</span>

              {isQuotaReference ? (
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-radish-900 transition-all" style={{ width: `${progress}%` }} />
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <span className="w-32 shrink-0 text-right font-montserrat text-xs text-pepper/70">
                {current}
                {isQuotaReference ? (
                  <span className="text-pepper/40">
                    {" "}
                    / {target} {unit}
                  </span>
                ) : (
                  <span className="text-pepper/40">
                    {" "}
                    {unit}
                    {target > 0 ? ` · max ${target}` : ""}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
