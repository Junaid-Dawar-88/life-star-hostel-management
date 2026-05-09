import { z } from "zod/v4";

export const listStudentsSchema = z.object({
	roomId: z.string().uuid().optional(),
	query: z.string().optional(),
});

export const createStudentSchema = z.object({
	roomId: z.string().uuid(),
	name: z.string().trim().min(1, "Student name is required").max(200),
	fatherName: z.string().trim().min(1, "Father name is required").max(200),
	nic: z.string().regex(/^\d{13}$|^\d{5}-\d{7}-\d{1}$/, "Invalid NIC format"),
	phone: z
		.string()
		.min(10, "Phone number is required")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
	guardianPhone: z
		.string()
		.min(10, "Guardian phone is required")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
	address: z.string().trim().min(1, "Address is required").max(500),
	fee: z.number().int().min(0),
	remainingFee: z.number().int().min(0),
	picture: z.string().optional(),
});

export const updateStudentSchema = z.object({
	id: z.string().uuid(),
	name: z.string().trim().min(1).max(200).optional(),
	fatherName: z.string().trim().min(1).max(200).optional(),
	nic: z
		.string()
		.regex(/^\d{13}$|^\d{5}-\d{7}-\d{1}$/, "Invalid NIC format")
		.optional(),
	phone: z
		.string()
		.min(10)
		.regex(/^[0-9+\-\s()]+$/)
		.optional(),
	guardianPhone: z
		.string()
		.min(10)
		.regex(/^[0-9+\-\s()]+$/)
		.optional(),
	address: z.string().trim().min(1).max(500).optional(),
	fee: z.number().int().min(0).optional(),
	remainingFee: z.number().int().min(0).optional(),
	picture: z.string().optional().nullable(),
});

export const deleteStudentSchema = z.object({
	id: z.string().uuid(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
