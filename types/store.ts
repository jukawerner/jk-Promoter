export interface Store {
  id?: number;
  nome: string;
  cnpj: string;
  endereco: string;
  cep: string;
  rede_id: number;
  promotor_id: number | null;
  latitude: number;
  longitude: number;
  rede?: {
    id: number;
    nome: string;
  };
  usuario?: {
    id: number;
    nome: string;
    apelido: string;
    avatar_url: string;
  } | null;
}

export type StoreFormData = Omit<Store, 'id' | 'rede' | 'usuario'>;

export interface StoreImportData extends StoreFormData {
  promotor_apelido?: string | null;
}
