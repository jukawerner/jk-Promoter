"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2, Clock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DataCurtaItem {
  id: string;
  marca: string;
  produto: string;
  quantidade: number;
  data_validade: string;
  created_at: string;
}

export default function ListaDataCurta() {
  const router = useRouter();
  const [items, setItems] = useState<DataCurtaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("data_curta")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar os dados");
    }
  };

  const handleEdit = (item: DataCurtaItem) => {
    // Implementar edição
    console.log("Editar item:", item);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("data_curta")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Item excluído com sucesso");
      loadItems(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir o item");
    }
  };

  const handleGravar = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item antes de gravar");
      return;
    }

    setLoading(true);
    try {
      // Salvar cada item no Supabase
      for (const item of items) {
        const { error } = await supabase
          .from("data_curta")
          .upsert({
            id: item.id,
            marca: item.marca,
            produto: item.produto,
            quantidade: item.quantidade,
            data_validade: item.data_validade
          });

        if (error) throw error;
      }

      toast.success("Dados gravados com sucesso!");
      router.push("/promotor/pdv"); // Volta para a página principal
    } catch (error) {
      console.error("Erro ao gravar:", error);
      toast.error("Erro ao gravar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Toaster richColors />
      
      <div className="container mx-auto p-6 max-w-[800px]">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="bg-rose-100 p-4 rounded-full">
                <Clock className="w-12 h-12 text-rose-600" />
              </div>
              <div className="absolute -right-2 -bottom-2 bg-amber-100 rounded-full p-2 shadow-sm border-2 border-white">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data Curta</h2>
              <p className="text-gray-500 mt-1">
                Produtos que estão perto do vencimento
              </p>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data de Validade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.marca}</TableCell>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.quantidade} un/kg</TableCell>
                    <TableCell>
                      {format(new Date(item.data_validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-gray-600 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={handleGravar}
              disabled={loading || items.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? "Gravando..." : "Gravar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
