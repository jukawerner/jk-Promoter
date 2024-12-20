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
import { getRedes, getPromotores } from "@/lib/actions/loja";
import { MapPicker } from "@/components/admin/promoters/map-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  cep: z.string().min(8, "CEP é obrigatório e deve ter 8 dígitos"),
  rede_id: z.number().min(1, "Rede é obrigatória"),
  promotor_id: z.number().nullable(),
  latitude: z.number(),
  longitude: z.number(),
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
  id: number;
  nome: string;
  apelido: string;
}

export function StoreForm({ store, onSave, onCancel }: StoreFormProps) {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<StoreFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      endereco: "",
      cep: "",
      rede_id: undefined,
      promotor_id: null,
      latitude: -23.5505,
      longitude: -46.6333,
    },
  });

  const endereco = watch("endereco");

  useEffect(() => {
    if (store) {
      reset({
        nome: store.nome,
        cnpj: store.cnpj || "",
        endereco: store.endereco,
        cep: store.cep,
        rede_id: store.rede_id,
        promotor_id: store.promotor_id,
        latitude: store.latitude,
        longitude: store.longitude,
      });
    }
  }, [store, reset]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [redesData, promotoresData] = await Promise.all([
          getRedes(),
          getPromotores()
        ]);
        setRedes(redesData);
        setPromotores(promotoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setValue('cep', value);

    if (value.replace(/\D/g, '').length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setValue('endereco', endereco);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setValue("endereco", newAddress);
  };

  const handleCepUpdate = (newCep: string) => {
    setValue("cep", newCep);
  };

  const onSubmit = async (data: StoreFormData) => {
    try {
      console.log('Enviando dados do formulário:', data);
      
      // Garante que os campos numéricos estão no formato correto
      const formattedData = {
        nome: data.nome.trim(),
        cnpj: data.cnpj.trim(),
        endereco: data.endereco.trim(),
        cep: data.cep.replace(/\D/g, ''), // Remove caracteres não numéricos
        rede_id: Number(data.rede_id),
        promotor_id: data.promotor_id === null ? null : Number(data.promotor_id),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      };

      console.log('Dados formatados:', formattedData);
      await onSave(formattedData);
      toast.success(store ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      toast.error("Erro ao salvar loja: " + (error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Loja</Label>
            <Input
              id="nome"
              {...register("nome")}
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" {...register("cnpj")} />
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                {...register("cep")}
                onChange={handleCepChange}
                className={errors.cep ? "border-red-500" : ""}
                placeholder="00000-000"
                maxLength={9}
              />
              {isFetchingCep && (
                <div className="absolute right-3 top-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.cep && (
              <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              {...register("endereco")}
              className={errors.endereco ? "border-red-500" : ""}
              disabled={isFetchingCep}
            />
            {errors.endereco && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endereco.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
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
                <p className="text-red-500 text-sm mt-1">{errors.rede_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="promotor_id">Promotor</Label>
              <Select
                onValueChange={(value) =>
                  setValue("promotor_id", value === "null" ? null : Number(value))
                }
                defaultValue={store?.promotor_id?.toString() || "null"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um promotor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum</SelectItem>
                  {promotores.map((promotor) => (
                    <SelectItem key={promotor.id} value={promotor.id.toString()}>
                      {promotor.nome} ({promotor.apelido})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-[400px] w-full rounded-md border">
            <MapPicker
              address={endereco}
              onAddressChange={handleAddressChange}
              onCepChange={handleCepUpdate}
              onLatChange={(lat) => setValue("latitude", lat)}
              onLngChange={(lng) => setValue("longitude", lng)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {store ? "Atualizar" : "Criar"} Loja
        </Button>
      </div>
    </form>
  );
}
