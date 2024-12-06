"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  subItems?: { title: string; href: string }[];
  href?: string;
  expanded: boolean;
}

export function SidebarItem({ icon, title, subItems, href, expanded }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;

  if (!hasSubItems && href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
          !expanded && "justify-center"
        )}
      >
        {icon}
        {expanded && <span>{title}</span>}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
          !expanded && "justify-center"
        )}
      >
        {icon}
        {expanded && (
          <>
            <span className="flex-1 ml-3">{title}</span>
            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180"
                )}
              />
            )}
          </>
        )}
      </button>
      <AnimatePresence>
        {isOpen && expanded && hasSubItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-1 space-y-1"
          >
            {subItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}