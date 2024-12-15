"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Store {
  id: number;
  nome: string;
  rede: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  promotor_id: string | null;
}

interface Promoter {
  id: string;
  nome: string;
}

interface Network {
  id: string;
  nome: string;
}

const formSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  cnpj: z.string()
    .min(18, "CNPJ inválido")
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "Formato: XX.XXX.XXX/XXXX-XX"),
  endereco: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  cep: z.string()
    .min(9, "CEP inválido")
    .regex(/^\d{5}-\d{3}$/, "Formato: XXXXX-XXX"),
  uf: z.string()
    .length(2, "UF deve ter 2 caracteres")
    .toUpperCase(),
  rede: z.string().min(1, "Selecione uma rede"),
  promotor_id: z.string().optional(),
});

interface StoreFormProps {
  store: Store | null;
  onSave: (store: Omit<Store, "id">) => void;
  onCancel: () => void;
}

export function StoreForm({ store, onSave, onCancel }: StoreFormProps) {
  const [loading, setLoading] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: store?.nome || "",
      cnpj: store?.cnpj || "",
      endereco: store?.endereco || "",
      numero: store?.numero || "",
      bairro: store?.bairro || "",
      cidade: store?.cidade || "",
      cep: store?.cep || "",
      uf: store?.uf || "",
      rede: store?.rede || "",
      promotor_id: store?.promotor_id || "none",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    async function loadData() {
      try {
        const [networksResponse, promotersResponse] = await Promise.all([
          supabase.from("rede").select("*").order("nome"),
          supabase.from("usuario").select("*").order("nome")
        ]);

        if (networksResponse.error) throw networksResponse.error;
        if (promotersResponse.error) throw promotersResponse.error;

        console.log('Networks:', networksResponse.data);
        console.log('Store Rede:', store?.rede);
        
        setNetworks(networksResponse.data || []);
        setPromoters(promotersResponse.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados do formulário");
      }
    }
    
    loadData();
  }, [store]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Encontrar o ID da rede baseado no nome
      const { data: redeData, error: redeError } = await supabase
        .from('rede')
        .select('id')
        .eq('nome', values.rede)
        .single();

      if (redeError) throw redeError;

      // Encontrar o ID do promotor baseado no nome
      let promotorId = null;
      if (values.promotor_id && values.promotor_id !== "none") {
        const { data: promotorData, error: promotorError } = await supabase
          .from('usuario')
          .select('id')
          .eq('nome', values.promotor_id)
          .single();

        if (promotorError) throw promotorError;
        promotorId = promotorData.id;
      }

      const storeData = {
        nome: values.nome,
        cnpj: values.cnpj,
        endereco: values.endereco,
        numero: values.numero,
        bairro: values.bairro,
        cidade: values.cidade,
        uf: values.uf,
        cep: values.cep,
        rede_id: redeData.id,
        promotor_id: promotorId
      };

      // Inserir ou atualizar a loja
      const { error } = store?.id 
        ? await supabase
            .from('loja')
            .update(storeData)
            .eq('id', store.id)
        : await supabase
            .from('loja')
            .insert([storeData]);

      if (error) throw error;

      toast.success(store?.id ? "Loja atualizada com sucesso!" : "Loja cadastrada com sucesso!");
      onSave(values);
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error("Erro ao salvar loja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nome">Nome da Loja</Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Nome da loja"
              className={errors.nome ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              {...register("cnpj")}
              placeholder="XX.XXX.XXX/XXXX-XX"
              className={errors.cnpj ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.cnpj && (
              <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              {...register("endereco")}
              placeholder="Rua, Avenida, etc"
              className={errors.endereco ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.endereco && (
              <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              {...register("numero")}
              placeholder="Número"
              className={errors.numero ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.numero && (
              <p className="text-red-500 text-sm mt-1">{errors.numero.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              {...register("bairro")}
              placeholder="Bairro"
              className={errors.bairro ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.bairro && (
              <p className="text-red-500 text-sm mt-1">{errors.bairro.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              {...register("cidade")}
              placeholder="Cidade"
              className={errors.cidade ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.cidade && (
              <p className="text-red-500 text-sm mt-1">{errors.cidade.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              {...register("cep")}
              placeholder="XXXXX-XXX"
              className={errors.cep ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.cep && (
              <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="uf">UF</Label>
            <Input
              id="uf"
              {...register("uf")}
              placeholder="UF"
              maxLength={2}
              className={errors.uf ? "border-red-500" : ""}
              disabled={isSubmitting}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.uf && (
              <p className="text-red-500 text-sm mt-1">{errors.uf.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="rede">Rede</Label>
            <Select onValueChange={(value) => setValue("rede", value)} defaultValue={store?.rede}>
              <SelectTrigger className={errors.rede ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a rede" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.nome}>
                    {network.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rede && (
              <p className="text-red-500 text-sm mt-1">{errors.rede.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="promotor">Promotor</Label>
            <Select onValueChange={(value) => setValue("promotor_id", value)} defaultValue={store?.promotor_id}>
              <SelectTrigger className={errors.promotor_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o promotor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem promotor</SelectItem>
                {promoters.map((promoter) => (
                  <SelectItem key={promoter.id} value={promoter.nome}>
                    {promoter.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.promotor_id && (
              <p className="text-red-500 text-sm mt-1">{errors.promotor_id.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : store ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
