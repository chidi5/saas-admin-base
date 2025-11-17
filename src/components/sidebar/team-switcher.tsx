"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useParams, useRouter } from "next/navigation";
import { Organization } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useOrgModal } from "@/hooks/use-org-modal";

export function TeamSwitcher({ teams }: { teams: Organization[] }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const { onOpen } = useOrgModal();

  const [fullActiveOrg, setFullActiveOrg] = React.useState<any>(null);
  const activeOrg = teams.find((item) => item.id === params.orgId);

  React.useEffect(() => {
    if (activeOrg?.id) {
      authClient.organization
        .getFullOrganization({
          query: {
            organizationId: activeOrg.id,
          },
        })
        .then((response) => {
          if (response.data) {
            setFullActiveOrg(response.data);
          }
        });
    }
  }, [activeOrg?.id]);

  if (!activeOrg || !fullActiveOrg) {
    return null;
  }

  const onOrgSelect = (org: Organization) => {
    router.push(`/dashboard/${org.id}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-none">
                <Avatar className="rounded-none">
                  <AvatarImage
                    className="object-cover w-full h-full size-4 rounded-none"
                    src={fullActiveOrg.logo || undefined}
                  />
                  <AvatarFallback className="rounded-none">
                    {fullActiveOrg?.name?.charAt(0) || activeOrg.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {fullActiveOrg.name || activeOrg.name}
                </span>
                <span className="truncate text-xs">
                  {fullActiveOrg.members.length ?? 0} member(s)
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => onOrgSelect(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-none border">
                  <Avatar className="rounded-none">
                    <AvatarImage
                      className="object-cover w-full h-full size-3.5 shrink-0 rounded-none"
                      src={team.logo || undefined}
                    />
                    <AvatarFallback className="rounded-none">
                      {team.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={onOpen}>
              <div className="flex size-6 items-center justify-center rounded-none border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add Workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
