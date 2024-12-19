"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Import supabase

const formSchema = z.object({
  phone: z.string().min(10, "Número de telefone é obrigatório").regex(/^\d{10,11}$/, "Número de telefone inválido"),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const checkUserType = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('tipo')
        .eq('telefone', phone)
        .single();

      if (error) throw error;
      return data?.tipo;
    } catch (error) {
      console.error('Erro ao verificar tipo de usuário:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    const { phone } = data;

    // Simulação de autenticação para teste
    const userType = await checkUserType(phone); // Função que verifica o tipo de usuário

    if (userType === 'admin') {
      toast.success("Login realizado com sucesso!");
      router.push("/admin");
    } else if (userType === 'promotor') {
      toast.success("Login realizado com sucesso!");
      router.push("/promotor");
    } else {
      toast.error("Credenciais inválidas");
    }
    
    setIsLoading(false);
  };

  const formatPhone = (phone: string) => {
    // Função para formatar o número de telefone
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">JK-Promoter</h1>
        <p className="text-gray-600 mt-2">Faça login para continuar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Telefone</Label>
          <Input
            id="phone"
            type="text"
            placeholder="(XX) XXXXX-XXXX"
            {...register("phone")}
            onChange={(e) => {
              const formattedPhone = formatPhone(e.target.value);
              setValue("phone", formattedPhone);
            }}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </motion.div>
  );
}
