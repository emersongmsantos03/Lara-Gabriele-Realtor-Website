import type { Metadata } from "next";
import { connection } from "next/server";
import "../post-body.css";
import "./admin.css";
import DialogHost from "./_components/DialogHost";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminRoot({ children }: LayoutProps<"/admin">) {
  // Always render /admin per request: the CSP nonce from src/proxy.ts changes on
  // every request, and a prerendered (cached) page would carry scripts without
  // it, so the browser would block all JavaScript (buttons would do nothing).
  await connection();
  return (
    <div className="admin-root flex-1 flex flex-col min-h-screen">
      {children}
      <DialogHost />
    </div>
  );
}
