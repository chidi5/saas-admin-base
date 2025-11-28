"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { InvitationStatus } from "better-auth/plugins";
import { ArrowUpDown, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";

export type Invitation = {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: InvitationStatus;
  expiresAt: string;
  organizationId: string;
  inviterId: string;
};

interface InvitationActionsProps {
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
}

export const createInvitationsColumns = ({
  onResend,
  onRevoke,
}: InvitationActionsProps): ColumnDef<Invitation>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.email}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role || "member";
      return (
        <Badge variant={role === "admin" ? "secondary" : "outline"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isExpired = new Date(row.original.expiresAt) < new Date();

      return (
        <Badge
          variant={
            status === "accepted"
              ? "default"
              : isExpired
                ? "destructive"
                : "secondary"
          }
        >
          {isExpired ? "Expired" : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expires
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiresAt = new Date(row.original.expiresAt);
      const now = new Date();
      const isExpired = expiresAt < now;

      return (
        <div className={isExpired ? "text-destructive" : ""}>
          {expiresAt.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invitation = row.original;
      const isPending = invitation.status === "pending";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {isPending && (
              <>
                <DropdownMenuItem onClick={() => onResend(invitation.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Invitation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => onRevoke(invitation.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke Invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
