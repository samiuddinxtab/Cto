import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold">Next.js 16 + Directus</h1>
      <p className="text-muted-foreground">
        Starter scaffold: Server Actions, token-based auth, and Directus SDK.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/signup">Signup</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
