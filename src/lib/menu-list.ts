"use client";

import {
  Activity,
  FilePenLine,
  LucideIcon,
  SquareChartGantt,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";

type Submenu = {
  title: string;
  url: string;
};

type Menu = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items: Submenu[];
};

export function getMenuList(pathname: string): Menu[] {
  const params = useParams();
  return [
    {
      title: "Overview",
      url: `/dashboard/${params.orgId}`,
      icon: SquareChartGantt,
      isActive: pathname === `/dashboard/${params.orgId}`,
      items: [],
    },
    {
      title: "Members",
      url: `/dashboard/${params.orgId}/members`,
      icon: Users,
      isActive: pathname === `/dashboard/${params.orgId}/members`,
      items: [],
    },
    {
      title: "Activity",
      url: `/dashboard/${params.orgId}/activity`,
      icon: Activity,
      isActive: pathname === `/dashboard/${params.orgId}/activity`,
      items: [],
    },
    {
      title: "New Project",
      url: `/dashboard/${params.orgId}/projects/new`,
      icon: FilePenLine,
      isActive: false,
      items: [],
    },
  ];
}

// {
//   groupLabel: "",
//   menus: [
//     {
//       href: `/store/${params.storeId}/onboard`,
//       label: "Setup",
//       active: pathname === `/store/${params.storeId}/onboard`,
//       icon: Settings2,
//       submenus: [],
//     },
//   ],
// },
