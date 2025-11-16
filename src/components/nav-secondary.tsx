import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * Render a secondary navigation group that displays a list of link items with icons.
 *
 * Each item is rendered as a menu entry linking to its `url` and showing its `icon` and `title`.
 *
 * @param items - Array of navigation items. Each item should include:
 *   - `title`: label displayed for the item
 *   - `url`: href for the item's link
 *   - `icon`: icon component to render alongside the title
 * @param props - Additional props forwarded to the underlying `SidebarGroup` component.
 * @returns A JSX element representing the secondary navigation group.
 */
export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}