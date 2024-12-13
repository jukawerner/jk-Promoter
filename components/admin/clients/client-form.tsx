"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./map"), { ssr: false });

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const clientSchema = z.object({
  rede: z.string().min(2, "A rede deve ter pelo menos 2 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido. Use o formato: XX.XXX.XXX/XXXX-XX"),
  loja: z.string().min(2, "A loja deve ter pelo menos 2 caracteres"),
  endereco: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  numero: z.string().min(1, "Informe o número"),
  bairro: z.string().min(2, "O bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  uf: z.string().length(2, "Selecione um estado"),
});

interface ClientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ClientForm({ onSave, onCancel, initialData }: ClientFormProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      ...initialData,
      uf: initialData?.uf || "",
    },
  });

  const endereco = form.watch("endereco");
  const cidade = form.watch("cidade");
  const uf = form.watch("uf");

  const handleLocationChange = async (lat: number, lng: number) => {
    setIsUpdatingAddress(true);
    setLocation([lat, lng]);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        const {
          road,
          house_number,
          suburb,
          city,
          town,
          postcode,
          state,
        } = data.address;

        form.setValue("endereco", road || "");
        form.setValue("numero", house_number || "");
        form.setValue("bairro", suburb || "");
        form.setValue("cidade", city || town || "");
        form.setValue("cep", postcode || "");
        form.setValue("uf", state || "");
      }
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleAddressChange = async () => {
    const endereco = form.getValues("endereco");
    const numero = form.getValues("numero");
    const bairro = form.getValues("bairro");
    const cidade = form.getValues("cidade");
    const uf = form.getValues("uf");

    if (!endereco || !cidade || !uf) return;

    setIsLoadingLocation(true);
    try {
      const query = `${endereco}, ${numero || ""}, ${cidade}, ${uf}, Brasil`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon } = data[0];
        setLocation([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Erro ao buscar localização:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleAddressChange, 1000);
    return () => clearTimeout(timer);
  }, [endereco, cidade, uf]);

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    try {
      if (!location) {
        toast.error("Não foi possível determinar a localização do endereço");
        return;
      }

      // Ensure UF is in uppercase
      const formData = {
        ...data,
        uf: data.uf.toUpperCase(),
        location,
      };

      await onSave(formData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar o cliente. Por favor, tente novamente.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rede">Rede</Label>
              <Input
                id="rede"
                {...form.register("rede")}
                className={form.formState.errors.rede ? "border-red-500" : ""}
              />
              {form.formState.errors.rede && (
                <p className="text-red-500 text-sm">{form.formState.errors.rede.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  {...form.register("cnpj")}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className={form.formState.errors.cnpj ? "border-red-500" : ""}
                />
                {form.formState.errors.cnpj && (
                  <p className="text-red-500 text-sm">{form.formState.errors.cnpj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loja">Loja</Label>
                <Input
                  id="loja"
                  {...form.register("loja")}
                  className={form.formState.errors.loja ? "border-red-500" : ""}
                />
                {form.formState.errors.loja && (
                  <p className="text-red-500 text-sm">{form.formState.errors.loja.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Input
                    id="endereco"
                    {...form.register("endereco")}
                    placeholder="Nome da rua"
                    className={form.formState.errors.endereco ? "border-red-500" : ""}
                  />
                  {form.formState.errors.endereco && (
                    <p className="text-red-500 text-sm">{form.formState.errors.endereco.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="numero"
                    {...form.register("numero")}
                    placeholder="Número"
                    className={form.formState.errors.numero ? "border-red-500" : ""}
                  />
                  {form.formState.errors.numero && (
                    <p className="text-red-500 text-sm">{form.formState.errors.numero.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  {...form.register("bairro")}
                  className={form.formState.errors.bairro ? "border-red-500" : ""}
                />
                {form.formState.errors.bairro && (
                  <p className="text-red-500 text-sm">{form.formState.errors.bairro.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...form.register("cidade")}
                  className={form.formState.errors.cidade ? "border-red-500" : ""}
                />
                {form.formState.errors.cidade && (
                  <p className="text-red-500 text-sm">{form.formState.errors.cidade.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  {...form.register("cep")}
                  placeholder="00000-000"
                  className={form.formState.errors.cep ? "border-red-500" : ""}
                />
                {form.formState.errors.cep && (
                  <p className="text-red-500 text-sm">{form.formState.errors.cep.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("uf", value);
                    form.trigger("uf");
                  }}
                  value={form.getValues("uf")}
                  defaultValue={initialData?.uf || ""}
                >
                  <SelectTrigger
                    className={form.formState.errors.uf ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.uf && (
                  <p className="text-red-500 text-sm">{form.formState.errors.uf.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-[600px] relative">
            {(isLoadingLocation || isUpdatingAddress) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <p className="text-gray-500">
                  {isLoadingLocation ? "Carregando localização..." : "Atualizando endereço..."}
                </p>
              </div>
            )}
            <div className="h-full w-full">
              {location ? (
                <div className="h-full w-full" key={`map-${location[0]}-${location[1]}`}>
                  <Map 
                    location={location} 
                    onLocationChange={handleLocationChange}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">
                    Preencha o endereço completo para visualizar no mapa
                    <br />
                    ou clique no mapa para selecionar uma localização
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}