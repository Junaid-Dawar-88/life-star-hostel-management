import { z } from "zod/v4";

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);

export const upsertFoodMenuSchema = z.object({
	mealType: mealTypeSchema,
	items: z.string().trim().min(1, "Menu items are required").max(2000),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
});

export const getMealMenuSchema = z.object({
	mealType: mealTypeSchema,
});

export type MealType = z.infer<typeof mealTypeSchema>;
export type UpsertFoodMenuInput = z.infer<typeof upsertFoodMenuSchema>;
