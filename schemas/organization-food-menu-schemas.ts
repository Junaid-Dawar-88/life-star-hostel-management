import { z } from "zod/v4";

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);

// 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
export const dayOfWeekSchema = z.number().int().min(0).max(6);

export const upsertFoodMenuSchema = z.object({
	dayOfWeek: dayOfWeekSchema,
	mealType: mealTypeSchema,
	items: z.string().trim().min(1, "Menu items are required").max(2000),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
});

export const getMealMenuSchema = z.object({
	dayOfWeek: dayOfWeekSchema,
	mealType: mealTypeSchema,
});

export const getDayMenuSchema = z.object({
	dayOfWeek: dayOfWeekSchema,
});

export type MealType = z.infer<typeof mealTypeSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type UpsertFoodMenuInput = z.infer<typeof upsertFoodMenuSchema>;
