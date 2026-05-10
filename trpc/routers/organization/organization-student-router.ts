import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import {
	createStudentSchema,
	deleteStudentSchema,
	listStudentsSchema,
	setFeeForAllSchema,
	updateStudentSchema,
} from "@/schemas/organization-student-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationStudentRouter = createTRPCRouter({
	list: protectedOrganizationProcedure
		.input(listStudentsSchema)
		.query(async ({ ctx, input }) => {
			return prisma.student.findMany({
				where: {
					organizationId: ctx.organization.id,
					...(input.roomId && { roomId: input.roomId }),
					...(input.query && {
						name: { contains: input.query, mode: "insensitive" },
					}),
				},
				orderBy: { createdAt: "asc" },
			});
		}),

	create: protectedOrganizationProcedure
		.input(createStudentSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify the room belongs to this organization
			const room = await prisma.room.findFirst({
				where: { id: input.roomId, organizationId: ctx.organization.id },
				include: { _count: { select: { students: true } } },
			});
			if (!room) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
			}

			const capacity = Number(room.seatType.charAt(0));
			if (room._count.students >= capacity) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Room is at full capacity",
				});
			}

			return prisma.student.create({
				data: {
					...input,
					organizationId: ctx.organization.id,
				},
			});
		}),

	update: protectedOrganizationProcedure
		.input(updateStudentSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			const result = await prisma.student.updateMany({
				where: { id, organizationId: ctx.organization.id },
				data,
			});
			if (result.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			return prisma.student.findUnique({ where: { id } });
		}),

	delete: protectedOrganizationProcedure
		.input(deleteStudentSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.student.deleteMany({
				where: { id: input.id, organizationId: ctx.organization.id },
			});
			if (result.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			return { success: true };
		}),

	setFeeForAll: protectedOrganizationProcedure
		.input(setFeeForAllSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.student.updateMany({
				where: { organizationId: ctx.organization.id },
				data: { fee: input.fee },
			});
			return { updatedCount: result.count };
		}),
});
