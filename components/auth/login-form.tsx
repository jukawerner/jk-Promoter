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
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  phone: z
    .string()
    .min(14, "Número de telefone é obrigatório")
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato inválido. Use (XX) XXXXX-XXXX"),
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
      // Remove todos os caracteres não numéricos do telefone
      const cleanPhone = phone.replace(/\D/g, '');
      
      console.log('Tentando login com telefone:', cleanPhone);
      
      const { data, error } = await supabase
        .from('usuario')
        .select('tipo, id')
        .eq('telefone', cleanPhone)
        .single();

      console.log('Resposta do banco:', data, error);

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      }
      
      if (!data) {
        console.log('Usuário não encontrado');
        return null;
      }

      console.log('Tipo do usuário:', data.tipo);
      
      // Se for admin, verifica as marcas
      if (data.tipo === 'Admin') {
        const { data: marcas } = await supabase
          .from('promoter_marca')
          .select('marca_id')
          .eq('promoter_id', data.id);

        const { data: totalMarcas } = await supabase
          .from('marca')
          .select('id', { count: 'exact' });

        const isFullAdmin = !marcas || marcas.length === 0 || (totalMarcas && marcas.length === totalMarcas.length);
        return { 
          tipo: data.tipo, 
          isFullAdmin, 
          marcas: marcas?.map(m => m.marca_id) || [] 
        };
      }

      // Se for promotor, retorna as informações básicas
      if (data.tipo === 'Promotor') {
        const { data: marcas } = await supabase
          .from('promoter_marca')
          .select('marca_id')
          .eq('promoter_id', data.id);

        return { 
          tipo: 'Promotor', 
          isFullAdmin: false, 
          marcas: marcas?.map(m => m.marca_id) || [] 
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar tipo de usuário:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const { phone } = data;
      const userInfo = await checkUserType(phone);

      console.log('Informações do usuário:', userInfo);

      if (!userInfo) {
        toast.error("Telefone não encontrado no sistema");
        return;
      }

      // Salva o telefone e as marcas nos cookies e localStorage
      const cleanPhone = phone.replace(/\D/g, '');
      document.cookie = `userPhone=${cleanPhone}; path=/`;
      document.cookie = `userMarcas=${JSON.stringify(userInfo.marcas)}; path=/`;
      localStorage.setItem("userPhone", cleanPhone);
      localStorage.setItem("userMarcas", JSON.stringify(userInfo.marcas));

      console.log('Tipo do usuário para redirecionamento:', userInfo.tipo);

      if (userInfo.tipo === 'Admin') {
        toast.success("Login realizado com sucesso! Redirecionando...");
        if (!userInfo.isFullAdmin) {
          router.push("/admin/relatorios");
        } else {
          router.push("/admin");
        }
        return;
      } 
      
      if (userInfo.tipo === 'Promotor') {
        toast.success("Login realizado com sucesso! Redirecionando...");
        router.push("/promotor");
        return;
      }

      toast.error("Tipo de usuário não reconhecido");
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})?(\d{5})?(\d{4})?/, function(_, ddd, prefix, suffix) {
        let formatted = '';
        if (ddd) formatted += `(${ddd}`;
        if (prefix) formatted += `) ${prefix}`;
        if (suffix) formatted += `-${suffix}`;
        return formatted;
      });
    }
    // Se tiver mais de 11 dígitos, mantém apenas os primeiros 11
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
            maxLength={15}
            {...register("phone")}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setValue("phone", formatted);
              e.target.value = formatted;
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
