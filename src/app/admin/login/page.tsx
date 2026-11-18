import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="Pacific Friendly Realty" className="h-11 mx-auto mb-8" />
        <div className="a-card p-7 sm:p-8 shadow-[0_20px_50px_rgba(14,43,64,0.08)]">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--a-muted)]">Sign in to see your numbers and write posts.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-[var(--a-faint)]">Pacific Friendly Realty · Admin</p>
      </div>
    </main>
  );
}
