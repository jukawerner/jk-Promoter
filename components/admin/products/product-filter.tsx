'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ProductFilterProps {
  filters: {
    nome: string
    familia: string
    marca: string
  }
  onFilterChange: (field: string, value: string) => void
}

export function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Filtrar Produtos</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Filtrar por nome do produto"
            value={filters.nome}
            onChange={(e) => onFilterChange('nome', e.target.value)}
          />
        </div>
        <div>
          <Input
            placeholder="Filtrar por família"
            value={filters.familia}
            onChange={(e) => onFilterChange('familia', e.target.value)}
          />
        </div>
        <div>
          <Input
            placeholder="Filtrar por marca"
            value={filters.marca}
            onChange={(e) => onFilterChange('marca', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
