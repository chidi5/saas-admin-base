import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  await requireAuth();
  const organizations = await caller.organizations.list();

  if (!organizations || organizations.length === 0) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const intendedPath = params.redirect || "";

  const match = intendedPath.match(/^\/dashboard\/([^\/]+)(.*)/);
  const requestedOrgId = match?.[1];
  const subPath = match?.[2] || "";

  if (
    requestedOrgId &&
    organizations.some((org) => org.id === requestedOrgId)
  ) {
    redirect(`/dashboard/${requestedOrgId}${subPath}`);
  }

  redirect(`/dashboard/${organizations[0].id}${subPath}`);
}
