"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session, User } from "better-auth";
import {
  AlertCircle,
  Key,
  LogOut,
  Monitor,
  Shield,
  SquarePen,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Spinner } from "../ui/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";

interface AccountSettingsProps {
  user: User;
  session: Session;
}

const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const DeleteUserSchema = z.object({
  password: z.string().min(2, "Password must be at least 2 characters"),
});

type UserFormValues = z.infer<typeof UserSchema>;
type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
type DeleteUserFormValues = z.infer<typeof DeleteUserSchema>;

export function AccountSettings({ user, session }: AccountSettingsProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userRole } = useQuery(
    trpc.users.getUserRole.queryOptions({ orgId: params.orgId })
  );

  const { refetch } = authClient.useSession();

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: user?.name || "",
      image: user?.image || "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteUserForm = useForm<DeleteUserFormValues>({
    resolver: zodResolver(DeleteUserSchema),
    defaultValues: {
      password: "",
    },
  });

  const updateUser = useMutation(
    trpc.users.updateUser.mutationOptions({
      onSuccess: (data) => {
        toast.success("Profile updated successfully!");
        userForm.reset({
          name: userForm.getValues("name"),
          image: userForm.getValues("image"),
        });
        setIsEditing(false);
        refetch();
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    })
  );

  const changePassword = useMutation(
    trpc.users.changePassword.mutationOptions({
      onSuccess: (data) => {
        toast.success("Password changed successfully!");
        passwordForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to change password.");
      },
    })
  );

  const deleteUser = useMutation(
    trpc.users.deleteUser.mutationOptions({
      onSuccess: (data) => {
        toast.success("Goodbye! Your account has been deleted.");
        deleteUserForm.reset();
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete profile");
      },
    })
  );

  const handleResendVerification = async () => {
    toast.promise(authClient.sendVerificationEmail({ email: user.email }), {
      loading: "Sending verification email...",
      success: "Verification email sent! Check your inbox.",
      error: "Failed to send verification email",
    });
  };

  const handleUpdateProfile = async (data: UserFormValues) => {
    updateUser.mutate({
      name: data.name,
      image: data.image || undefined,
    });
  };

  const handleChangePassword = async (data: ChangePasswordFormValues) => {
    changePassword.mutate({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
    });
  };

  const handleDeleteUser = async (data: DeleteUserFormValues) => {
    deleteUser.mutate({
      text: data.password,
      orgId: params.orgId,
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const parser = new UAParser(session.userAgent || "");
  const deviceInfo = `${parser.getOS().name || "Unknown OS"}, ${parser.getBrowser().name || "Unknown Browser"}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            {!isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <SquarePen className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-2xl uppercase">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {user.name || "Unnamed User"}
                </h3>
                {userRole && (
                  <Badge variant={getRoleBadgeVariant(userRole.role)}>
                    {userRole.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {isEditing && (
            <form onSubmit={userForm.handleSubmit(handleUpdateProfile)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={userForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="e.g. John Doe"
                        disabled={updateUser.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="image"
                  control={userForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="image">Profile Image</FieldLabel>
                      <Input
                        {...field}
                        id="image"
                        type="file"
                        disabled={updateUser.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={updateUser.isPending}>
                    {updateUser.isPending && <Spinner />}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateUser.isPending}
                    onClick={() => {
                      setIsEditing(false);
                      userForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Email Verification */}
      {!user.emailVerified && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Verify Your Email Address</strong>
              <p className="text-sm mt-1">
                Please verify your email address. Check your inbox for the
                verification email. If you haven't received it, click the button
                to resend.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              className="ml-4 whitespace-nowrap"
            >
              Resend Email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">{deviceInfo}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(handleChangePassword)}
            className="space-y-4"
          >
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="currentPassword">
                      Current Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      disabled={changePassword.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      disabled={changePassword.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm New Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      disabled={changePassword.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Spinner />}
                Change Password
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication (Admin/Owner only) */}
      {(userRole?.role === "owner" || userRole?.role === "admin") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enhance your account security</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Two-factor authentication adds an additional layer of security
                </p>
              </div>
              <Button variant="outline" disabled>
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="mt-4 space-y-4">
                  <form
                    onSubmit={deleteUserForm.handleSubmit(handleDeleteUser)}
                  >
                    <FieldGroup>
                      <Controller
                        name="password"
                        control={deleteUserForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              id="password"
                              type="password"
                              placeholder="Enter your password to confirm"
                              className="border-gray-950 focus-visible:ring-gray-800/30"
                              disabled={deleteUser.isPending}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </form>
                  <p>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={deleteUserForm.handleSubmit(handleDeleteUser)}
                >
                  {deleteUser.isPending && <Spinner />} Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
