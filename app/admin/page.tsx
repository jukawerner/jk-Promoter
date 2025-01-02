"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getUsuarios, getUserActivity, Usuario, getTotalUsuarios, getTotalUsuariosAtivos } from "lib/actions/usuario";

export default function AdminPage() {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalUsuariosAtivos, setTotalUsuariosAtivos] = useState(0);
  const [usuariosAtivos, setUsuariosAtivos] = useState<Usuario[]>([]);
  const [usuariosMenosAtivos, setUsuariosMenosAtivos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Buscando dados do dashboard...");
      setLoading(true);
      setError(null);
      
      try {
        const [total, ativos] = await Promise.all([
          getTotalUsuarios(),
          getTotalUsuariosAtivos()
        ]);
        setTotalUsuarios(total);
        setTotalUsuariosAtivos(ativos);

        const userActivity = await getUserActivity();
        setUsuariosAtivos(userActivity.slice(0, 5)); // Top 5 mais ativos
        setUsuariosMenosAtivos(userActivity.slice(-5).reverse()); // Top 5 menos ativos
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setError("Erro ao carregar dados do dashboard. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6"
    >
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-700">Carregando dados do dashboard...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <p className="mt-2 text-sm">
            Se o problema persistir, verifique:
            <ul className="list-disc list-inside ml-4">
              <li>Se a tabela 'informacoes' existe e está populada</li>
              <li>Se a tabela 'usuario' existe e está populada</li>
              <li>Se o relacionamento entre as tabelas está configurado corretamente</li>
              <li>Se as permissões de acesso ao banco de dados estão configuradas</li>
              <li>Se as tabelas possuem as colunas necessárias</li>
            </ul>
            <p className="mt-2">
              Para mais detalhes, consulte o console do navegador (F12) e verifique os logs de erro.
            </p>
          </p>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Painel do Administrador
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Usuários Totais vs Ativos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Usuários</h2>
          <div className="space-y-2">
            {totalUsuarios > 0 ? (
              <>
                <p className="text-gray-600">
                  Total: <span className="font-medium">{totalUsuarios}</span>
                </p>
                <p className="text-gray-600">
                  Ativos hoje: <span className="font-medium">{totalUsuariosAtivos}</span>
                </p>
                {usuariosAtivos.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhuma atividade registrada hoje
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Nenhum usuário cadastrado</p>
            )}
          </div>
        </div>

        {/* Top 5 Usuários com Mais Interação */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 5 Mais Ativos</h2>
          <div className="space-y-2">
            {usuariosAtivos.length > 0 ? (
              usuariosAtivos.map((usuario, index) => (
                <div key={usuario.id} className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {index + 1}. {usuario.nome}
                  </p>
                  <span className="text-sm text-gray-500">{usuario.interacoes} interações</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum usuário ativo encontrado</p>
            )}
          </div>
        </div>

        {/* Top 5 Usuários com Menos Interação */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 5 Menos Ativos</h2>
          <div className="space-y-2">
            {usuariosMenosAtivos.length > 0 ? (
              usuariosMenosAtivos.map((usuario, index) => (
                <div key={usuario.id} className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {index + 1}. {usuario.nome}
                  </p>
                  <span className="text-sm text-gray-500">{usuario.interacoes} interações</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum usuário menos ativo encontrado</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
