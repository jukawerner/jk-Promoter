"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
}

export function StoreForm({ isOpen, onClose, onNext }: StoreFormProps) {
  const [formData, setFormData] = useState({
    seApresentou: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seApresentou) {
      toast.error("Por favor, confirme que você se apresentou");
      return;
    }
    onNext();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Se apresente!</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-center">
              <span className="text-4xl mb-4">🤝</span>
              <h3 className="text-lg font-semibold mt-2">ver e ser visto</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="seApresentou"
                checked={formData.seApresentou}
                onChange={(e) => setFormData({ ...formData, seApresentou: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="seApresentou">Já me apresentei</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}