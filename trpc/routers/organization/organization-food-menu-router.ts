import { prisma } from "@/lib/db";
import {
	getMealMenuSchema,
	upsertFoodMenuSchema,
} from "@/schemas/organization-food-menu-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationFoodMenuRouter = createTRPCRouter({
	listAll: protectedOrganizationProcedure.query(async ({ ctx }) => {
		return prisma.foodMenu.findMany({
			where: { organizationId: ctx.organization.id },
		});
	}),

	getByMealType: protectedOrganizationProcedure
		.input(getMealMenuSchema)
		.query(async ({ ctx, input }) => {
			return prisma.foodMenu.findFirst({
				where: {
					organizationId: ctx.organization.id,
					mealType: input.mealType,
				},
			});
		}),

	upsert: protectedOrganizationProcedure
		.input(upsertFoodMenuSchema)
		.mutation(async ({ ctx, input }) => {
			const existing = await prisma.foodMenu.findFirst({
				where: {
					organizationId: ctx.organization.id,
					mealType: input.mealType,
				},
			});

			if (existing) {
				return prisma.foodMenu.update({
					where: { id: existing.id },
					data: {
						items: input.items,
						startTime: input.startTime,
						endTime: input.endTime,
					},
				});
			}

			return prisma.foodMenu.create({
				data: {
					organizationId: ctx.organization.id,
					mealType: input.mealType,
					items: input.items,
					startTime: input.startTime,
					endTime: input.endTime,
				},
			});
		}),
});
