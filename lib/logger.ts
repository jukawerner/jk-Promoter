import { createClient } from '@supabase/supabase-js'

// Níveis de log
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Interface para estrutura do log
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

// Classe principal do logger
export class Logger {
  private static instance: Logger
  private supabase: any

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  // Método principal para registrar logs
  async log(
    level: LogLevel,
    message: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      userId,
      metadata
    }

    try {
      const { error } = await this.supabase
        .from('system_logs')
        .insert([logEntry])

      if (error) {
        console.error('Erro ao salvar log:', error)
      }

      // Em ambiente de desenvolvimento, também mostra no console
      if (process.env.NODE_ENV === 'development') {
        this.logToConsole(logEntry)
      }

      // Para erros críticos, podemos implementar notificações
      if (level === LogLevel.CRITICAL) {
        await this.notifyCriticalError(logEntry)
      }
    } catch (error) {
      console.error('Erro ao processar log:', error)
    }
  }

  // Métodos auxiliares para diferentes níveis de log
  async info(message: string, userId?: string, metadata?: Record<string, any>) {
    return this.log(LogLevel.INFO, message, userId, metadata)
  }

  async warning(message: string, userId?: string, metadata?: Record<string, any>) {
    return this.log(LogLevel.WARNING, message, userId, metadata)
  }

  async error(message: string, userId?: string, metadata?: Record<string, any>) {
    return this.log(LogLevel.ERROR, message, userId, metadata)
  }

  async critical(message: string, userId?: string, metadata?: Record<string, any>) {
    return this.log(LogLevel.CRITICAL, message, userId, metadata)
  }

  // Método para log no console em desenvolvimento
  private logToConsole(logEntry: LogEntry) {
    const timestamp = new Date(logEntry.timestamp).toLocaleString()
    const metadata = logEntry.metadata ? JSON.stringify(logEntry.metadata) : ''
    
    switch (logEntry.level) {
      case LogLevel.INFO:
        console.log(`[${timestamp}] INFO: ${logEntry.message} ${metadata}`)
        break
      case LogLevel.WARNING:
        console.warn(`[${timestamp}] WARNING: ${logEntry.message} ${metadata}`)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`[${timestamp}] ${logEntry.level}: ${logEntry.message} ${metadata}`)
        break
    }
  }

  // Método para notificar erros críticos
  private async notifyCriticalError(logEntry: LogEntry) {
    // Aqui podemos implementar integrações com sistemas de notificação
    // como email, Slack, etc.
    console.error('CRITICAL ERROR:', logEntry)
  }
}

// Exporta uma instância única do logger
export const logger = Logger.getInstance()
