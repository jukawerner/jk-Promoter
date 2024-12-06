"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const brands = [
  { id: 1, name: "Marca A" },
  { id: 2, name: "Marca B" },
  { id: 3, name: "Marca C" },
];

interface BrandsCardProps {
  selectedBrands: number[];
  onBrandsChange: (brands: number[]) => void;
}

export function BrandsCard({ selectedBrands, onBrandsChange }: BrandsCardProps) {
  const [open, setOpen] = useState(false);

  const toggleBrand = (brandId: number) => {
    if (selectedBrands.includes(brandId)) {
      onBrandsChange(selectedBrands.filter(id => id !== brandId));
    } else {
      onBrandsChange([...selectedBrands, brandId]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold">Marcas</h3>
      <p className="text-sm text-gray-500">
        Selecione as marcas que este promotor irá trabalhar
      </p>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedBrands.length === 0
              ? "Selecione as marcas..."
              : `${selectedBrands.length} marca(s) selecionada(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar marca..." />
            <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.id}
                  value={brand.name}
                  onSelect={() => toggleBrand(brand.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedBrands.includes(brand.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {brand.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedBrands.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return (
                brand && (
                  <div
                    key={brand.id}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {brand.name}
                  </div>
                )
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}