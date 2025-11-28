"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { CheckIcon, LogIn, UserPlus, XIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InvitationError } from "./invitation-error";
import { useQuery } from "@tanstack/react-query";

export default function InvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const trpc = useTRPC();

  const [invitationStatus, setInvitationStatus] = useState<
    "pending" | "accepted" | "rejected"
  >("pending");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery(
    trpc.organizations.getPublicInvitation.queryOptions(
      { id: params.id },
      { retry: false }
    )
  );

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (session.data) {
        setIsAuthenticated(true);
        setUserEmail(session.data.user.email);
      }
    };
    checkAuth();
  }, []);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      return;
    }

    await authClient.organization.acceptInvitation(
      { invitationId: params.id },
      {
        onSuccess: () => {
          setInvitationStatus("accepted");
          setTimeout(() => {
            router.push(`/dashboard/${invitation?.organizationId}`);
          }, 2000);
        },
        onError: (ctx) => {
          console.error("Accept error:", ctx.error);
        },
      }
    );
  };

  const handleReject = async () => {
    await authClient.organization.rejectInvitation(
      { invitationId: params.id },
      {
        onSuccess: () => {
          setInvitationStatus("rejected");
        },
        onError: (ctx) => {
          console.error("Reject error:", ctx.error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <InvitationSkeleton />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <InvitationError />
      </div>
    );
  }

  // Check if invitation is expired
  if (invitation.isExpired) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired and is no longer valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact {invitation.inviterEmail} to request a new
              invitation.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if invitation has already been accepted/rejected
  if (invitation.status !== "pending") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation {invitation.status}</CardTitle>
            <CardDescription>
              This invitation is no longer pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This invitation has already been {invitation.status}.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if invitation is for a different email
  const emailMismatch = isAuthenticated && userEmail !== invitation.email;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitationStatus === "pending" && (
            <div className="space-y-4">
              <p>
                <strong>{invitation.inviterEmail}</strong> has invited you to
                join <strong>{invitation.organizationName}</strong> as a{" "}
                <strong>{invitation.role}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                This invitation was sent to <strong>{invitation.email}</strong>.
              </p>

              {emailMismatch && (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You're currently logged in as <strong>{userEmail}</strong>,
                    but this invitation is for{" "}
                    <strong>{invitation.email}</strong>. Please sign out and log
                    in with the correct email address.
                  </p>
                </div>
              )}

              {!isAuthenticated && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-3">
                    To accept this invitation, you need to:
                  </p>
                  <div className="space-y-2">
                    <Link
                      href={`/signup?invitation=${params.id}&email=${invitation.email}`}
                      className="block"
                    >
                      <Button className="w-full" variant="default">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </Button>
                    </Link>
                    <Link
                      href={`/login?invitation=${params.id}`}
                      className="block"
                    >
                      <Button className="w-full" variant="outline">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          {invitationStatus === "accepted" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-center">
                Welcome to {invitation.organizationName}!
              </h2>
              <p className="text-center text-muted-foreground">
                You've successfully joined the organization. Redirecting...
              </p>
            </div>
          )}
          {invitationStatus === "rejected" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
                <XIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-center">
                Invitation Declined
              </h2>
              <p className="text-center text-muted-foreground">
                You've declined the invitation to join{" "}
                {invitation.organizationName}.
              </p>
            </div>
          )}
        </CardContent>
        {invitationStatus === "pending" &&
          isAuthenticated &&
          !emailMismatch && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReject}>
                Decline
              </Button>
              <Button onClick={handleAccept}>Accept Invitation</Button>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}

function InvitationSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
