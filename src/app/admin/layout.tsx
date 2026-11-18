import type { Metadata } from "next";
import "../post-body.css";
import "./admin.css";
import DialogHost from "./_components/DialogHost";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-root flex-1 flex flex-col min-h-screen">
      {children}
      <DialogHost />
    </div>
  );
}
