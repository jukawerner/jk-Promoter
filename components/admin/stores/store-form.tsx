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
  apelido: string;
}

export function StoreForm({ store, onSave, onCancel }: StoreFormProps) {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('Store data:', { store, promotor_id: store?.promotor_id });
  console.log('Promotor ID selecionado:', store?.promotor_id);
  console.log('Promotores carregados:', promotores); // Verifica se os promotores estão carregados corretamente
  console.log('Promotor ID no formulário:', store?.promotor_id);
  console.log('Promotores carregados:', promotores); // Verifica se os promotores estão carregados corretamente

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      rede_id: store?.rede_id || 0,
      promotor_id: store?.promotor_id === undefined ? null : store?.promotor_id,
    },
  });

  useEffect(() => {
    loadRedes();
    loadPromotores();
  }, []);

  useEffect(() => {
    if (store) {
      setValue("nome", store.nome || "");
      setValue("cnpj", store.cnpj || "");
      setValue("endereco", store.endereco || "");
      setValue("numero", store.numero || "");
      setValue("bairro", store.bairro || "");
      setValue("cidade", store.cidade || "");
      setValue("uf", store.uf || "");
      setValue("cep", store.cep || "");
      setValue("rede_id", store.rede_id || 0);
      setValue("promotor_id", store.promotor_id === undefined ? null : store.promotor_id);
    }
  }, [store, setValue]);

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
        .from('usuario')
        .select("*")
        .order("apelido");

      if (error) throw error;

      console.log('Dados dos promotores carregados:', data); // Log dos dados carregados

      if (data) {
        const promotoresFormatted = data.map(promotor => ({
          id: promotor.id,
          nome: promotor.nome,
          apelido: promotor.apelido
        }));
        console.log('Promotores formatados:', promotoresFormatted); // Log dos promotores formatados
        setPromotores(promotoresFormatted);
      } else {
        setPromotores([]);
      }

    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
      setPromotores([]);
    }
    console.log('Promotores após carregamento:', promotores); // Verifica o estado dos promotores após o carregamento
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log('Form data:', data);
      console.log('Dados do formulário ao salvar:', data);
      onSave({
        ...data,
        cnpj: data.cnpj || "",
        promotor_id: data.promotor_id === "null" ? null : data.promotor_id,
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
            value={watch("rede_id")?.toString()}
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
            onValueChange={(value) => {
              setValue("promotor_id", value);
              console.log('Promotor selecionado:', value); // Log para verificar o valor selecionado
            }}
            value={watch("promotor_id") || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um promotor" />
            </SelectTrigger>
            <SelectContent>
              {promotores.map((promotor) => (
                <SelectItem key={promotor.id} value={promotor.id}>
                  {promotor.apelido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.promotor_id && (
            <p className="text-red-500 text-sm">{errors.promotor_id.message}</p>
          )}
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
