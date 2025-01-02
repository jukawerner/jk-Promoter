"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { supabase } from "lib/supabase/client";
import { User } from "lucide-react";

export function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const phone = localStorage.getItem("userPhone");
        if (!phone) return;

        const { data, error } = await supabase
          .from("usuario")
          .select("nome, avatar_url")
          .eq("telefone", phone)
          .single();

        if (error) throw error;

        if (data) {
          setUserName(data.nome);
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={avatarUrl} alt={userName} />
      <AvatarFallback>
        <User className="h-6 w-6 text-gray-400" />
      </AvatarFallback>
    </Avatar>
  );
}
