interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: ErrorContext;
  tags: string[];
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isProduction = process.env.NODE_ENV === 'production';

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLog(log: Omit<ErrorLog, 'id'>): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      ...log,
    };

    this.logs.unshift(errorLog);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return errorLog;
  }

  private getContext(additionalContext?: ErrorContext): ErrorContext {
    const baseContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    return { ...baseContext, ...additionalContext };
  }

  private formatLog(log: ErrorLog): string {
    const contextStr = Object.entries(log.context)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `[${log.level.toUpperCase()}] ${log.message}${contextStr ? ` | ${contextStr}` : ''}${log.stack ? `\n${log.stack}` : ''}`;
  }

  private sendToExternalService(log: ErrorLog): void {
    if (!this.isProduction) return;

    // In production, you would send this to your error tracking service
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    try {
      // Example implementation for a hypothetical service
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(log),
      // });

      // For now, we'll just log to console in production
      console.error('Production Error Log:', log);
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  error(message: string, error?: Error, context?: ErrorContext): void {
    const errorLog = this.addLog({
      level: 'error',
      message,
      stack: error?.stack,
      context: this.getContext(context),
      tags: ['error', 'client'],
    });

    console.error(this.formatLog(errorLog));
    this.sendToExternalService(errorLog);
  }

  warn(message: string, context?: ErrorContext): void {
    const errorLog = this.addLog({
      level: 'warn',
      message,
      context: this.getContext(context),
      tags: ['warning', 'client'],
    });

    console.warn(this.formatLog(errorLog));
  }

  info(message: string, context?: ErrorContext): void {
    const errorLog = this.addLog({
      level: 'info',
      message,
      context: this.getContext(context),
      tags: ['info', 'client'],
    });

    console.info(this.formatLog(errorLog));
  }

  debug(message: string, context?: ErrorContext): void {
    if (!this.isProduction) {
      const errorLog = this.addLog({
        level: 'debug',
        message,
        context: this.getContext(context),
        tags: ['debug', 'client'],
      });

      console.debug(this.formatLog(errorLog));
    }
  }

  // API Error logging
  apiError(endpoint: string, method: string, error: Error, response?: Response, context?: ErrorContext): void {
    this.error(
      `API Error: ${method} ${endpoint} - ${error.message}`,
      error,
      {
        ...context,
        component: 'api',
        action: `${method} ${endpoint}`,
        metadata: {
          status: response?.status,
          statusText: response?.statusText,
          url: response?.url,
        },
      }
    );
  }

  // Template Editor Error logging
  templateEditorError(error: Error, templateId: string, action: string, context?: ErrorContext): void {
    this.error(
      `Template Editor Error: ${action} - ${error.message}`,
      error,
      {
        ...context,
        component: 'template-editor',
        action,
        metadata: { templateId },
      }
    );
  }

  // RSVP Error logging
  rsvpError(error: Error, action: string, context?: ErrorContext): void {
    this.error(
      `RSVP Error: ${action} - ${error.message}`,
      error,
      {
        ...context,
        component: 'rsvp',
        action,
      }
    );
  }

  // Performance monitoring
  performanceMark(operation: string, duration: number, context?: ErrorContext): void {
    this.info(
      `Performance: ${operation} took ${duration}ms`,
      {
        ...context,
        component: 'performance',
        action: operation,
        metadata: { duration },
      }
    );
  }

  // Get recent logs (for debugging)
  getRecentLogs(limit = 50): ErrorLog[] {
    return this.logs.slice(0, limit);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Get logs by level
  getLogsByLevel(level: ErrorLog['level']): ErrorLog[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by component
  getLogsByComponent(component: string): ErrorLog[] {
    return this.logs.filter(log => log.context.component === component);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// React hook for error logging
export function useErrorLogger(component: string) {
  return {
    logError: (message: string, error?: Error, context?: ErrorContext) => {
      errorLogger.error(message, error, { ...context, component });
    },
    logWarning: (message: string, context?: ErrorContext) => {
      errorLogger.warn(message, { ...context, component });
    },
    logInfo: (message: string, context?: ErrorContext) => {
      errorLogger.info(message, { ...context, component });
    },
    logDebug: (message: string, context?: ErrorContext) => {
      errorLogger.debug(message, { ...context, component });
    },
    logPerformance: (operation: string, duration: number, context?: ErrorContext) => {
      errorLogger.performanceMark(operation, duration, { ...context, component });
    },
  };
}

// Higher-order function for API error handling
export function withErrorLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  component: string = 'api'
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      errorLogger.performanceMark(operation, duration, { component });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      errorLogger.apiError(
        operation,
        'POST', // This could be made more flexible
        error as Error,
        undefined,
        { component, metadata: { duration, args: JSON.stringify(args) } }
      );
      throw error;
    }
  };
}

// Utility for logging unhandled errors
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', (event) => {
    errorLogger.error(
      `Unhandled Error: ${event.message}`,
      event.error,
      {
        component: 'global',
        action: 'unhandled-error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      }
    );
  });

  // Global promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.error(
      `Unhandled Promise Rejection: ${event.reason}`,
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        component: 'global',
        action: 'unhandled-promise-rejection',
      }
    );
  });
}
