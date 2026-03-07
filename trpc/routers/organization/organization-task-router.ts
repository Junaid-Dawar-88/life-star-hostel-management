import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import {
  createTaskSchema,
  deleteTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "@/schemas/organization-task-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationTaskRouter = createTRPCRouter({
  list: protectedOrganizationProcedure
    .input(listTasksSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        organizationId: ctx.organization.id,
        ...(input.query && {
          title: { contains: input.query, mode: "insensitive" as const },
        }),
        ...(input.filters?.status?.length && {
          status: { in: input.filters.status },
        }),
        ...(input.filters?.priority?.length && {
          priority: { in: input.filters.priority },
        }),
      };

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { [input.sortBy]: input.sortOrder },
        }),
        prisma.task.count({ where }),
      ]);

      return { tasks, total };
    }),

  create: protectedOrganizationProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.task.create({
        data: { ...input, organizationId: ctx.organization.id },
      });
    }),

  update: protectedOrganizationProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await prisma.task.updateMany({
        where: { id, organizationId: ctx.organization.id },
        data,
      });
      if (result.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return prisma.task.findUnique({ where: { id } });
    }),

  delete: protectedOrganizationProcedure
    .input(deleteTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.task.deleteMany({
        where: { id: input.id, organizationId: ctx.organization.id },
      });
      if (result.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return { success: true };
    }),
});