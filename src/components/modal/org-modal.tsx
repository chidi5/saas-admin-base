"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrgModal } from "@/hooks/use-org-modal";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Spinner } from "../ui/spinner";

/**
 * Render a responsive workspace-creation UI that shows a Dialog on desktop or a Drawer on mobile.
 *
 * The component synchronizes its open state with the `useOrgModal` hook and hosts the `OrgForm`
 * for creating a new workspace. On desktop it renders a centered Dialog with a title and description;
 * on mobile it renders a Drawer with the same content and a Cancel action.
 *
 * @returns A JSX element containing either a Dialog (desktop) or a Drawer (mobile) that wraps the OrgForm
 * and wires open/close changes to the modal hook.
 */
export function OrgModal() {
  const { isOpen, onOpen, onClose } = useOrgModal();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleOpenChange = (open: boolean) => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <OrgForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>New Workspace</DrawerTitle>
          <DrawerDescription>
            Create a new workspace to collaborate with your team.
          </DrawerDescription>
        </DrawerHeader>
        <OrgForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const orgSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

/**
 * Render a workspace creation form that validates input and calls the server to create a new organization.
 *
 * Submits the workspace name to the organizations create mutation; on success it shows a success toast, resets the form, invalidates the organizations list cache, and navigates to the new workspace dashboard. On error it shows an error toast.
 *
 * @param className - Optional CSS class names applied to the root form element
 * @returns The form element rendering the workspace creation UI
 */
function OrgForm({ className }: React.ComponentProps<"form">) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { onClose } = useOrgModal();

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
    },
  });

  const createOrg = useMutation(
    trpc.organizations.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Workspace created successfully!");
        form.reset();

        queryClient.invalidateQueries(trpc.organizations.list.queryOptions());

        if (data && data.id) {
          window.location.assign(`/dashboard/${data.id}`);
        }
      },
      onError: (error) => {
        console.error("Failed to create workspace:", error);
        toast.error(error.message || "Failed to create workspace");
      },
    })
  );

  const isPending = createOrg.isPending;

  const onSubmit = async (data: OrgFormValues) => {
    createOrg.mutate({
      name: data.name,
    });
  };

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Workspace Name</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. My Workspace"
                disabled={isPending}
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />} Create Workspace
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}