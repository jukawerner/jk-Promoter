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
  promotor_id: number | null;
  latitude?: number;
  longitude?: number;
  rede?: {
    id: number;
    nome: string;
  };
  promotor?: {
    id: number;
    nome: string;
    apelido: string;
    avatar_url?: string;
  } | null;
}

export type StoreFormData = Omit<Store, 'id' | 'rede' | 'promotor'>;

export interface StoreImportData {
  nome: string;
  cnpj: string;
  cep: string;
  endereco: string;
  rede_id: number;
  promotor_id: number | null;
  promotor_apelido?: string | null;
  latitude?: number;
  longitude?: number;
}
