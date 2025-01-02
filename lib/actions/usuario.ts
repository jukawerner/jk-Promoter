import { supabase } from 'lib/supabase/client';

export async function getTotalUsuarios(): Promise<number> {
  const { count, error } = await supabase
    .from('usuario')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'promotor');

  if (error) {
    console.error('Erro ao buscar total de promotores:', error);
    throw error;
  }

  return count || 0;
}

export async function getTotalUsuariosAtivos(): Promise<number> {
  const hoje = new Date().toISOString().split('T')[0];
  
  const { count, error } = await supabase
    .from('informacoes')
    .select('usuario_id', { count: 'exact', head: true })
    .gte('created_at', `${hoje}T00:00:00`)
    .lte('created_at', `${hoje}T23:59:59`);

  if (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    throw error;
  }

  return count || 0;
}

import { QueryData } from '@supabase/supabase-js';

export interface Usuario {
  id: number;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  tipo: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  interacoes?: number;
}

export type CreateUsuarioInput = Omit<Usuario, 'id' | 'created_at' | 'updated_at'>;

interface UserActivity {
  usuario_id?: number;
  count?: number;
  usuario?: {
    id?: number;
    nome?: string;
    apelido?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cep?: string;
    tipo?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  }[];
}

export async function getUserActivity(): Promise<Usuario[]> {
  console.log('Buscando usuários ativos...');
  
  try {
    // Primeiro verifica se a tabela e colunas existem
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'informacoes' });

    if (columnsError) {
      console.error('Erro ao verificar colunas da tabela:', columnsError);
      throw columnsError;
    }

    // Verifica se a coluna created_at existe
    const hasCreatedAt = columns.some((col: any) => col.column_name === 'created_at');
    if (!hasCreatedAt) {
      throw new Error('Coluna created_at não encontrada na tabela informacoes');
    }

    const hoje = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('informacoes')
      .select('usuario_id, created_at, usuario:usuario_id(*)')
      .gte('created_at', `${hoje}T00:00:00`)
      .lte('created_at', `${hoje}T23:59:59`);

    if (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('Nenhum usuário ativo encontrado hoje');
      return [];
    }

    // Remove duplicados e mapeia para o tipo Usuario
    const usuariosAtivos = data.reduce((acc: Usuario[], item: any) => {
      const usuarioData = Array.isArray(item.usuario) ? item.usuario[0] : item.usuario;
      
      if (usuarioData && !acc.some(u => u.id === usuarioData.id)) {
        acc.push({
          id: usuarioData.id,
          nome: usuarioData.nome || '',
          apelido: usuarioData.apelido || '',
          email: usuarioData.email || '',
          telefone: usuarioData.telefone || '',
          endereco: usuarioData.endereco || '',
          cep: usuarioData.cep || '',
          tipo: usuarioData.tipo || '',
          avatar_url: usuarioData.avatar_url,
          created_at: usuarioData.created_at,
          updated_at: usuarioData.updated_at,
          interacoes: 1 // Considera 1 interação por dia
        });
      }
      return acc;
    }, []);

    return usuariosAtivos;
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    throw error;
  }
}

export async function getUsuarios(): Promise<Usuario[]> {
  console.log('Buscando lista de usuários...');
  
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }

    console.log('Usuários recuperados com sucesso:', data);
    
    if (!data || data.length === 0) {
      console.warn('Nenhum usuário encontrado');
      return [];
    }

    // Verifica se os dados contêm a estrutura esperada
    const hasValidStructure = data.every(usuario => 
      usuario.id && usuario.nome && usuario.email
    );

    if (!hasValidStructure) {
      console.error('Estrutura de dados inválida:', data);
      throw new Error('Estrutura de dados inválida retornada do banco de dados. Verifique:\n' +
        '- Se a tabela "usuario" existe\n' +
        '- Se as colunas necessárias estão presentes\n' +
        '- Se os dados estão no formato esperado\n' +
        '- Se as permissões de acesso estão configuradas corretamente\n' +
        '- Se o relacionamento com a tabela "informacoes" está configurado corretamente\n' +
        '- Se há dados nas tabelas relacionadas\n' +
        '- Se as políticas de RLS (Row Level Security) estão configuradas corretamente\n' +
        '- Se o usuário autenticado tem permissão para acessar os dados\n' +
        '- Se o token de autenticação é válido e não expirou');
    }

    return data;
  } catch (error) {
    console.error('Erro crítico ao buscar usuários:', error);
    throw error;
  }
}

export async function updateUsuario(id: number, data: Partial<CreateUsuarioInput>): Promise<Usuario> {
  const { data: usuario, error } = await supabase
    .from('usuario')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }

  return usuario;
}

export async function deleteUsuario(id: number): Promise<void> {
  console.log('Iniciando exclusão do usuário no Supabase, ID:', id);
  
  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro detalhado ao deletar usuário no Supabase:', error);
    throw error;
  }
  
  console.log('Usuário excluído com sucesso do Supabase');
}

export async function uploadAvatar(file: File): Promise<string> {
  const maxSize = 1024 * 1024;
  if (file.size > maxSize) {
    const compressedFile = await compressImage(file);
    file = compressedFile;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Erro ao fazer upload do avatar:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrl;
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Falha ao comprimir imagem'));
          }
        }, 'image/jpeg', 0.7);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function deleteAvatar(url: string): Promise<void> {
  const path = url.split('/').pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from('avatars')
    .remove([`avatars/${path}`]);

  if (error) {
    console.error('Erro ao deletar avatar:', error);
    throw error;
  }
}
