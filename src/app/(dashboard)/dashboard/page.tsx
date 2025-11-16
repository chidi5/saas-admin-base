import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * Enforces authentication and redirects the user to the appropriate dashboard or onboarding page.
 *
 * If the user has no organizations, redirects to "/onboarding". Otherwise reads `redirect` from
 * `searchParams` (expected as a path like "/dashboard/:orgId/…"); if that path specifies an organization
 * that the user has access to, redirects to that organization's dashboard preserving the subpath;
 * otherwise redirects to the first available organization's dashboard preserving the subpath.
 *
 * @param searchParams - A promise resolving to an object that may include `redirect`, the intended path to navigate to.
 */
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