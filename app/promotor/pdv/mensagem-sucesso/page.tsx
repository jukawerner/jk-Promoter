"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MensagemSucessoPage() {
  const router = useRouter();

  const handleVoltar = () => {
    router.push("/promotor/pdv");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Operação Concluída</h2>
        <p className="text-muted-foreground">
          Sua operação foi realizada com sucesso!
        </p>
        <Button onClick={handleVoltar} className="w-full">
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
