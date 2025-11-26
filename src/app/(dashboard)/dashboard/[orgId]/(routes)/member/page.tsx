import { MembersPage } from "@/components/features/members-page";
import { Spinner } from "@/components/ui/spinner";
import { requireAuth } from "@/lib/auth-utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const session = await requireAuth();
  const { orgId } = await params;
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      trpc.organizations.listMembers.queryOptions({ orgId })
    ),
    queryClient.prefetchQuery(
      trpc.organizations.listInvitations.queryOptions({ orgId })
    ),
  ]);

  return (
    <div className="py-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Spinner />}>
          <MembersPage orgId={orgId} userId={session.user.id} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
