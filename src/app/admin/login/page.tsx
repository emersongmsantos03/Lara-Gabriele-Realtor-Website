import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { missingSetup } from "@/lib/admin/setup";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const missing = missingSetup();
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="Pacific Friendly Realty" className="h-11 mx-auto mb-8" />
        <div className="a-card p-7 sm:p-8 shadow-[0_20px_50px_rgba(14,43,64,0.08)]">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--a-muted)]">Sign in to see your numbers and write posts.</p>
          {missing.length > 0 && (
            <div role="status" className="mt-5 rounded-xl bg-[#fdf6e7] p-3.5 text-sm text-[#7a5a12]">
              <p className="font-medium">The admin isn&apos;t fully set up on the server yet.</p>
              <p className="mt-1">Missing in Vercel → Settings → Environment Variables:</p>
              <ul className="mt-1 list-disc pl-5">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-[var(--a-faint)]">Pacific Friendly Realty · Admin</p>
      </div>
    </main>
  );
}
