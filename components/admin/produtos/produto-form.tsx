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
import { getMarcas } from "@/lib/actions/produto";

const produtoSchema = z.object({
  codigo_ean: z.string().optional(),
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  familia: z.string().min(2, "A família deve ter pelo menos 2 caracteres"),
  unidade: z.string().min(1, "Selecione uma unidade"),
  peso: z.coerce.number().min(1, "O peso deve ser maior que 0"),
  validade: z.coerce.number().min(1, "A validade deve ser maior que 0"),
  marca_id: z.coerce.number({ required_error: "Selecione uma marca" }),
});

interface ProdutoFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ProdutoForm({ onSave, onCancel, initialData }: ProdutoFormProps) {
  const [marcas, setMarcas] = useState<{ id: number; nome: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof produtoSchema>>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      ...initialData,
      marca_id: initialData?.marca_id?.toString()
    },
  });

  useEffect(() => {
    loadMarcas();
  }, []);

  const loadMarcas = async () => {
    try {
      const data = await getMarcas();
      setMarcas(data);
    } catch (error) {
      toast.error("Erro ao carregar marcas");
      console.error(error);
    }
  };

  const onSubmit = async (data: z.infer<typeof produtoSchema>) => {
    try {
      setIsLoading(true);
      await onSave(data);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="codigo_ean">Código EAN</Label>
            <Input
              id="codigo_ean"
              {...register("codigo_ean")}
              placeholder="Digite o código EAN do produto"
              className={errors.codigo_ean ? "border-red-500" : ""}
            />
            {errors.codigo_ean && (
              <p className="text-red-500 text-sm">{errors.codigo_ean.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              {...register("nome")}
              placeholder="Digite o nome do produto"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="familia">Família de Produto</Label>
            <Input
              id="familia"
              {...register("familia")}
              placeholder="Digite a família do produto"
              className={errors.familia ? "border-red-500" : ""}
            />
            {errors.familia && (
              <p className="text-red-500 text-sm">{errors.familia.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Select
              onValueChange={(value) => setValue("unidade", value)}
              defaultValue={initialData?.unidade}
            >
              <SelectTrigger className={errors.unidade ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="quilograma">Quilograma</SelectItem>
              </SelectContent>
            </Select>
            {errors.unidade && (
              <p className="text-red-500 text-sm">{errors.unidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso">Peso (em gramas)</Label>
            <Input
              id="peso"
              type="number"
              {...register("peso")}
              placeholder="Digite o peso em gramas"
              className={errors.peso ? "border-red-500" : ""}
            />
            {errors.peso && (
              <p className="text-red-500 text-sm">{errors.peso.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="validade">Validade (em dias)</Label>
            <Input
              id="validade"
              type="number"
              {...register("validade")}
              placeholder="Digite a validade em dias"
              className={errors.validade ? "border-red-500" : ""}
            />
            {errors.validade && (
              <p className="text-red-500 text-sm">{errors.validade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca_id">Marca</Label>
            <Select
              onValueChange={(value) => setValue("marca_id", parseInt(value))}
              defaultValue={initialData?.marca_id?.toString()}
            >
              <SelectTrigger className={errors.marca_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((marca) => (
                  <SelectItem key={marca.id} value={marca.id.toString()}>
                    {marca.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.marca_id && (
              <p className="text-red-500 text-sm">{errors.marca_id.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
