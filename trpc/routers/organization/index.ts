import slugify from "@sindresorhus/slugify";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { appConfig } from "@/config/app.config";
import { auth } from "@/lib/auth";
import { assertUserIsOrgMember } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import {
	createOrganizationSchema,
	getOrganizationByIdSchema,
} from "@/schemas/organization-schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { organizationRoomRouter } from "./organization-room-router";
import { organizationStudentRouter } from "./organization-student-router";

async function generateOrganizationSlug(name: string): Promise<string> {
	const baseSlug = slugify(name, {
		lowercase: true,
	});

	let slug = baseSlug;
	let hasAvailableSlug = false;

	for (let i = 0; i < 3; i++) {
		slug = `${baseSlug}-${nanoid(5)}`;

		const existing = await prisma.organization.findFirst({
			where: { slug },
			select: { id: true },
		});

		if (!existing) {
			hasAvailableSlug = true;
			break;
		}
	}

	if (!hasAvailableSlug) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No available slug found",
		});
	}

	return slug;
}

export const organizationRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const organizations = await prisma.organization.findMany({
			where: { members: { some: { userId: ctx.user.id } } },
			orderBy: { createdAt: "asc" },
			include: { _count: { select: { members: true } } },
		});

		return organizations.map((org) => ({
			...org,
			slug: org.slug ?? "",
			membersCount: org._count.members,
		}));
	}),
	get: protectedProcedure
		.input(getOrganizationByIdSchema)
		.query(async ({ ctx, input }) => {
			const { organization } = await assertUserIsOrgMember(
				input.id,
				ctx.user.id,
			);

			return organization;
		}),
	create: protectedProcedure
		.input(createOrganizationSchema)
		.mutation(async ({ ctx, input }) => {
			if (
				!appConfig.organizations.allowUserCreation &&
				ctx.user.role !== "admin"
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Organization creation is disabled. Contact an administrator.",
				});
			}

			const organization = await auth.api.createOrganization({
				headers: await headers(),
				body: {
					name: input.name,
					slug: await generateOrganizationSlug(input.name),
					metadata: input.metadata,
				},
			});

			if (!organization) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create organization",
				});
			}

			return organization;
		}),

	room: organizationRoomRouter,
	student: organizationStudentRouter,
});
