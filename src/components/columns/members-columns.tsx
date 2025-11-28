"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Shield, Trash2 } from "lucide-react";

export type Member = {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null | undefined;
  };
};

interface ColumnActionsProps {
  onRoleChange: (memberId: string, role: string) => void;
  onRemove: (memberId: string) => void;
  currentUserRole: string;
}

export const createMembersColumns = ({
  onRoleChange,
  onRemove,
  currentUserRole,
}: ColumnActionsProps): ColumnDef<Member>[] => [
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
    accessorKey: "user",
    id: "member",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="uppercase">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || "Unnamed User"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const user = row.original.user;
      const searchValue = value.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const member = row.original;
      const role = member.role || "member"; // Default to member if no role
      const isOwner = role === "owner";
      const canEdit =
        (currentUserRole === "owner" && !isOwner) ||
        (currentUserRole === "admin" && !isOwner && role !== "admin");

      if (!canEdit || isOwner) {
        return (
          <Badge
            variant={
              role === "owner"
                ? "default"
                : role === "admin"
                  ? "secondary"
                  : "outline"
            }
          >
            {role}
          </Badge>
        );
      }

      return (
        <Select
          value={role}
          onValueChange={(value) => onRoleChange(member.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentUserRole === "owner" && (
              <SelectItem value="admin">Admin</SelectItem>
            )}
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      const role = member.role || "member";
      const canRemove =
        (currentUserRole === "owner" && role !== "owner") ||
        (currentUserRole === "admin" && role !== "owner" && role !== "admin");

      if (!canRemove) {
        return null;
      }

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
            {currentUserRole === "owner" && role !== "owner" && (
              <>
                <DropdownMenuItem
                  onClick={() => onRoleChange(member.id, "admin")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => onRemove(member.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
