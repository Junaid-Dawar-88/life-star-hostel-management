import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import {
	createRoomSchema,
	deleteRoomSchema,
	listRoomsSchema,
	updateRoomSchema,
} from "@/schemas/organization-room-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationRoomRouter = createTRPCRouter({
	list: protectedOrganizationProcedure
		.input(listRoomsSchema)
		.query(async ({ ctx, input }) => {
			return prisma.room.findMany({
				where: {
					organizationId: ctx.organization.id,
					...(input.query && {
						name: { contains: input.query, mode: "insensitive" },
					}),
				},
				include: {
					students: true,
				},
				orderBy: [{ floor: "asc" }, { name: "asc" }],
			});
		}),

	create: protectedOrganizationProcedure
		.input(createRoomSchema)
		.mutation(async ({ ctx, input }) => {
			return prisma.room.create({
				data: {
					...input,
					floor: Number(input.floor),
					organizationId: ctx.organization.id,
				},
				include: { students: true },
			});
		}),

	update: protectedOrganizationProcedure
		.input(updateRoomSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, floor, ...rest } = input;
			const result = await prisma.room.updateMany({
				where: { id, organizationId: ctx.organization.id },
				data: {
					...rest,
					...(floor !== undefined && { floor: Number(floor) }),
				},
			});
			if (result.count === 0) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
			}
			return prisma.room.findUnique({
				where: { id },
				include: { students: true },
			});
		}),

	delete: protectedOrganizationProcedure
		.input(deleteRoomSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.room.deleteMany({
				where: { id: input.id, organizationId: ctx.organization.id },
			});
			if (result.count === 0) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
			}
			return { success: true };
		}),
});
