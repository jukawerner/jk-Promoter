"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="flex items-center gap-2 bg-white hover:bg-gray-100"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}