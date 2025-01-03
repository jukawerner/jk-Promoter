"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/admin/sidebar/sidebar";
import { AdminNavbar } from '@/components/admin/admin-navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <motion.div
          initial={{ marginLeft: 72 }}
          animate={{ marginLeft: 72 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-8 transition-all duration-300"
        >
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </motion.div>
      </div>
    </div>
  );
}