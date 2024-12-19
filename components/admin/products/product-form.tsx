'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMarcas } from '@/lib/actions/produto'
import { toast } from 'sonner'

const productSchema = z.object({
  ean: z.string()
    .min(8, 'O código EAN deve ter pelo menos 8 dígitos')
    .max(14, 'O código EAN deve ter no máximo 14 dígitos')
    .regex(/^\d+$/, 'O código EAN deve conter apenas números'),
  nome: z.string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  familia: z.string()
    .min(2, 'A família deve ter pelo menos 2 caracteres')
    .max(50, 'A família deve ter no máximo 50 caracteres'),
  unidade: z.enum(['UN', 'KG'], {
    required_error: 'Selecione uma unidade',
  }),
  peso: z.number().min(0, 'Peso deve ser maior que 0'),
  validade: z.number().min(0, 'Validade deve ser maior que 0'),
  marca: z.string({
    required_error: 'Selecione uma marca',
  }),
})

type ProductFormData = z.infer<typeof productSchema>

interface Marca {
  id: number
  nome: string
}

interface ProductFormProps {
  onSave: (data: ProductFormData) => void
  onCancel: () => void
  initialData?: ProductFormData | null
}

export function ProductForm({ onSave, onCancel, initialData }: ProductFormProps) {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      ean: '',
      nome: '',
      familia: '',
      unidade: 'UN',
      peso: 0,
      validade: 0,
      marca: '',
    },
  })

  useEffect(() => {
    loadMarcas()
  }, [])

  async function loadMarcas() {
    try {
      setIsLoading(true)
      const data = await getMarcas()
      setMarcas(data)
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
      toast.error('Erro ao carregar marcas')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      await onSave(data)
      reset()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="ean">Código EAN</Label>
        <Input
          id="ean"
          {...register('ean')}
          placeholder="Digite o código EAN"
        />
        {errors.ean && (
          <p className="text-sm text-red-500 mt-1">{errors.ean.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          {...register('nome')}
          placeholder="Digite o nome do produto"
        />
        {errors.nome && (
          <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="familia">Família</Label>
        <Input
          id="familia"
          {...register('familia')}
          placeholder="Digite a família do produto"
        />
        {errors.familia && (
          <p className="text-sm text-red-500 mt-1">{errors.familia.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="unidade">Unidade</Label>
        <Select onValueChange={(value) => setValue('unidade', value as 'UN' | 'KG')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UN">Unidade (UN)</SelectItem>
            <SelectItem value="KG">Quilograma (KG)</SelectItem>
          </SelectContent>
        </Select>
        {errors.unidade && (
          <p className="text-sm text-red-500 mt-1">{errors.unidade.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="peso">Peso (em gramas)</Label>
        <Input
          id="peso"
          type="number"
          {...register('peso', { valueAsNumber: true })}
          placeholder="Digite o peso"
        />
        {errors.peso && (
          <p className="text-sm text-red-500 mt-1">{errors.peso.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="validade">Validade (em dias)</Label>
        <Input
          id="validade"
          type="number"
          {...register('validade', { valueAsNumber: true })}
          placeholder="Digite a validade"
        />
        {errors.validade && (
          <p className="text-sm text-red-500 mt-1">{errors.validade.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="marca">Marca</Label>
        <Select onValueChange={(value) => setValue('marca', value)}>
          <SelectTrigger>
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
        {errors.marca && (
          <p className="text-sm text-red-500 mt-1">{errors.marca.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          Salvar
        </Button>
      </div>
    </form>
  )
}
