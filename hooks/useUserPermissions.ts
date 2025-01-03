import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';

interface UserPermissions {
  isFullAdmin: boolean;
  userMarcas: number[];
  isLoading: boolean;
}

export function useUserPermissions(): UserPermissions {
  const [isFullAdmin, setIsFullAdmin] = useState(false);
  const [userMarcas, setUserMarcas] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUserPermissions() {
      try {
        // Busca o telefone dos cookies
        const phone = getCookie('userPhone');
        if (!phone) {
          router.push('/');
          return;
        }

        // Busca os dados do usuário no banco
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('*')
          .eq('telefone', phone)
          .single();

        if (userError || !userData) {
          console.error('Erro ao buscar dados do usuário:', userError);
          return;
        }

        // Busca as marcas vinculadas ao usuário
        const { data: userMarcasData, error: marcasError } = await supabase
          .from('promoter_marca')
          .select('marca_id')
          .eq('promoter_id', userData.id);

        if (marcasError) {
          console.error('Erro ao buscar marcas do usuário:', marcasError);
          return;
        }

        const marcas = userMarcasData?.map(m => m.marca_id) || [];

        // Se é admin e não tem marcas vinculadas = admin completo
        if (userData.tipo === 'Admin' && marcas.length === 0) {
          setIsFullAdmin(true);
          setUserMarcas([]);
          return;
        }

        // Se tem marcas, verifica se tem todas
        const { data: totalMarcas } = await supabase
          .from('marca')
          .select('id', { count: 'exact' });

        // Se é admin e tem todas as marcas = admin completo
        const isFullAdmin = userData.tipo === 'Admin' && 
          totalMarcas && marcas.length === totalMarcas.length;

        setIsFullAdmin(isFullAdmin);
        setUserMarcas(marcas);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserPermissions();
  }, [router]);

  return { isFullAdmin, userMarcas, isLoading };
}
