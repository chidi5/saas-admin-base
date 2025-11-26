import Dashboard from "@/components/features/dashboard";
import { requireAuth } from "@/lib/auth-utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Loading from "./loading";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireAuth();
  const { orgId } = await params;

  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  const queryClient = getQueryClient();

  // Prefetch all queries with proper parameters
  await Promise.all([
    queryClient.prefetchQuery(trpc.users.count.queryOptions({ text: orgId })),
    queryClient.prefetchQuery(
      trpc.projects.count.queryOptions({ text: orgId })
    ),
    queryClient.prefetchQuery(trpc.organizations.count.queryOptions()),
    queryClient.prefetchQuery(
      trpc.organizations.pendingInvitation.queryOptions({ text: orgId })
    ),
    queryClient.prefetchQuery(
      trpc.users.recentUser.queryOptions({ text: orgId })
    ),
    queryClient.prefetchQuery(
      trpc.projects.recentProject.queryOptions({ text: orgId })
    ),
    queryClient.prefetchQuery(trpc.organizations.list.queryOptions()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's activity and metrics
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Loading />}>
          <Dashboard orgId={orgId} />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
