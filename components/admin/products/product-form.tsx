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

const productSchema = z.object({
  name: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  family: z.string()
    .min(2, "A família deve ter pelo menos 2 caracteres")
    .max(50, "A família deve ter no máximo 50 caracteres"),
  unit: z.enum(["UN", "KG"], {
    required_error: "Selecione uma unidade",
  }),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Peso deve ser um número válido maior que 0",
  }),
  validity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Validade deve ser um número válido maior que 0",
  }),
  brand: z.string({
    required_error: "Selecione uma marca",
  }),
});

interface ProductFormProps {
  onSubmit: (data: z.infer<typeof productSchema>) => void;
  onCancel: () => void;
}

// Mock de marcas para teste
const MOCK_BRANDS = [
  { id: '1', nome: 'Marca A' },
  { id: '2', nome: 'Marca B' },
  { id: '3', nome: 'Marca C' },
];

export function ProductForm({ onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const onSubmitForm = async (data: z.infer<typeof productSchema>) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Digite o nome do produto"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="family">Família de Produto</Label>
          <Input
            id="family"
            {...register("family")}
            placeholder="Digite a família do produto"
            className={errors.family ? "border-red-500" : ""}
          />
          {errors.family && (
            <p className="text-red-500 text-sm mt-1">{errors.family.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unit">Unidade</Label>
          <Select onValueChange={(value) => setValue("unit", value as "UN" | "KG")}>
            <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UN">UN</SelectItem>
              <SelectItem value="KG">KG</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="weight">Peso do Produto</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            {...register("weight")}
            placeholder="Digite o peso"
            className={errors.weight ? "border-red-500" : ""}
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="validity">Validade do Produto (dias)</Label>
          <Input
            id="validity"
            type="number"
            {...register("validity")}
            placeholder="Digite a validade em dias"
            className={errors.validity ? "border-red-500" : ""}
          />
          {errors.validity && (
            <p className="text-red-500 text-sm mt-1">{errors.validity.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="brand">Marca</Label>
          <Select onValueChange={(value) => setValue("brand", value)}>
            <SelectTrigger className={errors.brand ? "border-red-500" : ""}>
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
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
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
