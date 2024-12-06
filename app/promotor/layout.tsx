"use client";

import { Sidebar } from "@/components/promoter/sidebar";

export default function PromoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-16 p-6">{children}</main>
    </div>
  );
}
