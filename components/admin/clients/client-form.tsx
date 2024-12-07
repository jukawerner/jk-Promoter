"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { BrandsCard } from "./brands-card";

const Map = dynamic(() => import("./map"), { ssr: false });

const clientSchema = z.object({
  rede: z.string().min(2, "A rede deve ter pelo menos 2 caracteres"),
  loja: z.string().min(2, "A loja deve ter pelo menos 2 caracteres"),
  endereco: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  bairro: z.string().min(2, "O bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
});

interface ClientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ClientForm({ onSave, onCancel, initialData }: ClientFormProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [availableBrands] = useState([
    { id: 1, name: "Marca A" },
    { id: 2, name: "Marca B" },
    { id: 3, name: "Marca C" },
  ]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  const endereco = watch("endereco");
  const cidade = watch("cidade");

  useEffect(() => {
    const updateLocation = async () => {
      if (endereco && cidade) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              `${endereco}, ${cidade}`
            )}`
          );
          const data = await response.json();
          if (data && data[0]) {
            setLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        } catch (error) {
          console.error("Erro ao buscar localização:", error);
        }
      }
    };

    const timer = setTimeout(updateLocation, 1000);
    return () => clearTimeout(timer);
  }, [endereco, cidade]);

  const handleBrandToggle = (brandId: number, checked: boolean) => {
    setSelectedBrands(prev =>
      checked
        ? [...prev, brandId]
        : prev.filter(id => id !== brandId)
    );
  };

  const onSubmit = (data: z.infer<typeof clientSchema>) => {
    if (selectedBrands.length === 0) {
      toast.error("Selecione pelo menos uma empresa");
      return;
    }

    if (!location) {
      toast.error("Não foi possível determinar a localização");
      return;
    }

    onSave({
      ...data,
      marcas: selectedBrands,
      location,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rede">Rede</Label>
                <Input
                  id="rede"
                  {...register("rede")}
                  className={errors.rede ? "border-red-500" : ""}
                />
                {errors.rede && (
                  <p className="text-red-500 text-sm">{errors.rede.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loja">Loja</Label>
                <Input
                  id="loja"
                  {...register("loja")}
                  className={errors.loja ? "border-red-500" : ""}
                />
                {errors.loja && (
                  <p className="text-red-500 text-sm">{errors.loja.message}</p>
                )}
              </div>
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register("cep")}
                placeholder="00000-000"
                className={errors.cep ? "border-red-500" : ""}
              />
              {errors.cep && (
                <p className="text-red-500 text-sm">{errors.cep.message}</p>
              )}
            </div>
          </div>

          <BrandsCard
            availableBrands={availableBrands}
            selectedBrands={selectedBrands}
            onBrandToggle={handleBrandToggle}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <Label>Localização do Cliente</Label>
            <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
              {location ? (
                <Map location={location} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">
                    Digite o endereço completo para visualizar no mapa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Cliente
        </Button>
      </div>
    </form>
  );
}