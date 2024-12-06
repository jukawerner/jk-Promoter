"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandCardProps {
  brand: {
    id: number;
    name: string;
  };
  onDelete: (id: number) => void;
}

export function BrandCard({ brand, onDelete }: BrandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
    >
      <span className="font-medium text-gray-700">{brand.name}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(brand.id)}
        className="text-gray-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}