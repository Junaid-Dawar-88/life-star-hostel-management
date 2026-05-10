import { z } from "zod/v4";

export const recordPaymentSchema = z.object({
	studentId: z.string().uuid(),
	amount: z.number().int().min(0),
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2020),
	notes: z.string().trim().max(500).optional(),
});

export const listPaymentsByMonthSchema = z.object({
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2020),
});

export const listPaymentsByStudentSchema = z.object({
	studentId: z.string().uuid(),
});

export const deletePaymentSchema = z.object({
	id: z.string().uuid(),
});

export const updatePaymentSchema = z.object({
	id: z.string().uuid(),
	amount: z.number().int().min(1),
	notes: z.string().trim().max(500).optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
