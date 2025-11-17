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
import { useProjectModal } from "@/hooks/use-project-modal";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

export function ProjectModal() {
  const { isOpen, onClose, project, mode } = useProjectModal();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = mode === "edit" ? "Edit Project" : "New Project";
  const description =
    mode === "edit"
      ? "Update your project details."
      : "Create a new project to collaborate with your team.";

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ProjectForm project={project} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ProjectForm className="px-4" project={project} onClose={onClose} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function ProjectForm({
  className,
  project,
  onClose,
}: React.ComponentProps<"form"> & {
  project: any;
  onClose: () => void;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const mode = project ? "edit" : "create";

  const queryClient = useQueryClient();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Project created successfully!");
        form.reset();
        onClose();

        queryClient.invalidateQueries(
          trpc.projects.list.queryOptions({ text: params.orgId })
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create project");
      },
    })
  );

  const updateProject = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("Project created successfully!");
        form.reset();
        onClose();

        queryClient.invalidateQueries(
          trpc.projects.list.queryOptions({ text: params.orgId })
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update project");
      },
    })
  );

  const isPending = createProject.isPending || updateProject.isPending;

  const onSubmit = async (data: ProjectFormValues) => {
    if (mode === "edit" && project) {
      updateProject.mutate({
        id: project.id,
        name: data.name,
        description: data.description,
      });
    } else {
      createProject.mutate({
        name: data.name,
        description: data.description,
        organizationId: params.orgId,
      });
    }
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
              <FieldLabel htmlFor="name">Project Name</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Website Redesign"
                disabled={isPending}
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...field}
                id="description"
                aria-invalid={fieldState.invalid}
                placeholder="Describe your project..."
                disabled={isPending}
                rows={4}
              />
              <FieldDescription>
                Optional: Describe your project in detail.
              </FieldDescription>
            </Field>
          )}
        />

        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />}
            {mode === "edit" ? "Update Project" : "Create Project"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
