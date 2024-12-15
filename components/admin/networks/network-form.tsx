"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const networkSchema = z.object({
  name: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
});

interface NetworkFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NetworkForm({ onSubmit, onCancel }: NetworkFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof networkSchema>>({
    resolver: zodResolver(networkSchema),
  });

  const onSubmitForm = async (data: z.infer<typeof networkSchema>) => {
    onSubmit(data.name);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome da Rede</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Digite o nome da rede"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
