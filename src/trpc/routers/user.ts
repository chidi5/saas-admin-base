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
});
