import { SignInButton, SignInFallback } from "@/components/sign-in-btn";
import { Suspense } from "react";

const features = [
  { name: "Authentication", description: "Email & Password authentication" },
  { name: "Organization Switching", description: "Multi-tenant support" },
  { name: "Role-Based Access Control", description: "Granular permissions" },
  { name: "Team Management", description: "Collaborate with your team" },
  { name: "CRUD Operations", description: "Full data management" },
  { name: "User Permissions", description: "Fine-grained access control" },
  { name: "Secure by Default", description: "Built with security in mind" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden px-6 md:px-0 bg-background font-sans">
      <main className="flex flex-col gap-4 items-center justify-center">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold font-mono text-4xl text-foreground text-center">
            Multi.
          </h3>
          <p className="text-center wrap-break-word text-sm md:text-base text-muted-foreground">
            A clean, production-ready starter for{" "}
            <span className="italic underline">SaaS dashboards</span> with
            enterprise-grade features.
          </p>
        </div>

        <div className="md:w-10/12 w-full flex flex-col gap-4">
          <div className="flex flex-col gap-3 pt-2 flex-wrap">
            <div className="border-y py-2 border-dotted bg-secondary/60">
              <div className="text-xs flex items-center gap-2 justify-center text-muted-foreground">
                <span className="text-center">
                  Built with Next.js, tRPC, Prisma, PostgreSQL, and shadcn/UI
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              {features.map((feature) => (
                <span
                  className="border-b pb-1 text-muted-foreground text-xs hover:text-foreground duration-150 ease-in-out transition-all hover:border-foreground flex items-center gap-1"
                  key={feature.name}
                >
                  {feature.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Suspense fallback={<SignInFallback />}>
              <SignInButton />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
