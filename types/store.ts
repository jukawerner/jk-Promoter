export interface Store {
  id?: number;
  nome: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  rede_id: number;
  promotor_id: string | null;
  rede?: {
    id: number;
    nome: string;
  };
  usuario?: {
    id: string;
    nome: string;
    apelido: string;
    avatar_url: string;
  } | null;
}

export type StoreFormData = Omit<Store, 'id' | 'rede' | 'usuario'>;

export interface StoreImportData extends StoreFormData {
  promotor_apelido?: string | null;
}
