import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger, LogLevel } from './logger'
import { rateLimit } from './rate-limit'

// Interface para erros estruturados
export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

// Função para criar erros estruturados
export function createError(message: string, statusCode: number, code?: string, details?: any): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.code = code
  error.details = details
  return error
}

// Middleware principal
export async function middleware(request: NextRequest) {
  try {
    // Verificar rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      throw createError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Validar token de autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token && !isPublicRoute(request.nextUrl.pathname)) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    // Log da requisição
    await logger.info('API Request', undefined, {
      method: request.method,
      path: request.nextUrl.pathname,
      clientIp: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    })

    // Continuar com a requisição
    return NextResponse.next()

  } catch (error: any) {
    // Log do erro
    await logger.error(error.message, undefined, {
      code: error.code,
      stack: error.stack,
      details: error.details
    })

    // Retornar resposta de erro estruturada
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: error.code || 'INTERNAL_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.details : undefined
        }
      }),
      {
        status: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  }
}

// Configuração do middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}

// Função auxiliar para verificar rotas públicas
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/',
    '/login',
    '/register',
    '/_next',
    '/favicon.ico'
  ]
  return publicRoutes.some(route => pathname.startsWith(route))
}
