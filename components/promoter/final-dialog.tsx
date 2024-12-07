"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function FinalDialog({ isOpen, onClose, onComplete }: FinalDialogProps) {
  const router = useRouter();

  const handleComplete = () => {
    onComplete();
    router.push("/promotor/pdv/mensagem-sucesso");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Confirmar Envio</h2>
          <p className="text-gray-600">
            Você tem certeza que deseja enviar estes dados?
          </p>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleComplete}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
