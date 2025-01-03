"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { supabase } from "lib/supabase/client";
import { User } from "lucide-react";
import { getCookie } from "@/lib/cookies";

export function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const phone = getCookie("userPhone");
        if (!phone) return;

        const { data, error } = await supabase
          .from("usuario")
          .select("nome, avatar_url")
          .eq("telefone", phone)
          .single();

        if (error) throw error;

        if (data) {
          setUserName(data.nome || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <Avatar>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={userName} />
      ) : (
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
