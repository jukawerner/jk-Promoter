"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/admin/sidebar/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <motion.div
        initial={{ marginLeft: 72 }}
        animate={{ marginLeft: 72 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-8 transition-all duration-300"
      >
        {children}
      </motion.div>
    </div>
  );
}