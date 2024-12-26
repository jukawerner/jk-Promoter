"use client";

import { useState } from "react";
import { StoreCard } from "./store-card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Store } from "@/types/store";

interface StoreGridProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (id: number) => void;
  onDeleteSelected: (ids: number[]) => void;
}

export function StoreGrid({ stores, onEdit, onDelete, onDeleteSelected }: StoreGridProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSelectAll = () => {
    if (selectedIds.length === stores.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stores.map(p => p.id));
    }
  };

  const toggleSelect = (store: Store) => {
    setSelectedIds(prev =>
      prev.includes(store.id)
        ? prev.filter(selectedId => selectedId !== store.id)
        : [...prev, store.id]
    );
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const sortedStores = [...stores].sort((a, b) => {
    const compareValue = a.nome.localeCompare(b.nome);
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedIds.length === stores.length}
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
        {sortedStores.map((store) => (
          <div key={store.id}>
            <StoreCard
              store={store}
              onEdit={onEdit}
              onDelete={() => onDelete(store.id)}
              selected={selectedIds.includes(store.id)}
              onSelect={toggleSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
