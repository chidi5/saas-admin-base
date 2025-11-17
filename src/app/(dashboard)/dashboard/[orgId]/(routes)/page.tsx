import Dashboard from "@/components/features/dashboard";
import { requireAuth } from "@/lib/auth-utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Loading from "./loading";
import { Suspense } from "react";

export default async function Page({ params }: { params: { orgId: string } }) {
  await requireAuth();
  const { orgId } = await params;
  const queryClient = getQueryClient();

  await Promise.all([
    void queryClient.prefetchQuery(
      trpc.users.count.queryOptions({ text: orgId })
    ),
    void queryClient.prefetchQuery(
      trpc.projects.count.queryOptions({ text: orgId })
    ),
    void queryClient.prefetchQuery(trpc.organizations.count.queryOptions()),
    void queryClient.prefetchQuery(
      trpc.organizations.pendingInvitation.queryOptions({ text: orgId })
    ),
    void queryClient.prefetchQuery(
      trpc.users.recentUser.queryOptions({ text: orgId })
    ),
    void queryClient.prefetchQuery(
      trpc.projects.recentProject.queryOptions({ text: orgId })
    ),
    void queryClient.prefetchQuery(trpc.organizations.list.queryOptions()),
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
