"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

/**
 * Renders a Drawer root element and forwards all received props.
 *
 * @param props - Props forwarded to the underlying Drawer root element; a `data-slot="drawer"` attribute is added.
 * @returns A Drawer root element with `data-slot="drawer"` and the provided props applied.
 */
function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

/**
 * Renders a drawer trigger element with a data-slot attribute and forwards all received props.
 *
 * @param props - Props to apply to the trigger element (passed through to the underlying Drawer trigger)
 * @returns The trigger element for a Drawer
 */
function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/**
 * Renders the drawer's portal container with a predefined data-slot and forwards all received props.
 *
 * @returns A `DrawerPrimitive.Portal` element with `data-slot="drawer-portal"` and the provided props applied.
 */
function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

/**
 * Renders a drawer close control.
 *
 * @param props - Props applied to the underlying close control element.
 * @returns The rendered close control element with data-slot="drawer-close".
 */
function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

/**
 * Renders the drawer backdrop overlay with positioning, backdrop visual styles, and open/close animations.
 *
 * @param className - Additional CSS classes appended to the component's default classes
 * @param props - Additional props forwarded to the underlying Vaul overlay primitive
 * @returns The drawer overlay element with combined classes, data-slot="drawer-overlay", and forwarded props
 */
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the drawer's content area inside a portal with an overlay and direction-aware layout.
 *
 * @param className - Additional CSS classes applied to the content container
 * @param children - Elements to render inside the drawer content
 * @param props - Additional props forwarded to the underlying drawer content element
 * @returns The rendered drawer content element including its portal, overlay, and children
 */
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-none data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-none data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

/**
 * Renders the header area for a Drawer, applying direction-aware layout and spacing.
 *
 * @param className - Additional CSS classes to merge with the component's default classes.
 * @param props - Additional `div` attributes forwarded to the root element.
 * @returns A `div` element with `data-slot="drawer-header"` and merged class names suitable for Drawer layouts.
 */
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the footer container for drawer content.
 *
 * The element applies default spacing and layout classes and forwards all other div props.
 *
 * @param className - Additional CSS classes to append to the footer's default classes
 * @returns A div element used as the drawer footer
 */
function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

/**
 * Renders a styled drawer title element.
 *
 * Applies default title typography and forwards additional props to the underlying Vaul DrawerPrimitive.Title.
 *
 * @param className - Additional CSS class names appended to the default title styles
 * @param props - Remaining props forwarded to the underlying Title element
 * @returns The rendered drawer title element
 */
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Renders the drawer's description element with muted, small text and the `data-slot="drawer-description"` attribute.
 *
 * @returns The configured DrawerPrimitive.Description element with a combined `className` (`"text-muted-foreground text-sm"` plus any supplied `className`)
 */
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};