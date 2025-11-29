import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { reactInvitationEmail } from "./email/invitation";
import { resend } from "./email/resend";
import prisma from "./prismadb";

const from = process.env.MULTI_EMAIL || "delivered@resend.dev";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      const res = await resend.emails.send({
        from,
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${
                    process.env.BETTER_AUTH_URL || "https://demo.multi.com"
                  }/accept-invitation/${data.id}`,
          }),
        });
      },
    }),
  ],
});
