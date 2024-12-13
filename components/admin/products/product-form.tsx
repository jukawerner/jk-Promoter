"use client";

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
import { useEffect } from "react";

const productSchema = z.object({
  nome: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  familia: z.string()
    .min(2, "A família deve ter pelo menos 2 caracteres")
    .max(50, "A família deve ter no máximo 50 caracteres"),
  unidade: z.enum(["UN", "KG"], {
    required_error: "Selecione uma unidade",
  }),
  peso: z.number().min(0, "Peso deve ser maior que 0"),
  validade: z.number().min(0, "Validade deve ser maior que 0"),
  marca: z.string({
    required_error: "Selecione uma marca",
  }),
});

interface ProductFormProps {
  onSave: (data: z.infer<typeof productSchema>) => void;
  onCancel: () => void;
  initialData?: z.infer<typeof productSchema> | null;
}

// Mock de marcas para teste
const MOCK_BRANDS = [
  { id: '1', nome: 'Marca A' },
  { id: '2', nome: 'Marca B' },
  { id: '3', nome: 'Marca C' },
];

export function ProductForm({ onSave, onCancel, initialData }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {}
  });

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof z.infer<typeof productSchema>, value);
      });
    }
  }, [initialData, setValue]);

  const onSubmitForm = async (data: z.infer<typeof productSchema>) => {
    onSave(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do Produto</Label>
          <Input
            id="nome"
            {...register("nome")}
            placeholder="Digite o nome do produto"
            className={errors.nome ? "border-red-500" : ""}
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="familia">Família de Produto</Label>
          <Input
            id="familia"
            {...register("familia")}
            placeholder="Digite a família do produto"
            className={errors.familia ? "border-red-500" : ""}
          />
          {errors.familia && (
            <p className="text-red-500 text-sm mt-1">{errors.familia.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unidade">Unidade</Label>
          <Select onValueChange={(value) => setValue("unidade", value as "UN" | "KG")} defaultValue={initialData?.unidade}>
            <SelectTrigger className={errors.unidade ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UN">UN</SelectItem>
              <SelectItem value="KG">KG</SelectItem>
            </SelectContent>
          </Select>
          {errors.unidade && (
            <p className="text-red-500 text-sm mt-1">{errors.unidade.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="peso">Peso do Produto</Label>
          <Input
            id="peso"
            type="number"
            step="0.01"
            {...register("peso", { valueAsNumber: true })}
            placeholder="Digite o peso"
            className={errors.peso ? "border-red-500" : ""}
          />
          {errors.peso && (
            <p className="text-red-500 text-sm mt-1">{errors.peso.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="validade">Validade do Produto (dias)</Label>
          <Input
            id="validade"
            type="number"
            {...register("validade", { valueAsNumber: true })}
            placeholder="Digite a validade em dias"
            className={errors.validade ? "border-red-500" : ""}
          />
          {errors.validade && (
            <p className="text-red-500 text-sm mt-1">{errors.validade.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="marca">Marca</Label>
          <Select onValueChange={(value) => setValue("marca", value)} defaultValue={initialData?.marca}>
            <SelectTrigger className={errors.marca ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_BRANDS.map((brand) => (
                <SelectItem key={brand.id} value={brand.nome}>
                  {brand.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.marca && (
            <p className="text-red-500 text-sm mt-1">{errors.marca.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            Salvar
          </Button>
        </div>
      </div>
    </form>
  );
}
