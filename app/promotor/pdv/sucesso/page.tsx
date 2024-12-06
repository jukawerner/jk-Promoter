"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SucessoPage() {
  const router = useRouter();

  const handleOk = () => {
    router.replace("/promotor");
  };

  return (
    <div className="container mx-auto p-6 max-w-[400px]">
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        
        <h1 className="text-2xl font-semibold text-center">
          Loja concluída com sucesso
        </h1>

        <Button
          onClick={handleOk}
          className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-2 text-lg"
        >
          OK
        </Button>
      </div>
    </div>
  );
}
