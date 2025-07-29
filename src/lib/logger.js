/**
 * Centralized logging utility for Lifetime Fitness Maintenance System
 * Follows verbose logging requirements from .cursor/rules/verbose_logging.mdc
 */

class Logger {
  constructor(module = 'unknown') {
    this.module = module;
    this.startTime = Date.now();
  }

  /**
   * Get current timestamp in ISO format
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get uptime since logger initialization
   */
  getUptime() {
    return Date.now() - this.startTime;
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, data = {}) {
    return {
      timestamp: this.getTimestamp(),
      level: level.toUpperCase(),
      module: this.module,
      message,
      uptime: this.getUptime(),
      ...data
    };
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message, data = {}) {
    const logEntry = this.createLogEntry('debug', message, data);
    console.log(`[DEBUG] ${logEntry.timestamp} - ${this.module}: ${message}`, data);
    
    // Store in localStorage for debugging
    this.storeLog(logEntry);
  }

  /**
   * Info level logging - general information about application flow
   */
  info(message, data = {}) {
    const logEntry = this.createLogEntry('info', message, data);
    console.log(`[INFO] ${logEntry.timestamp} - ${this.module}: ${message}`, data);
    
    // Store in localStorage for debugging
    this.storeLog(logEntry);
  }

  /**
   * Warn level logging - warning messages for potentially harmful situations
   */
  warn(message, data = {}) {
    const logEntry = this.createLogEntry('warn', message, data);
    console.warn(`[WARN] ${logEntry.timestamp} - ${this.module}: ${message}`, data);
    
    // Store in localStorage for debugging
    this.storeLog(logEntry);
  }

  /**
   * Error level logging - error events that might still allow the application to continue
   */
  error(message, error = null, data = {}) {
    const errorData = error ? {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...data
    } : data;

    const logEntry = this.createLogEntry('error', message, errorData);
    console.error(`[ERROR] ${logEntry.timestamp} - ${this.module}: ${message}`, errorData);
    
    // Store in localStorage for debugging
    this.storeLog(logEntry);
  }

  /**
   * Fatal level logging - severe error events that will prevent the application from running
   */
  fatal(message, error = null, data = {}) {
    const errorData = error ? {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...data
    } : data;

    const logEntry = this.createLogEntry('fatal', message, errorData);
    console.error(`[FATAL] ${logEntry.timestamp} - ${this.module}: ${message}`, errorData);
    
    // Store in localStorage for debugging
    this.storeLog(logEntry);
    
    // Could trigger error reporting service here
    this.reportError(logEntry);
  }

  /**
   * API request logging - specialized for API interactions
   */
  logApiRequest(method, endpoint, params = {}, data = {}) {
    this.info(`API Request: ${method} ${endpoint}`, {
      method,
      endpoint,
      params,
      userAgent: navigator.userAgent,
      timestamp: this.getTimestamp(),
      ...data
    });
  }

  /**
   * API response logging - specialized for API responses
   */
  logApiResponse(method, endpoint, statusCode, responseTime, data = {}) {
    const level = statusCode >= 400 ? 'error' : 'info';
    this[level](`API Response: ${method} ${endpoint}`, {
      method,
      endpoint,
      statusCode,
      responseTime,
      timestamp: this.getTimestamp(),
      ...data
    });
  }

  /**
   * Database operation logging - specialized for database interactions
   */
  logDbOperation(operation, table, data = {}, result = null) {
    this.info(`Database Operation: ${operation} on ${table}`, {
      operation,
      table,
      data,
      result,
      timestamp: this.getTimestamp()
    });
  }

  /**
   * Performance logging - for tracking execution times
   */
  logPerformance(operation, duration, data = {}) {
    this.debug(`Performance: ${operation}`, {
      operation,
      duration,
      timestamp: this.getTimestamp(),
      ...data
    });
  }

  /**
   * User action logging - for tracking user interactions
   */
  logUserAction(action, data = {}) {
    this.info(`User Action: ${action}`, {
      action,
      timestamp: this.getTimestamp(),
      ...data
    });
  }

  /**
   * Store log entry in localStorage for debugging
   */
  storeLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 1000 logs to prevent localStorage overflow
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  /**
   * Get stored logs from localStorage
   */
  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs() {
    try {
      localStorage.removeItem('app_logs');
      this.info('Stored logs cleared');
    } catch (error) {
      console.error('Failed to clear stored logs:', error);
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    const logs = this.getStoredLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Report error to external service (placeholder for error reporting integration)
   */
  reportError(logEntry) {
    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    console.error('Error reporting not implemented:', logEntry);
  }

  /**
   * Create a child logger for a specific sub-module
   */
  child(subModule) {
    return new Logger(`${this.module}.${subModule}`);
  }
}

// Create default logger instance
const defaultLogger = new Logger('LifetimeMaintenance');

// Export logger class and default instance
export { Logger, defaultLogger as logger };

// Export convenience functions
export const debug = (message, data) => defaultLogger.debug(message, data);
export const info = (message, data) => defaultLogger.info(message, data);
export const warn = (message, data) => defaultLogger.warn(message, data);
export const error = (message, error, data) => defaultLogger.error(message, error, data);
export const fatal = (message, error, data) => defaultLogger.fatal(message, error, data);

// Export specialized logging functions
export const logApiRequest = (method, endpoint, params, data) => 
  defaultLogger.logApiRequest(method, endpoint, params, data);
export const logApiResponse = (method, endpoint, statusCode, responseTime, data) => 
  defaultLogger.logApiResponse(method, endpoint, statusCode, responseTime, data);
export const logDbOperation = (operation, table, data, result) => 
  defaultLogger.logDbOperation(operation, table, data, result);
export const logPerformance = (operation, duration, data) => 
  defaultLogger.logPerformance(operation, duration, data);
export const logUserAction = (action, data) => 
  defaultLogger.logUserAction(action, data);

// Export utility functions
export const getStoredLogs = () => defaultLogger.getStoredLogs();
export const clearStoredLogs = () => defaultLogger.clearStoredLogs();
export const exportLogs = () => defaultLogger.exportLogs();

export default defaultLogger; 