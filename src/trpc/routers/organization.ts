// src/server/api/routers/organization.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

/**
 * Produce a unique URL-friendly slug derived from an organization name.
 *
 * @param name - The organization name used as the source for the slug
 * @returns The unique URL-friendly slug derived from `name`
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export const organizationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return auth.api.listOrganizations({
      headers: await headers(),
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, "Organization name must be at least 2 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = await generateUniqueSlug(input.name);
      try {
        return await auth.api.createOrganization({
          body: {
            name: input.name,
            slug,
            userId: ctx.auth.user.id,
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
              "An organization with this name already exists. Please try a different name.",
          });
        }
        throw error;
      }
    }),
});