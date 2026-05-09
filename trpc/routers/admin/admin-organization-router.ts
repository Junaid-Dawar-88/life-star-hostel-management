import type { Prisma } from "@prisma/client";
import { InvitationStatus } from "@prisma/client";
import { appendAnd, prisma } from "@/lib/db";
import {
	deleteOrganizationAdminSchema,
	exportOrganizationsAdminSchema,
	listOrganizationsAdminSchema,
} from "@/schemas/admin-organization-schemas";
import { createTRPCRouter, protectedAdminProcedure } from "@/trpc/init";

export const adminOrganizationRouter = createTRPCRouter({
	list: protectedAdminProcedure
		.input(listOrganizationsAdminSchema)
		.query(async ({ input }) => {
			const where: Prisma.OrganizationWhereInput = {};

			if (input.query) {
				where.name = { contains: input.query, mode: "insensitive" };
			}

			if (input.filters?.createdAt?.length) {
				const now = new Date();
				const dateOr: Prisma.OrganizationWhereInput[] = [];
				for (const range of input.filters.createdAt) {
					switch (range) {
						case "today": {
							const start = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate(),
							);
							const end = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate() + 1,
							);
							dateOr.push({ createdAt: { gte: start, lt: end } });
							break;
						}
						case "this-week": {
							const weekStart = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate() - now.getDay(),
							);
							dateOr.push({ createdAt: { gte: weekStart } });
							break;
						}
						case "this-month": {
							const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
							dateOr.push({ createdAt: { gte: monthStart } });
							break;
						}
						case "older": {
							const monthAgo = new Date(
								now.getFullYear(),
								now.getMonth() - 1,
								now.getDate(),
							);
							dateOr.push({ createdAt: { lte: monthAgo } });
							break;
						}
					}
				}
				if (dateOr.length) appendAnd(where, { OR: dateOr });
			}

			if (input.filters?.membersCount?.length) {
				const matchingOrgIds = new Set<string>();
				const counts = await prisma.member.groupBy({
					by: ["organizationId"],
					_count: { _all: true },
				});

				for (const c of counts) {
					const memberCount = c._count._all;
					for (const range of input.filters.membersCount) {
						if (range === "0" && memberCount === 0)
							matchingOrgIds.add(c.organizationId);
						if (range === "1-5" && memberCount >= 1 && memberCount <= 5)
							matchingOrgIds.add(c.organizationId);
						if (range === "6-10" && memberCount >= 6 && memberCount <= 10)
							matchingOrgIds.add(c.organizationId);
						if (range === "11+" && memberCount > 10)
							matchingOrgIds.add(c.organizationId);
					}
				}

				if (input.filters.membersCount.includes("0")) {
					const orgsWithMembers = new Set(counts.map((c) => c.organizationId));
					const zeroMemberOrgs = await prisma.organization.findMany({
						where: { id: { notIn: Array.from(orgsWithMembers) } },
						select: { id: true },
					});
					for (const o of zeroMemberOrgs) matchingOrgIds.add(o.id);
				}

				if (matchingOrgIds.size === 0) {
					return { organizations: [], total: 0 };
				}
				appendAnd(where, { id: { in: Array.from(matchingOrgIds) } });
			}

			const order = input.sortOrder === "desc" ? "desc" : "asc";
			const orderBy: Prisma.OrganizationOrderByWithRelationInput =
				input.sortBy === "createdAt" ? { createdAt: order } : { name: order };

			const [organizations, total] = await Promise.all([
				prisma.organization.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy,
					include: {
						_count: { select: { members: true } },
					},
				}),
				prisma.organization.count({ where }),
			]);

			const orgIds = organizations.map((o) => o.id);
			const pendingInvites =
				orgIds.length > 0
					? await prisma.invitation.groupBy({
							by: ["organizationId"],
							where: {
								organizationId: { in: orgIds },
								status: InvitationStatus.pending,
							},
							_count: { _all: true },
						})
					: [];
			const pendingMap = new Map(
				pendingInvites.map((p) => [p.organizationId, p._count._all]),
			);

			const shaped = organizations.map((o) => ({
				id: o.id,
				name: o.name,
				logo: o.logo,
				createdAt: o.createdAt,
				metadata: o.metadata,
				membersCount: o._count.members,
				pendingInvites: pendingMap.get(o.id) ?? 0,
			}));

			return { organizations: shaped, total };
		}),

	delete: protectedAdminProcedure
		.input(deleteOrganizationAdminSchema)
		.mutation(async ({ input }) => {
			await prisma.organization.delete({ where: { id: input.id } });
		}),

	exportSelectedToCsv: protectedAdminProcedure
		.input(exportOrganizationsAdminSchema)
		.mutation(async ({ input }) => {
			const organizations = await prisma.organization.findMany({
				where: { id: { in: input.organizationIds } },
				select: {
					id: true,
					name: true,
					createdAt: true,
					updatedAt: true,
					_count: { select: { members: true } },
					invitations: {
						where: { status: "pending" },
						select: { id: true },
					},
				},
			});

			const flattened = organizations.map((org) => ({
				id: org.id,
				name: org.name,
				membersCount: org._count.members,
				pendingInvites: org.invitations.length,
				createdAt: org.createdAt,
				updatedAt: org.updatedAt,
			}));

			const Papa = await import("papaparse");
			return Papa.unparse(flattened);
		}),

	exportSelectedToExcel: protectedAdminProcedure
		.input(exportOrganizationsAdminSchema)
		.mutation(async ({ input }) => {
			const organizations = await prisma.organization.findMany({
				where: { id: { in: input.organizationIds } },
				select: {
					id: true,
					name: true,
					createdAt: true,
					updatedAt: true,
					_count: { select: { members: true } },
					invitations: {
						where: { status: "pending" },
						select: { id: true },
					},
				},
			});

			const ExcelJS = await import("exceljs");
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Organizations");

			if (organizations.length > 0) {
				worksheet.columns = [
					{ header: "ID", key: "id", width: 40 },
					{ header: "Name", key: "name", width: 30 },
					{ header: "Members", key: "membersCount", width: 15 },
					{ header: "Pending Invites", key: "pendingInvites", width: 15 },
					{ header: "Created At", key: "createdAt", width: 25 },
					{ header: "Updated At", key: "updatedAt", width: 25 },
				];

				for (const org of organizations) {
					worksheet.addRow({
						id: org.id,
						name: org.name,
						membersCount: org._count.members,
						pendingInvites: org.invitations.length,
						createdAt: org.createdAt,
						updatedAt: org.updatedAt,
					});
				}
			}

			const buffer = await workbook.xlsx.writeBuffer();
			return Buffer.from(buffer).toString("base64");
		}),
});
