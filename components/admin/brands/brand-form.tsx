"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const brandSchema = z.object({
  nome: z.string().min(1, "O nome da marca é obrigatório"),
});

interface BrandFormProps {
  onSubmit: (nome: string) => void;
  onCancel: () => void;
  initialData?: string;
}

export function BrandForm({ onSubmit, onCancel, initialData }: BrandFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      nome: initialData || "",
    },
  });

  const onSubmitForm = async (data: z.infer<typeof brandSchema>) => {
    onSubmit(data.nome);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Marca</Label>
        <Input
          id="nome"
          placeholder="Digite o nome da marca"
          {...register("nome")}
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}