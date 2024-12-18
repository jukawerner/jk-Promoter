"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, StoreFormData } from "@/types/store";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  cep: z.string().min(1, "CEP é obrigatório"),
  rede_id: z.number().min(1, "Rede é obrigatória"),
  promotor_id: z.string().nullable(),
});

interface StoreFormProps {
  store: Store | null;
  onSave: (data: StoreFormData) => void;
  onCancel: () => void;
}

interface Rede {
  id: number;
  nome: string;
}

interface Promotor {
  id: string;
  nome: string;
}

export function StoreForm({ store, onSave, onCancel }: StoreFormProps) {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: store?.nome || "",
      cnpj: store?.cnpj || "",
      endereco: store?.endereco || "",
      numero: store?.numero || "",
      bairro: store?.bairro || "",
      cidade: store?.cidade || "",
      uf: store?.uf || "",
      cep: store?.cep || "",
      rede_id: store?.rede_id || undefined,
      promotor_id: store?.promotor_id || null,
    },
  });

  useEffect(() => {
    loadRedes();
    loadPromotores();
  }, []);

  const loadRedes = async () => {
    try {
      const { data, error } = await supabase
        .from("rede")
        .select("*")
        .order("nome");

      if (error) throw error;
      setRedes(data || []);
    } catch (error) {
      console.error("Erro ao carregar redes:", error);
    }
  };

  const loadPromotores = async () => {
    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("*")
        .eq("tipo", "promotor")
        .order("nome");

      if (error) throw error;
      setPromotores(data || []);
    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      onSave({
        ...data,
        cnpj: data.cnpj || "",
      });
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Loja</Label>
          <Input
            id="nome"
            {...register("nome")}
            className={errors.nome ? "border-red-500" : ""}
          />
          {errors.nome && (
            <p className="text-red-500 text-sm">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register("cnpj")}
            className={errors.cnpj ? "border-red-500" : ""}
          />
          {errors.cnpj && (
            <p className="text-red-500 text-sm">{errors.cnpj.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            {...register("endereco")}
            className={errors.endereco ? "border-red-500" : ""}
          />
          {errors.endereco && (
            <p className="text-red-500 text-sm">{errors.endereco.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            {...register("numero")}
            className={errors.numero ? "border-red-500" : ""}
          />
          {errors.numero && (
            <p className="text-red-500 text-sm">{errors.numero.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            {...register("bairro")}
            className={errors.bairro ? "border-red-500" : ""}
          />
          {errors.bairro && (
            <p className="text-red-500 text-sm">{errors.bairro.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            {...register("cidade")}
            className={errors.cidade ? "border-red-500" : ""}
          />
          {errors.cidade && (
            <p className="text-red-500 text-sm">{errors.cidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="uf">UF</Label>
          <Input
            id="uf"
            {...register("uf")}
            maxLength={2}
            className={errors.uf ? "border-red-500" : ""}
          />
          {errors.uf && (
            <p className="text-red-500 text-sm">{errors.uf.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            {...register("cep")}
            className={errors.cep ? "border-red-500" : ""}
          />
          {errors.cep && (
            <p className="text-red-500 text-sm">{errors.cep.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rede_id">Rede</Label>
          <Select
            onValueChange={(value) => setValue("rede_id", Number(value))}
            defaultValue={store?.rede_id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma rede" />
            </SelectTrigger>
            <SelectContent>
              {redes.map((rede) => (
                <SelectItem key={rede.id} value={rede.id.toString()}>
                  {rede.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rede_id && (
            <p className="text-red-500 text-sm">{errors.rede_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotor_id">Promotor</Label>
          <Select
            onValueChange={(value) => setValue("promotor_id", value)}
            defaultValue={store?.promotor_id || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um promotor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {promotores.map((promotor) => (
                <SelectItem key={promotor.id} value={promotor.id}>
                  {promotor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
