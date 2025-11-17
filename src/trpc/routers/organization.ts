// src/server/api/routers/organization.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

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
  count: protectedProcedure.query(async (ctx) => {
    return auth.api
      .listOrganizations({ headers: await headers() })
      .then((orgs) => orgs.length);
  }),

  invitationCount: protectedProcedure.query(async (ctx) => {
    return auth.api
      .listInvitations({ headers: await headers() })
      .then((invitations) => invitations.length);
  }),

  pendingInvitation: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      return prisma.invitation.findMany({
        where: { organizationId: ctx.input.text, status: "pending" },
      });
    }),

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
