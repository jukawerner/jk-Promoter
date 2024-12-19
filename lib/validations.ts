import { z } from 'zod'

// Validações comuns
const phoneRegex = /^(\+\d{1,3})?[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}$/
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const cepRegex = /^\d{5}-?\d{3}$/

// Esquema base para endereço
export const addressSchema = z.object({
  endereco: z.string().min(3).max(255),
  numero: z.string().min(1).max(10),
  bairro: z.string().min(3).max(100),
  cidade: z.string().min(3).max(100),
  uf: z.string().length(2),
  cep: z.string().regex(cepRegex, 'CEP inválido')
})

// Esquema para usuário
export const userSchema = z.object({
  nome: z.string().min(3).max(255),
  email: z.string().email(),
  telefone: z.string().regex(phoneRegex, 'Telefone inválido'),
  tipo: z.enum(['ADMIN', 'PROMOTOR']),
  ...addressSchema.shape
})

// Esquema para loja
export const storeSchema = z.object({
  nome: z.string().min(3).max(255),
  cnpj: z.string().regex(cnpjRegex, 'CNPJ inválido'),
  rede_id: z.number().positive(),
  promotor_id: z.number().positive().optional(),
  ...addressSchema.shape
})

// Esquema para produto
export const productSchema = z.object({
  codigo_ean: z.string().optional(),
  nome: z.string().min(3).max(255),
  familia: z.string().min(3).max(100),
  unidade: z.string().min(1).max(10),
  peso: z.number().positive(),
  validade: z.number().positive(),
  marca_id: z.number().positive()
})

// Esquema para PDV
export const pdvSchema = z.object({
  marca: z.string().min(3).max(100),
  ponto_extra_conquistado: z.boolean(),
  fotos: z.array(z.string().url()).min(1, 'Pelo menos uma foto é necessária')
})

// Esquema para estoque
export const estoqueSchema = z.object({
  marca: z.string().min(3).max(100),
  produto: z.string().min(3).max(255),
  estoque_fisico: z.number().min(0),
  estoque_virtual: z.number().min(0)
})

// Esquema para data curta
export const dataCurtaSchema = z.object({
  produto_id: z.number().positive(),
  quantidade: z.number().positive(),
  data_vencimento: z.string().datetime(),
  loja_id: z.number().positive(),
  observacao: z.string().max(500).optional()
})

// Função auxiliar para validar dados
export async function validateData<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
      throw new Error('Erro de validação', { cause: { details } })
    }
    throw error
  }
}

// Função para sanitizar dados
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/['"]/g, '') // Remove aspas
    .replace(/[;]/g, '') // Remove ponto e vírgula
}

// Função para validar e sanitizar objeto
export async function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: Record<string, unknown>
): Promise<T> {
  // Sanitiza todas as strings no objeto
  const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: typeof value === 'string' ? sanitizeInput(value) : value
  }), {})

  // Valida os dados sanitizados
  return await validateData(schema, sanitizedData)
}
