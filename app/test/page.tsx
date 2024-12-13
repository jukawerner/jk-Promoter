'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [message, setMessage] = useState('Testando conexão...')

  useEffect(() => {
    async function testConnection() {
      try {
        // Exemplo de uma consulta simples
        const { data, error } = await supabase
          .from('promotores')  // Substitua pelo nome da sua tabela
          .select('*')
          .limit(1)

        if (error) {
          throw error
        }

        setMessage(`Conexão bem sucedida! ${data ? `Encontrados ${data.length} registros.` : 'Nenhum registro encontrado.'}`)
      } catch (error) {
        console.error('Erro:', error)
        setMessage(`Erro na conexão: ${error.message}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste do Supabase</h1>
      <div className="p-4 border rounded">
        <p>{message}</p>
      </div>
    </div>
  )
}
