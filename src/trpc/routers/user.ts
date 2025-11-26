import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { headers } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  count: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const count = await prisma.member.count({
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
      const organization = await auth.api.getFullOrganization({
        query: {
          organizationId: ctx.input.text,
        },
        headers: await headers(),
      });

      return organization?.members;
    }),

  recentUser: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (ctx) => {
      const members = await prisma.member.findMany({
        where: { organizationId: ctx.input.text },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      const users = await prisma.user.findMany({
        where: {
          id: { in: members.map((member) => member.userId) },
        },
      });
      return users;
    }),

  getUserRole: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      })
    )
    .query(async (ctx) => {
      return prisma.member.findFirst({
        where: {
          organizationId: ctx.input.orgId,
          userId: ctx.ctx.auth.user.id,
        },
      });
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async (ctx) => {
      const updatedUser = await auth.api.updateUser({
        body: {
          name: ctx.input.name,
          image: ctx.input.image,
        },
        headers: await headers(),
      });
      return updatedUser;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        newPassword: z.string().min(2).max(100),
        currentPassword: z.string().min(2).max(100),
        revokeOtherSessions: z.boolean().optional(),
      })
    )
    .mutation(async (ctx) => {
      const changePassword = await auth.api.changePassword({
        body: {
          newPassword: ctx.input.newPassword,
          currentPassword: ctx.input.currentPassword,
          revokeOtherSessions: ctx.input.revokeOtherSessions || false,
        },
        headers: await headers(),
      });
      return changePassword;
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        text: z.string().min(2),
        orgId: z.string(),
      })
    )
    .mutation(async (ctx) => {
      const organizationMemberOwner = await prisma.member.findFirst({
        where: {
          organizationId: ctx.input.orgId,
          userId: ctx.ctx.auth.user.id,
          role: "owner",
        },
      });

      const deletedUser = await auth.api.deleteUser({
        body: { callbackURL: "/", password: ctx.input.text },
        headers: await headers(),
      });

      if (deletedUser && organizationMemberOwner) {
        await prisma.organization.deleteMany({
          where: { id: ctx.input.orgId },
        });
      }

      return deletedUser;
    }),
});
