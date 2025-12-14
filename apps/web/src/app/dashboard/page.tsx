import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        This route is protected by middleware and should require auth.
      </p>

      <form action={logout}>
        <Button type="submit" variant="secondary">
          Logout
        </Button>
      </form>
    </main>
  );
}
