"use client";

import { Header } from "components/promoter/header";

export default function PromoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Conteúdo principal */}
      <main className="p-4 pt-24">
        {children}
      </main>
    </div>
  );
}
