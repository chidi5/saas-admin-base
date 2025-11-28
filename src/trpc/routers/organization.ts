// src/server/api/routers/organization.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";

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

  // members logic

  listMembers: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await auth.api.listMembers({
        query: {
          organizationId: input.orgId,
          sortBy: "createdAt",
          sortDirection: "asc",
        },
        headers: await headers(),
      });

      return members;
    }),

  listInvitations: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitations = await auth.api.listInvitations({
        query: {
          organizationId: input.orgId,
        },
        headers: await headers(),
      });

      return invitations;
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        memberId: z.string(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user has permission (owner or admin)
      const organization = await auth.api.getFullOrganization({
        query: { organizationId: input.orgId },
        headers: await headers(),
      });

      const currentMember = organization?.members.find(
        (m) => m.userId === ctx.auth.user.id
      );

      if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update roles",
        });
      }

      // Can't change owner role
      const targetMember = await prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (targetMember?.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change owner role",
        });
      }

      // Only owner can assign admin role
      if (input.role === "admin" && currentMember.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can assign admin role",
        });
      }

      return auth.api.updateMemberRole({
        body: { memberId: input.memberId, role: input.role },
        headers: await headers(),
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const organization = await auth.api.getFullOrganization({
        query: { organizationId: input.orgId },
        headers: await headers(),
      });

      const currentMember = organization?.members.find(
        (m) => m.userId === ctx.auth.user.id
      );

      if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to remove members",
        });
      }

      // Can't remove owner
      const targetMember = await prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (targetMember?.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove organization owner",
        });
      }

      // Admins can't remove other admins
      if (currentMember.role === "admin" && targetMember?.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admins cannot remove other admins",
        });
      }

      return auth.api.removeMember({
        body: { memberIdOrEmail: input.memberId, organizationId: input.orgId },
        headers: await headers(),
      });
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        email: z.string().email(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.createInvitation({
        body: {
          email: input.email,
          organizationId: input.orgId,
          role: input.role,
        },
        headers: await headers(),
      });

      return { success: true };
    }),

  resendInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { id: input.invitationId },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      await auth.api.createInvitation({
        body: {
          email: invitation.email,
          organizationId: invitation.organizationId,
          role: (invitation.role as "admin" | "member" | "owner") || "member",
        },
        headers: await headers(),
      });

      return { success: true };
    }),

  revokeInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return auth.api.cancelInvitation({
        body: { invitationId: input.invitationId },
        headers: await headers(),
      });
    }),

  getPublicInvitation: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { id: input.id },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const isExpired = new Date(invitation.expiresAt) < new Date();
      const isValid = invitation.status === "pending" && !isExpired;

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role || "member",
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        organizationSlug: invitation.organization.slug,
        organizationLogo: invitation.organization.logo,
        inviterEmail: invitation.user.email,
        inviterName: invitation.user.name,
        isExpired,
        isValid,
      };
    }),
});
