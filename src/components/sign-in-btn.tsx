import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "./ui/button";
import { LayoutDashboard, LogIn } from "lucide-react";

export async function SignInButton() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Link
      href={session?.session ? "/dashboard" : "/login"}
      className="flex justify-center"
    >
      <Button className="gap-2  justify-between" variant="default">
        {!session?.session ? <LogIn /> : <LayoutDashboard />}
        <span>{session?.session ? "Dashboard" : "Sign In"}</span>
      </Button>
    </Link>
  );
}

function checkOptimisticSession(headers: Headers) {
  const guessIsSignIn =
    headers.get("cookie")?.includes("better-auth.session") ||
    headers.get("cookie")?.includes("__Secure-better-auth.session-token");
  return !!guessIsSignIn;
}

export async function SignInFallback() {
  //to avoid flash of unauthenticated state
  const guessIsSignIn = checkOptimisticSession(await headers());
  return (
    <Link
      href={guessIsSignIn ? "/dashboard" : "/login"}
      className="flex justify-center"
    >
      <Button className="gap-2  justify-between" variant="default">
        {!guessIsSignIn ? <LogIn /> : <LayoutDashboard />}
        <span>{guessIsSignIn ? "Dashboard" : "Sign In"}</span>
      </Button>
    </Link>
  );
}
