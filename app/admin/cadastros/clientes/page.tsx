"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/admin/clients/client-form";
import { ClientCard } from "@/components/admin/clients/client-card";
import { ClientFilter } from "@/components/admin/clients/client-filter";
import { ExcelUpload } from "@/components/admin/clients/excel-upload";

interface Client {
  id: number;
  rede: string;
  cnpj: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
  marcas: number[];
}

// Dados de exemplo para teste
const INITIAL_CLIENTS: Client[] = [
  {
    id: 1,
    rede: "Supermercado ABC",
    cnpj: "12.345.678/0001-90",
    loja: "Filial Centro",
    endereco: "Rua das Flores, 123",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "01234-567",
    uf: "SP",
    marcas: [1, 2]
  },
  {
    id: 2,
    rede: "Mercado XYZ",
    cnpj: "98.765.432/0001-21",
    loja: "Unidade Jardins",
    endereco: "Av. Paulista, 1000",
    bairro: "Jardins",
    cidade: "São Paulo",
    cep: "04567-890",
    uf: "SP",
    marcas: [1, 3]
  },
  {
    id: 3,
    rede: "Supermercado ABC",
    cnpj: "12.345.678/0002-71",
    loja: "Filial Campinas",
    endereco: "Av. Brasil, 500",
    bairro: "Centro",
    cidade: "Campinas",
    cep: "13024-851",
    uf: "SP",
    marcas: [2, 3]
  }
];

export default function CadastroClientes() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS); // Inicializando com dados de exemplo
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState({
    rede: "",
    loja: "",
    cidade: "",
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const redeMatch = client.rede.toLowerCase().includes(filters.rede.toLowerCase());
      const lojaMatch = client.loja.toLowerCase().includes(filters.loja.toLowerCase());
      const cidadeMatch = client.cidade.toLowerCase().includes(filters.cidade.toLowerCase());
      
      return redeMatch && lojaMatch && cidadeMatch;
    });
  }, [clients, filters]);

  const handleSaveClient = (client: Omit<Client, "id">) => {
    if (editingClient) {
      setClients(clients.map(c => 
        c.id === editingClient.id ? { ...client, id: editingClient.id } : c
      ));
      setEditingClient(null);
    } else {
      setClients([...clients, { ...client, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Clientes</h1>
          <p className="text-gray-600 mt-2">Gerencie os clientes do sistema</p>
        </div>
        <div className="flex gap-2">
          <ExcelUpload
            onClientsImported={(importedClients) => {
              const newClients = importedClients.map((client) => ({
                ...client,
                id: Date.now() + Math.random(),
                marcas: [],
              }));
              setClients((prevClients) => [...prevClients, ...newClients]);
            }}
          />
          <Button
            onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {!showForm && (
        <ClientFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {showForm ? (
        <ClientForm
          onSave={handleSaveClient}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          initialData={editingClient}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => handleEditClient(client)}
            />
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {clients.length === 0
                  ? "Nenhum cliente cadastrado. Clique em \"Adicionar Cliente\" para começar."
                  : "Nenhum cliente encontrado com os filtros aplicados."}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}