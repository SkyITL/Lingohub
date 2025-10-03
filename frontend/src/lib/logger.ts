/**
 * Comprehensive logging utility for debugging API calls, auth, and app state
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean
  private isClient: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
    this.isClient = typeof window !== 'undefined'
  }

  private getTimestamp(): string {
    return new Date().toISOString()
  }

  private getStyles(level: LogLevel): string {
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      success: 'color: #10b981; font-weight: bold',
      debug: 'color: #8b5cf6; font-weight: bold'
    }
    return styles[level]
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isClient) return // Only log on client side

    const timestamp = this.getTimestamp()
    const prefix = `[LingoHub ${level.toUpperCase()}]`

    console.group(`%c${prefix} ${message}`, this.getStyles(level))
    console.log('Time:', timestamp)

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        console.log(`${key}:`, value)
      })
    }

    console.groupEnd()
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  success(message: string, context?: LogContext) {
    this.log('success', message, context)
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  // Specialized logging methods
  apiRequest(method: string, url: string, data?: any) {
    this.info(`API Request: ${method.toUpperCase()} ${url}`, {
      method,
      url,
      data: data ? JSON.stringify(data, null, 2) : 'none',
      timestamp: this.getTimestamp()
    })
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    const level = status >= 200 && status < 300 ? 'success' : 'error'
    this.log(level, `API Response: ${method.toUpperCase()} ${url}`, {
      method,
      url,
      status,
      statusText: this.getStatusText(status),
      data: data ? JSON.stringify(data, null, 2) : 'none',
      timestamp: this.getTimestamp()
    })
  }

  apiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, {
      method,
      url,
      errorMessage: error.message || 'Unknown error',
      errorResponse: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'none',
      status: error.response?.status || 'N/A',
      timestamp: this.getTimestamp()
    })
  }

  auth(action: string, data?: any) {
    this.info(`Auth: ${action}`, {
      action,
      data: data ? JSON.stringify(data, null, 2) : 'none',
      timestamp: this.getTimestamp()
    })
  }

  environment() {
    this.debug('Environment Configuration', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      hostname: this.isClient ? window.location.hostname : 'server',
      protocol: this.isClient ? window.location.protocol : 'N/A',
      isDevelopment: this.isDevelopment,
      timestamp: this.getTimestamp()
    })
  }

  private getStatusText(status: number): string {
    const statusTexts: { [key: number]: string } = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    }
    return statusTexts[status] || 'Unknown Status'
  }
}

// Export singleton instance
export const logger = new Logger()

// Log environment on initialization (client-side only)
if (typeof window !== 'undefined') {
  logger.environment()
}
