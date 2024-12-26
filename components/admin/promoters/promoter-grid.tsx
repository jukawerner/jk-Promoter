"use client";

import { useState } from "react";
import { UserCard } from "./promoter-card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Promoter {
  id: number;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  endereco: string;
  tipo: string;
  avatar_url?: string;
}

interface PromoterGridProps {
  promoters: Promoter[];
  onEdit: (promoter: Promoter) => void;
  onDelete: (id: number) => void;
  onDeleteSelected: (ids: number[]) => void;
}

export function PromoterGrid({ promoters, onEdit, onDelete, onDeleteSelected }: PromoterGridProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSelectAll = () => {
    if (selectedIds.length === promoters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(promoters.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const sortedPromoters = [...promoters].sort((a, b) => {
    const compareValue = a.nome.localeCompare(b.nome);
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedIds.length === promoters.length}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-gray-500">
            {selectedIds.length} selecionado(s)
          </span>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteSelected(selectedIds)}
            >
              Excluir Selecionados
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="flex items-center gap-2"
        >
          Ordenar por Nome
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPromoters.map((promoter) => (
          <div key={promoter.id} className="relative">
            <div className="absolute left-4 top-4 z-10">
              <Checkbox
                checked={selectedIds.includes(promoter.id)}
                onCheckedChange={() => toggleSelect(promoter.id)}
              />
            </div>
            <UserCard
              promoter={promoter}
              onEdit={() => onEdit(promoter)}
              onDelete={() => onDelete(promoter.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
