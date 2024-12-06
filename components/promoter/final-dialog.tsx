"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Star, Smile, Meh, Frown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SuccessMessageDialog } from "./success-message-dialog";

interface FinalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Sentiment = "perfect" | "success" | "difficulty" | null;

export function FinalDialog({ isOpen, onClose, onComplete }: FinalDialogProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleConfirm = () => {
    if (!selectedSentiment) {
      toast.error("Por favor, selecione uma opção");
      return;
    }

    let message = "";
    switch (selectedSentiment) {
      case "perfect":
        message = "Ótimo! A loja está perfeita! 😊";
        break;
      case "success":
        message = "Legal! Você conseguiu abastecer! 😐";
        break;
      case "difficulty":
        message = "Entendi. Vamos melhorar da próxima vez! 🙁";
        break;
    }

    toast.success(message);
    setShowSuccessMessage(true);
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccessMessage} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ThumbsUp className="w-8 h-8 text-pink-500" />
                <div className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-yellow-400 absolute" />
                  <Star className="w-4 h-4 text-yellow-400 absolute" style={{ transform: 'translateX(-8px)' }} />
                  <Star className="w-4 h-4 text-yellow-400 absolute" style={{ transform: 'translateX(-16px)' }} />
                </div>
              </div>
              <h2 className="text-2xl font-semibold">Trabalho Feito!</h2>
            </div>
            <p className="text-gray-600 text-center">Avalie o seu trabalho na loja</p>

            {/* Opções de Sentimento */}
            <div className="space-y-4">
              <button
                onClick={() => setSelectedSentiment("perfect")}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  selectedSentiment === "perfect"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
              >
                <Smile className="w-6 h-6 text-yellow-400" />
                <span className="text-lg">A loja perfeita!</span>
              </button>

              <button
                onClick={() => setSelectedSentiment("success")}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  selectedSentiment === "success"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
              >
                <Meh className="w-6 h-6 text-yellow-400" />
                <span className="text-lg">Consegui abastecer</span>
              </button>

              <button
                onClick={() => setSelectedSentiment("difficulty")}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  selectedSentiment === "difficulty"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
              >
                <Frown className="w-6 h-6 text-yellow-400" />
                <span className="text-lg">Tive dificuldades na loja</span>
              </button>
            </div>

            {/* Botão Confirmar */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleConfirm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md text-lg"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <SuccessMessageDialog
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        onComplete={onComplete}
      />
    </>
  );
}
