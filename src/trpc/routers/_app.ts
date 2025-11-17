import { createTRPCRouter } from "../init";
import { organizationRouter } from "./organization";
import { projectRouter } from "./project";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  users: userRouter,
  projects: projectRouter,
  organizations: organizationRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

// hello: baseProcedure
//   .input(
//     z.object({
//       text: z.string(),
//     })
//   )
//   .query((opts) => {
//     return {
//       greeting: `hello ${opts.input.text}`,
//     };
//   }),

// getUser: protectedProcedure.query(({ ctx }) => {
//   return prisma.user.findUnique({
//     where: { id: ctx.auth.user.id },
//   });
// }),
