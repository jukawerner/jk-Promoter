import { logger, LogLevel } from './logger'

interface PerformanceMetrics {
  requestDuration: number
  memoryUsage: NodeJS.MemoryUsage
  timestamp: number
}

interface ErrorMetrics {
  errorCount: number
  lastError: Date
  errorType: string
}

class ApplicationMonitoring {
  private static instance: ApplicationMonitoring
  private metrics: Map<string, PerformanceMetrics>
  private errorMetrics: Map<string, ErrorMetrics>
  private readonly METRIC_RETENTION = 24 * 60 * 60 * 1000 // 24 horas

  private constructor() {
    this.metrics = new Map()
    this.errorMetrics = new Map()
    this.startPeriodicCleanup()
  }

  public static getInstance(): ApplicationMonitoring {
    if (!ApplicationMonitoring.instance) {
      ApplicationMonitoring.instance = new ApplicationMonitoring()
    }
    return ApplicationMonitoring.instance
  }

  // Inicia o monitoramento de uma operação
  public startOperation(operationName: string): string {
    const operationId = `${operationName}_${Date.now()}_${Math.random()}`
    const startTime = Date.now()
    
    this.metrics.set(operationId, {
      requestDuration: 0,
      memoryUsage: process.memoryUsage(),
      timestamp: startTime
    })

    return operationId
  }

  // Finaliza o monitoramento de uma operação
  public endOperation(operationId: string) {
    const metric = this.metrics.get(operationId)
    if (metric) {
      metric.requestDuration = Date.now() - metric.timestamp
      
      // Log das métricas
      void this.logMetrics(operationId, metric)
    }
  }

  // Registra um erro
  public recordError(errorType: string, error: Error) {
    const currentMetric = this.errorMetrics.get(errorType) || {
      errorCount: 0,
      lastError: new Date(),
      errorType
    }

    currentMetric.errorCount++
    currentMetric.lastError = new Date()
    this.errorMetrics.set(errorType, currentMetric)

    // Log do erro
    void logger.error(`Error in ${errorType}`, undefined, {
      errorType,
      errorMessage: error.message,
      stack: error.stack,
      count: currentMetric.errorCount
    })

    // Alerta se houver muitos erros
    if (currentMetric.errorCount > 10) {
      void this.alertHighErrorRate(errorType, currentMetric)
    }
  }

  // Obtém métricas de performance
  public getPerformanceMetrics(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics)
  }

  // Obtém métricas de erro
  public getErrorMetrics(): Record<string, ErrorMetrics> {
    return Object.fromEntries(this.errorMetrics)
  }

  // Limpa métricas antigas periodicamente
  private startPeriodicCleanup() {
    setInterval(() => {
      const cutoffTime = Date.now() - this.METRIC_RETENTION
      
      for (const [key, metric] of this.metrics.entries()) {
        if (metric.timestamp < cutoffTime) {
          this.metrics.delete(key)
        }
      }
    }, 60 * 60 * 1000) // Executa a cada hora
  }

  // Log das métricas
  private async logMetrics(operationId: string, metrics: PerformanceMetrics) {
    const { heapUsed, heapTotal, external } = metrics.memoryUsage
    
    await logger.info('Operation Metrics', undefined, {
      operationId,
      duration: metrics.requestDuration,
      memoryUsage: {
        heapUsed: Math.round(heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(external / 1024 / 1024) + 'MB'
      }
    })
  }

  // Alerta para taxa alta de erros
  private async alertHighErrorRate(errorType: string, metrics: ErrorMetrics) {
    await logger.critical('High Error Rate Detected', undefined, {
      errorType,
      errorCount: metrics.errorCount,
      lastError: metrics.lastError,
      timeWindow: '1 hour'
    })

    // Aqui você pode adicionar integrações com sistemas de alerta
    // como Slack, email, etc.
  }
}

// Middleware para monitoramento de requisições HTTP
export async function monitorRequest(req: Request, handler: () => Promise<Response>): Promise<Response> {
  const monitoring = ApplicationMonitoring.getInstance()
  const operationId = monitoring.startOperation(`HTTP_${req.method}_${new URL(req.url).pathname}`)

  try {
    const response = await handler()
    monitoring.endOperation(operationId)
    return response
  } catch (error) {
    monitoring.recordError('HTTP_REQUEST', error as Error)
    throw error
  }
}

// Decorator para monitoramento de funções
export function monitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const monitoring = ApplicationMonitoring.getInstance()
    const operationId = monitoring.startOperation(`${target.constructor.name}_${propertyKey}`)

    try {
      const result = await originalMethod.apply(this, args)
      monitoring.endOperation(operationId)
      return result
    } catch (error) {
      monitoring.recordError(propertyKey, error as Error)
      throw error
    }
  }

  return descriptor
}

export const monitoring = ApplicationMonitoring.getInstance()
