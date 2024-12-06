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

const networks = [
  {
    id: 1,
    name: "Rede A",
    stores: [
      { id: 1, name: "Loja A1" },
      { id: 2, name: "Loja A2" },
    ],
  },
  {
    id: 2,
    name: "Rede B",
    stores: [
      { id: 3, name: "Loja B1" },
      { id: 4, name: "Loja B2" },
    ],
  },
];

interface StoresCardProps {
  selectedStores: number[];
  onStoresChange: (stores: number[]) => void;
}

export function StoresCard({ selectedStores, onStoresChange }: StoresCardProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);
  const [openNetwork, setOpenNetwork] = useState(false);
  const [openStores, setOpenStores] = useState(false);

  const currentNetwork = networks.find((n) => n.id === selectedNetwork);

  const toggleStore = (storeId: number) => {
    if (selectedStores.includes(storeId)) {
      onStoresChange(selectedStores.filter(id => id !== storeId));
    } else {
      onStoresChange([...selectedStores, storeId]);
    }
  };

  const getAllStores = () => {
    return networks.reduce((acc, network) => {
      return [...acc, ...network.stores];
    }, [] as { id: number; name: string }[]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold">Lojas</h3>
      <p className="text-sm text-gray-500">
        Selecione as lojas onde este promotor irá atuar
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Selecione a Rede
          </label>
          <Popover open={openNetwork} onOpenChange={setOpenNetwork}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openNetwork}
                className="w-full justify-between"
              >
                {selectedNetwork
                  ? networks.find((network) => network.id === selectedNetwork)?.name
                  : "Selecione uma rede..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar rede..." />
                <CommandEmpty>Nenhuma rede encontrada.</CommandEmpty>
                <CommandGroup>
                  {networks.map((network) => (
                    <CommandItem
                      key={network.id}
                      value={network.name}
                      onSelect={() => {
                        setSelectedNetwork(
                          selectedNetwork === network.id ? null : network.id
                        );
                        setOpenNetwork(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedNetwork === network.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {network.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Selecione as Lojas
          </label>
          <Popover open={openStores} onOpenChange={setOpenStores}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStores}
                className="w-full justify-between"
                disabled={!selectedNetwork}
              >
                {selectedStores.length === 0
                  ? "Selecione as lojas..."
                  : `${selectedStores.length} loja(s) selecionada(s)`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar loja..." />
                <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
                <CommandGroup>
                  {currentNetwork?.stores.map((store) => (
                    <CommandItem
                      key={store.id}
                      value={store.name}
                      onSelect={() => toggleStore(store.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStores.includes(store.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {store.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedStores.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {selectedStores.map((storeId) => {
              const store = getAllStores().find((s) => s.id === storeId);
              return (
                store && (
                  <div
                    key={store.id}
                    className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {store.name}
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