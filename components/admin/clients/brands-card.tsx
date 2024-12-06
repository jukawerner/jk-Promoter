"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface BrandsCardProps {
  availableBrands: Array<{ id: number; name: string }>;
  selectedBrands: number[];
  onBrandToggle: (brandId: number, checked: boolean) => void;
}

export function BrandsCard({
  availableBrands,
  selectedBrands,
  onBrandToggle,
}: BrandsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Label className="text-lg font-semibold block mb-4">
        Marcas disponíveis neste cliente
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableBrands.map((brand) => (
          <div key={brand.id} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.id)}
              onCheckedChange={(checked) => onBrandToggle(brand.id, checked as boolean)}
            />
            <Label
              htmlFor={`brand-${brand.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {brand.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}