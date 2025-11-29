import { LoginForm } from "@/components/auth/login-form";
import { requireUnauth } from "@/lib/auth-utils";

export default async function LoginPage() {
  await requireUnauth();
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
