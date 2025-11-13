import { SignupForm } from "@/components/auth/signup-form";
import { requireUnauth } from "@/lib/auth-utils";

export default async function SignupPage() {
  await requireUnauth();

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
