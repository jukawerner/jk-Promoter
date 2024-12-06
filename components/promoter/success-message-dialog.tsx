"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void; 
}

export function SuccessMessageDialog({ isOpen, onClose, onComplete }: SuccessMessageDialogProps) {
  const router = useRouter();

  const handleOk = () => {
    onClose(); 
    onComplete(); 
    router.replace("/promotor");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          
          <h2 className="text-2xl font-semibold text-center">
            Loja concluída com sucesso
          </h2>

          <Button
            onClick={handleOk}
            className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-2 text-lg"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
