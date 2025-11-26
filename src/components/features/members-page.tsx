"use client";

import { createInvitationsColumns } from "@/components/columns/invitations-columns";
import { createMembersColumns } from "@/components/columns/members-columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Mail, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MembersPageProps {
  orgId: string;
  userId: string;
}

export function MembersPage({ orgId, userId }: MembersPageProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: members } = useSuspenseQuery(
    trpc.organizations.listMembers.queryOptions({ orgId })
  );

  const { data: invitations } = useSuspenseQuery(
    trpc.organizations.listInvitations.queryOptions({ orgId })
  );

  // Get current user's role
  const currentMember = members.members.find((m) => m.userId === userId);
  const currentUserRole = currentMember?.role || "member";

  // Mutations
  const updateRole = useMutation(
    trpc.organizations.updateRole.mutationOptions({
      onSuccess: () => {
        toast.success("Role updated successfully");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update role");
      },
    })
  );

  const removeMember = useMutation(
    trpc.organizations.removeMember.mutationOptions({
      onSuccess: () => {
        toast.success("Member removed successfully");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to remove member");
      },
    })
  );

  const inviteMember = useMutation(
    trpc.organizations.inviteMember.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation sent successfully");
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteRole("member");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send invitation");
      },
    })
  );

  const resendInvitation = useMutation(
    trpc.organizations.resendInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation resent successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to resend invitation");
      },
    })
  );

  const revokeInvitation = useMutation(
    trpc.organizations.revokeInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation revoked successfully");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to revoke invitation");
      },
    })
  );

  const handleRoleChange = (memberId: string, role: string) => {
    updateRole.mutate({ orgId, memberId, role: role as "member" | "admin" });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate({ orgId, memberId });
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMember.mutate({
      orgId,
      email: inviteEmail,
      role: inviteRole as "member" | "admin",
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    resendInvitation.mutate({ invitationId });
  };

  const handleRevokeInvitation = (invitationId: string) => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      revokeInvitation.mutate({ invitationId });
    }
  };

  const membersColumns = createMembersColumns({
    onRoleChange: handleRoleChange,
    onRemove: handleRemoveMember,
    currentUserRole,
  });

  const invitationsColumns = createInvitationsColumns({
    onResend: handleResendInvitation,
    onRevoke: handleRevokeInvitation,
  });

  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization members and invitations
          </p>
        </div>
        {canInvite && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserRole === "owner" && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={inviteMember.isPending}
                >
                  {inviteMember.isPending && <Spinner />}
                  Send Invitation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members ({members.members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({invitations.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Active Members</CardTitle>
              <CardDescription>
                Manage roles and remove members from your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={membersColumns}
                data={members.members}
                searchKey="user"
                searchPlaceholder="Search members..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage pending invitations to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={invitationsColumns}
                data={invitations.invitations}
                searchKey="email"
                searchPlaceholder="Search invitations..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
