import { supabase } from '@/lib/supabase';

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
}

export type CreateUsuarioInput = Omit<Usuario, 'id' | 'created_at' | 'updated_at'>;

export async function createUsuario(data: CreateUsuarioInput): Promise<Usuario> {
  const { data: usuario, error } = await supabase
    .from('usuario')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505' && error.message.includes('usuario_email_key')) {
      throw new Error(`O email ${data.email} já está cadastrado para outro usuário`);
    }
    throw error;
  }

  return usuario;
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }

  return data || [];
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
  // Comprime a imagem antes do upload se for muito grande
  const maxSize = 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    const compressedFile = await compressImage(file);
    file = compressedFile;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
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

// Função auxiliar para comprimir imagens
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
        
        // Define o tamanho máximo
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        // Redimensiona mantendo a proporção
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
