"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { MapPicker } from "./map-picker";
import { BrandMultiSelect } from "@/components/admin/brands/brand-multi-select";
import { supabase } from "@/lib/supabase/client";

const promoterSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  endereco: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  tipo: z.enum(["Promotor", "Admin"], { required_error: "Selecione um tipo de usuário" }),
  marcas: z.array(z.number()).min(1, "Selecione pelo menos uma marca"),
});

interface PromoterFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function PromoterForm({ onSave, onCancel, initialData }: PromoterFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar_url || "");
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof promoterSchema>>({
    resolver: zodResolver(promoterSchema),
    defaultValues: {
      ...initialData,
      marcas: initialData?.marcas || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      console.log('Dados iniciais recebidos:', initialData);
      reset({
        ...initialData,
        marcas: initialData.marcas || [],
      });
      setAvatarUrl(initialData.avatar_url || "");
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (initialData?.id) {
      const loadPromoterMarcas = async () => {
        const { data: marcas, error } = await supabase
          .from('promoter_marca')
          .select('marca_id')
          .eq('promoter_id', initialData.id);

        if (error) {
          console.error('Erro ao carregar marcas do promotor:', error);
          toast.error('Erro ao carregar marcas do promotor');
          return;
        }

        if (marcas) {
          const marcaIds = marcas.map(m => m.marca_id);
          setValue('marcas', marcaIds);
        }
      };

      loadPromoterMarcas();
    }
  }, [initialData?.id, setValue]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    setValue('telefone', value);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setValue('cep', value);

    if (value.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setValue('endereco', endereco, { shouldValidate: true });
          const event = new Event('change', { bubbles: true });
          document.getElementById('endereco')?.dispatchEvent(event);
        } else {
          toast.error("CEP não encontrado");
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP");
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleBrandChange = (brands: number[]) => {
    setValue('marcas', brands, { shouldValidate: true });
  };

  const onSubmit = async (data: z.infer<typeof promoterSchema>) => {
    try {
      // Se tiver um arquivo de avatar, faz o upload
      let avatar_url = initialData?.avatar_url || null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // Gera URL pública do avatar
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = publicUrl;
      }

      const promoterData = {
        nome: data.nome,
        apelido: data.apelido,
        email: data.email,
        telefone: data.telefone,
        cep: data.cep,
        endereco: data.endereco,
        tipo: data.tipo,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('usuario')
          .update(promoterData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;

        // Atualiza as marcas vinculadas
        const { error: deleteError } = await supabase
          .from('promoter_marca')
          .delete()
          .eq('promoter_id', initialData.id);

        if (deleteError) throw deleteError;

        const marcasToInsert = data.marcas.map(marcaId => ({
          promoter_id: initialData.id,
          marca_id: marcaId,
        }));

        const { error: insertError } = await supabase
          .from('promoter_marca')
          .insert(marcasToInsert);

        if (insertError) throw insertError;

        toast.success('Promotor atualizado com sucesso!');
      } else {
        const { data: newPromoter, error: insertError } = await supabase
          .from('usuario')
          .insert(promoterData)
          .select()
          .single();

        if (insertError) throw insertError;

        const marcasToInsert = data.marcas.map(marcaId => ({
          promoter_id: newPromoter.id,
          marca_id: marcaId,
        }));

        const { error: marcasError } = await supabase
          .from('promoter_marca')
          .insert(marcasToInsert);

        if (marcasError) throw marcasError;

        toast.success('Promotor criado com sucesso!');
      }

      onSave(promoterData);
      onCancel();
    } catch (error) {
      console.error('Erro ao salvar promotor:', error);
      toast.error('Erro ao salvar promotor');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Nome completo"
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apelido">Apelido</Label>
              <Input
                id="apelido"
                {...register("apelido")}
                placeholder="Apelido"
              />
              {errors.apelido && (
                <p className="text-sm text-red-500">{errors.apelido.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...register("telefone")}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  {...register("cep")}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                />
                {isLoadingCep && (
                  <div className="absolute right-3 top-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.cep && (
                <p className="text-sm text-red-500">{errors.cep.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...register("endereco")}
                placeholder="Rua, Número, Cidade - UF"
              />
              {errors.endereco && (
                <p className="text-sm text-red-500">{errors.endereco.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Marcas</Label>
              <BrandMultiSelect
                value={watch('marcas')}
                onChange={handleBrandChange}
                promoterId={initialData?.id}
                readOnly={false}
              />
              {errors.marcas && (
                <p className="text-sm text-red-500">{errors.marcas.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Usuário</Label>
              <Select
                onValueChange={(value) => setValue("tipo", value as "Promotor" | "Admin")}
                defaultValue={initialData?.tipo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Promotor">Promotor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-500">{errors.tipo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
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

            <div className="space-y-2">
              <Label>Localização no Mapa</Label>
              <MapPicker
                address={watch("endereco") || ""}
                onAddressChange={(newAddress) => setValue("endereco", newAddress)}
                onCepChange={(newCep) => setValue("cep", newCep)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
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
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Usuário'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}