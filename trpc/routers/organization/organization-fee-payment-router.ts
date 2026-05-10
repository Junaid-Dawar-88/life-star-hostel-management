import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import {
	deletePaymentSchema,
	listPaymentsByMonthSchema,
	listPaymentsByStudentSchema,
	recordPaymentSchema,
	updatePaymentSchema,
} from "@/schemas/organization-fee-payment-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationFeePaymentRouter = createTRPCRouter({
	// Record (or update) a payment for a student for a specific month/year
	recordPayment: protectedOrganizationProcedure
		.input(recordPaymentSchema)
		.mutation(async ({ ctx, input }) => {
			const student = await prisma.student.findFirst({
				where: { id: input.studentId, organizationId: ctx.organization.id },
			});
			if (!student) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}

			return prisma.feePayment.upsert({
				where: {
					studentId_month_year: {
						studentId: input.studentId,
						month: input.month,
						year: input.year,
					},
				},
				create: {
					organizationId: ctx.organization.id,
					studentId: input.studentId,
					amount: input.amount,
					month: input.month,
					year: input.year,
					notes: input.notes,
				},
				update: {
					amount: input.amount,
					notes: input.notes,
				},
			});
		}),

	// List all students with their paid/unpaid status for a given month
	listByMonth: protectedOrganizationProcedure
		.input(listPaymentsByMonthSchema)
		.query(async ({ ctx, input }) => {
			const students = await prisma.student.findMany({
				where: { organizationId: ctx.organization.id },
				include: {
					room: { select: { id: true, name: true } },
					feePayments: {
						where: { month: input.month, year: input.year },
					},
				},
				orderBy: { name: "asc" },
			});

			return students.map((student) => ({
				id: student.id,
				name: student.name,
				fatherName: student.fatherName,
				phone: student.phone,
				fee: student.fee,
				picture: student.picture,
				room: student.room,
				payment: student.feePayments[0] ?? null,
			}));
		}),

	// Full payment history for a single student
	listByStudent: protectedOrganizationProcedure
		.input(listPaymentsByStudentSchema)
		.query(async ({ ctx, input }) => {
			const student = await prisma.student.findFirst({
				where: { id: input.studentId, organizationId: ctx.organization.id },
			});
			if (!student) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}

			return prisma.feePayment.findMany({
				where: {
					studentId: input.studentId,
					organizationId: ctx.organization.id,
				},
				orderBy: [{ year: "desc" }, { month: "desc" }],
			});
		}),

	// Update an existing payment record
	updatePayment: protectedOrganizationProcedure
		.input(updatePaymentSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.feePayment.updateMany({
				where: { id: input.id, organizationId: ctx.organization.id },
				data: { amount: input.amount, notes: input.notes },
			});
			if (result.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}
			return { success: true };
		}),

	// Remove a payment record (undo payment)
	deletePayment: protectedOrganizationProcedure
		.input(deletePaymentSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.feePayment.deleteMany({
				where: { id: input.id, organizationId: ctx.organization.id },
			});
			if (result.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}
			return { success: true };
		}),
});
