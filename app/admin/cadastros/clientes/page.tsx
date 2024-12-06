"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/admin/clients/client-form";
import { ClientCard } from "@/components/admin/clients/client-card";

interface Client {
  id: number;
  rede: string;
  loja: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  marcas: number[];
}

export default function CadastroClientes() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => handleEditClient(client)}
            />
          ))}
          {clients.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                Nenhum cliente cadastrado. Clique em "Adicionar Cliente" para começar.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}