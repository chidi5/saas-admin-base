import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export const projectRouter = createTRPCRouter({
  count: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const count = await prisma.project.count({
        where: { organizationId: ctx.input.text },
      });

      return count;
    }),

  list: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const projects = await prisma.project.findMany({
        where: { organizationId: ctx.input.text },
        orderBy: {
          createdAt: "desc",
        },
      });

      return projects;
    }),

  listFullProject: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const organization = await auth.api.getFullOrganization({
        query: {
          organizationId: ctx.input.text,
        },
        headers: await headers(),
      });

      const projects = await prisma.project.findMany({
        where: { organizationId: ctx.input.text },
      });

      return { organization, projects };
    }),

  recentProject: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const projects = await prisma.project.findMany({
        where: { organizationId: ctx.input.text },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          organization: true,
        },
      });
      return projects;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Project name must be at least 2 characters"),
        description: z.string().optional(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = await generateUniqueSlug(input.name);
      try {
        return await prisma.project.create({
          data: {
            name: input.name,
            slug,
            description: input.description,
            organizationId: input.organizationId,
          },
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A project with this name already exists. Please try a different name.",
          });
        }
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(2, "Project name must be at least 2 characters")
          .optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingProject = await prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const organization = await prisma.organization.findUnique({
        where: {
          id: existingProject.organizationId,
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this project",
        });
      }

      let slug = existingProject.slug;
      if (input.name && input.name !== existingProject.name) {
        slug = await generateUniqueSlug(input.name, input.id);
      }

      try {
        return await prisma.project.update({
          where: { id: input.id },
          data: {
            ...(input.name && { name: input.name, slug }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
          },
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A project with this name already exists. Please try a different name.",
          });
        }
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingProject = await prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const organization = await prisma.organization.findUnique({
        where: {
          id: existingProject.organizationId,
        },
        include: {
          members: {
            where: { userId: ctx.auth.user.id },
          },
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to delete this project",
        });
      }

      if (
        organization.members.length === 0 ||
        (organization.members[0].role !== "owner" &&
          organization.members[0].role !== "admin")
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners or admins can delete projects",
        });
      }

      try {
        return await prisma.project.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
        });
      }
    }),
});
