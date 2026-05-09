import { z } from "zod/v4";
import { appConfig } from "@/config/app.config";

export const OrganizationSortField = z.enum([
	"name",
	"membersCount",
	"createdAt",
]);
export type OrganizationSortField = z.infer<typeof OrganizationSortField>;

export const listOrganizationsAdminSchema = z.object({
	query: z.coerce.string().max(200).optional(),
	limit: z.coerce
		.number()
		.min(1)
		.max(appConfig.pagination.maxLimit)
		.default(appConfig.pagination.defaultLimit),
	offset: z.coerce.number().min(0).default(0),
	sortBy: OrganizationSortField.default("name"),
	sortOrder: z.enum(["asc", "desc"]).default("asc"),
	filters: z
		.object({
			membersCount: z.array(z.enum(["0", "1-5", "6-10", "11+"])).optional(),
			createdAt: z
				.array(z.enum(["today", "this-week", "this-month", "older"]))
				.optional(),
		})
		.optional(),
});

export const deleteOrganizationAdminSchema = z.object({
	id: z.string().uuid(),
});

export const exportOrganizationsAdminSchema = z.object({
	organizationIds: z.array(z.string().uuid()).min(1).max(1000),
});

export type GetOrganizationsAdminInput = z.infer<
	typeof listOrganizationsAdminSchema
>;
export type DeleteOrganizationAdminInput = z.infer<
	typeof deleteOrganizationAdminSchema
>;
export type ExportOrganizationsAdminInput = z.infer<
	typeof exportOrganizationsAdminSchema
>;
