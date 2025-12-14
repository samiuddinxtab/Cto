import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Registers a new user via Directus (must be enabled server-side).
        </p>
      </div>

      <form action={signup} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit">Create account</Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
        .
      </p>
    </main>
  );
}
