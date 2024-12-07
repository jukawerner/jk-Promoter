"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandsCard } from "./brands-card";
import { StoresCard } from "./stores-card";
import { RouteMapCard } from "./route-map-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const promoterSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  endereco: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  bairro: z.string().min(2, "O bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
});

interface PromoterFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function PromoterForm({ onSave, onCancel, initialData }: PromoterFormProps) {
  const [selectedBrands, setSelectedBrands] = useState<number[]>(initialData?.marcas || []);
  const [selectedStores, setSelectedStores] = useState<number[]>(initialData?.lojas || []);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&q=80");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof promoterSchema>>({
    resolver: zodResolver(promoterSchema),
    defaultValues: initialData,
  });

  const endereco = watch("endereco");
  const cidade = watch("cidade");

  // Simulação de dados das lojas para o mapa
  const mockStores = [
    { name: "Loja A1", address: "Av. Paulista, 1000", city: "São Paulo" },
    { name: "Loja B1", address: "Rua Augusta, 500", city: "São Paulo" },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof promoterSchema>) => {
    if (selectedBrands.length === 0) {
      toast.error("Selecione pelo menos uma empresa");
      return;
    }

    if (selectedStores.length === 0) {
      toast.error("Selecione pelo menos uma loja");
      return;
    }

    onSave({
      ...data,
      marcas: selectedBrands,
      lojas: selectedStores,
      avatarUrl,
    });
    
    toast.success("Promotor salvo com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt="Avatar" />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Alterar foto
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Nome completo"
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apelido">Apelido</Label>
                <Input
                  id="apelido"
                  {...register("apelido")}
                  placeholder="Apelido"
                  className={errors.apelido ? "border-red-500" : ""}
                />
                {errors.apelido && (
                  <p className="text-red-500 text-sm">{errors.apelido.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register("telefone")}
                  placeholder="(00) 00000-0000"
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm">{errors.telefone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Residencial</Label>
                <Input
                  id="endereco"
                  {...register("endereco")}
                  placeholder="Endereço completo"
                  className={errors.endereco ? "border-red-500" : ""}
                />
                {errors.endereco && (
                  <p className="text-red-500 text-sm">{errors.endereco.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  {...register("bairro")}
                  placeholder="Nome do bairro"
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
                  placeholder="Nome da cidade"
                  className={errors.cidade ? "border-red-500" : ""}
                />
                {errors.cidade && (
                  <p className="text-red-500 text-sm">{errors.cidade.message}</p>
                )}
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
          </div>

          <BrandsCard
            selectedBrands={selectedBrands}
            onBrandsChange={setSelectedBrands}
          />
        </div>

        <div className="space-y-6">
          <StoresCard
            selectedStores={selectedStores}
            onStoresChange={setSelectedStores}
          />

          <RouteMapCard
            promoterAddress={endereco || ""}
            promoterCity={cidade || ""}
            stores={mockStores}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Promotor"}
        </Button>
      </div>
    </form>
  );
}