"use client";

import { LifeBuoy, Send } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Project } from "@/generated/prisma/client";
import { authClient } from "@/lib/auth-client";
import { getMenuList } from "@/lib/menu-list";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Session, User } from "better-auth";
import { Organization } from "better-auth/plugins";
import { useParams, usePathname } from "next/navigation";

const data = {
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC();
  const pathname = usePathname();
  const navMain = getMenuList(pathname);
  const params = useParams<{
    orgId: string;
  }>();

  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [user, setUser] = React.useState<User>();
  const [session, setSession] = React.useState<Session>();

  const { data: projectsData } = useQuery(
    trpc.projects.list.queryOptions({ text: params.orgId })
  );

  const projects = React.useMemo<Project[]>(() => {
    if (projectsData && Array.isArray(projectsData)) {
      return projectsData.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    }
    return [];
  }, [projectsData]);

  React.useEffect(() => {
    authClient.organization.list().then((result) => {
      if (result?.data && Array.isArray(result.data)) {
        setOrganizations(result.data);
      }
    });
    authClient.getSession().then((result) => {
      if (result?.data) {
        setUser(result.data.user);
        setSession(result.data.session);
      }
    });
  }, []);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={organizations} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && session && <NavUser user={user} session={session} />}
      </SidebarFooter>
    </Sidebar>
  );
}
