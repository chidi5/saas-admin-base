"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Activity,
  Building2,
  FolderKanban,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Dashboard = ({ orgId }: { orgId: string }) => {
  const trpc = useTRPC();

  const { data: totalUser } = useSuspenseQuery(
    trpc.users.count.queryOptions({ text: orgId })
  );
  const { data: totalProject } = useSuspenseQuery(
    trpc.projects.count.queryOptions({ text: orgId })
  );
  const { data: totalOrganization } = useSuspenseQuery(
    trpc.organizations.count.queryOptions()
  );
  const { data: pendingInvitation } = useSuspenseQuery(
    trpc.organizations.pendingInvitation.queryOptions({ text: orgId })
  );
  const { data: recentUsers } = useSuspenseQuery(
    trpc.users.recentUser.queryOptions({ text: orgId })
  );
  const { data: recentProjects } = useSuspenseQuery(
    trpc.projects.recentProject.queryOptions({ text: orgId })
  );
  const { data: organizations } = useSuspenseQuery(
    trpc.organizations.list.queryOptions()
  );

  const statCards = [
    {
      title: "Total Users",
      value: totalUser,
      icon: Users,
      description: "Registered users",
      trend: "+12% from last month",
    },
    {
      title: "Organizations",
      value: totalOrganization,
      icon: Building2,
      description: "Active organizations",
      trend: "+5% from last month",
    },
    {
      title: "Projects",
      value: totalProject,
      icon: FolderKanban,
      description: "Total projects",
      trend: "+18% from last month",
    },
    {
      title: "Pending Invites",
      value: pendingInvitation?.length,
      icon: UserPlus,
      description: "Awaiting response",
      trend: "3 expiring soon",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="uppercase">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || "Unnamed User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.organization.name}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
