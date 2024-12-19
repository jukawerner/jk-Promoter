import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RateLimitResult {
  success: boolean
  remaining?: number
  reset?: Date
}

// Configurações do rate limit
const WINDOW_SIZE = 60 * 1000 // 1 minuto em milissegundos
const MAX_REQUESTS = 60 // máximo de requisições por minuto

export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Identificador único para o cliente (IP ou token)
  const clientId = request.headers.get('x-forwarded-for') || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  'anonymous'

  const now = Date.now()
  const windowStart = now - WINDOW_SIZE

  try {
    // Limpar registros antigos
    await supabase
      .from('rate_limits')
      .delete()
      .lt('timestamp', windowStart)

    // Contar requisições no período
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .gte('timestamp', windowStart)

    if (count && count >= MAX_REQUESTS) {
      return {
        success: false,
        remaining: 0,
        reset: new Date(windowStart + WINDOW_SIZE)
      }
    }

    // Registrar nova requisição
    await supabase
      .from('rate_limits')
      .insert([
        {
          client_id: clientId,
          timestamp: now,
          path: request.nextUrl.pathname
        }
      ])

    return {
      success: true,
      remaining: MAX_REQUESTS - (count || 0) - 1,
      reset: new Date(windowStart + WINDOW_SIZE)
    }

  } catch (error) {
    console.error('Erro no rate limiting:', error)
    // Em caso de erro, permitir a requisição
    return { success: true }
  }
}
