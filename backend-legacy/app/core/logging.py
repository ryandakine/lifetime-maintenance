"""
Centralized logging utility for Lifetime Fitness Maintenance System Backend
Follows verbose logging requirements from .cursor/rules/verbose_logging.mdc
"""

import logging
import datetime
import json
import os
import sys
from typing import Any, Dict, Optional
from pathlib import Path
import threading

class StructuredLogger:
    """
    Structured logger that provides comprehensive logging capabilities
    following the verbose logging requirements
    """
    
    def __init__(self, name: str = "lifetime_maintenance", level: str = "DEBUG"):
        self.name = name
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup logging handlers for console and file output"""
        
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        # File handler for all logs
        file_handler = logging.FileHandler(
            log_dir / f"{self.name}_{datetime.datetime.now().strftime('%Y%m%d')}.log"
        )
        file_handler.setLevel(logging.DEBUG)
        
        # Error file handler
        error_handler = logging.FileHandler(
            log_dir / f"{self.name}_errors_{datetime.datetime.now().strftime('%Y%m%d')}.log"
        )
        error_handler.setLevel(logging.ERROR)
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        json_formatter = logging.Formatter(
            '%(message)s'  # We'll format as JSON in the log methods
        )
        
        # Set formatters
        console_handler.setFormatter(detailed_formatter)
        file_handler.setFormatter(json_formatter)
        error_handler.setFormatter(json_formatter)
        
        # Add handlers
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(error_handler)
    
    def _create_log_entry(self, level: str, message: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a structured log entry"""
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "level": level.upper(),
            "logger": self.name,
            "message": message,
            "pid": os.getpid(),
            "thread": threading.current_thread().name if 'threading' in sys.modules else "main"
        }
        
        if data:
            entry.update(data)
        
        return entry
    
    def _log(self, level: str, message: str, data: Dict[str, Any] = None, exc_info: bool = False):
        """Internal logging method"""
        log_entry = self._create_log_entry(level, message, data)
        
        # Log as JSON for file handlers
        json_message = json.dumps(log_entry, default=str)
        
        # Use the appropriate logging method
        log_method = getattr(self.logger, level.lower())
        log_method(json_message, exc_info=exc_info)
    
    def debug(self, message: str, data: Dict[str, Any] = None):
        """Debug level logging - detailed information for debugging"""
        self._log("DEBUG", message, data)
    
    def info(self, message: str, data: Dict[str, Any] = None):
        """Info level logging - general information about application flow"""
        self._log("INFO", message, data)
    
    def warning(self, message: str, data: Dict[str, Any] = None):
        """Warning level logging - warning messages for potentially harmful situations"""
        self._log("WARNING", message, data)
    
    def error(self, message: str, error: Optional[Exception] = None, data: Dict[str, Any] = None):
        """Error level logging - error events that might still allow the application to continue"""
        error_data = data or {}
        if error:
            error_data.update({
                "error_type": type(error).__name__,
                "error_message": str(error),
                "error_traceback": self._get_traceback(error)
            })
        
        self._log("ERROR", message, error_data, exc_info=bool(error))
    
    def critical(self, message: str, error: Optional[Exception] = None, data: Dict[str, Any] = None):
        """Critical level logging - severe error events that will prevent the application from running"""
        error_data = data or {}
        if error:
            error_data.update({
                "error_type": type(error).__name__,
                "error_message": str(error),
                "error_traceback": self._get_traceback(error)
            })
        
        self._log("CRITICAL", message, error_data, exc_info=bool(error))
    
    def _get_traceback(self, error: Exception) -> str:
        """Get formatted traceback for an exception"""
        import traceback
        return ''.join(traceback.format_exception(type(error), error, error.__traceback__))
    
    def log_api_request(self, method: str, endpoint: str, params: Dict[str, Any] = None, 
                       headers: Dict[str, Any] = None, data: Dict[str, Any] = None):
        """Log API request details"""
        self.info(f"API Request: {method} {endpoint}", {
            "method": method,
            "endpoint": endpoint,
            "params": params or {},
            "headers": self._sanitize_headers(headers or {}),
            "request_data": data or {},
            "log_type": "api_request"
        })
    
    def log_api_response(self, method: str, endpoint: str, status_code: int, 
                        response_time: float, data: Dict[str, Any] = None):
        """Log API response details"""
        level = "ERROR" if status_code >= 400 else "INFO"
        self._log(level, f"API Response: {method} {endpoint}", {
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "response_time_ms": round(response_time * 1000, 2),
            "response_data": data or {},
            "log_type": "api_response"
        })
    
    def log_db_operation(self, operation: str, table: str, data: Dict[str, Any] = None, 
                        result: Any = None, duration: float = None):
        """Log database operation details"""
        self.info(f"Database Operation: {operation} on {table}", {
            "operation": operation,
            "table": table,
            "data": data or {},
            "result": str(result) if result is not None else None,
            "duration_ms": round(duration * 1000, 2) if duration else None,
            "log_type": "database_operation"
        })
    
    def log_performance(self, operation: str, duration: float, data: Dict[str, Any] = None):
        """Log performance metrics"""
        self.debug(f"Performance: {operation}", {
            "operation": operation,
            "duration_ms": round(duration * 1000, 2),
            "log_type": "performance",
            **(data or {})
        })
    
    def log_user_action(self, action: str, user_id: str = None, data: Dict[str, Any] = None):
        """Log user actions"""
        self.info(f"User Action: {action}", {
            "action": action,
            "user_id": user_id,
            "log_type": "user_action",
            **(data or {})
        })
    
    def log_startup(self, service_name: str, config: Dict[str, Any] = None):
        """Log service startup"""
        self.info(f"Service startup: {service_name}", {
            "service": service_name,
            "config": self._sanitize_config(config or {}),
            "log_type": "startup"
        })
    
    def log_shutdown(self, service_name: str, reason: str = None):
        """Log service shutdown"""
        self.info(f"Service shutdown: {service_name}", {
            "service": service_name,
            "reason": reason,
            "log_type": "shutdown"
        })
    
    def _sanitize_headers(self, headers: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from headers"""
        sensitive_keys = {'authorization', 'cookie', 'x-api-key', 'x-auth-token'}
        return {k: v if k.lower() not in sensitive_keys else '[REDACTED]' 
                for k, v in headers.items()}
    
    def _sanitize_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from configuration"""
        sensitive_keys = {'password', 'secret', 'key', 'token', 'api_key'}
        sanitized = {}
        for k, v in config.items():
            if any(sensitive in k.lower() for sensitive in sensitive_keys):
                sanitized[k] = '[REDACTED]'
            else:
                sanitized[k] = v
        return sanitized
    
    def child(self, sub_module: str) -> 'StructuredLogger':
        """Create a child logger for a specific sub-module"""
        return StructuredLogger(f"{self.name}.{sub_module}")

# Create default logger instance
default_logger = StructuredLogger("lifetime_maintenance")

# Export convenience functions
def debug(message: str, data: Dict[str, Any] = None):
    default_logger.debug(message, data)

def info(message: str, data: Dict[str, Any] = None):
    default_logger.info(message, data)

def warning(message: str, data: Dict[str, Any] = None):
    default_logger.warning(message, data)

def error(message: str, error: Exception = None, data: Dict[str, Any] = None):
    default_logger.error(message, error, data)

def critical(message: str, error: Exception = None, data: Dict[str, Any] = None):
    default_logger.critical(message, error, data)

# Export specialized logging functions
def log_api_request(method: str, endpoint: str, params: Dict[str, Any] = None, 
                   headers: Dict[str, Any] = None, data: Dict[str, Any] = None):
    default_logger.log_api_request(method, endpoint, params, headers, data)

def log_api_response(method: str, endpoint: str, status_code: int, 
                    response_time: float, data: Dict[str, Any] = None):
    default_logger.log_api_response(method, endpoint, status_code, response_time, data)

def log_db_operation(operation: str, table: str, data: Dict[str, Any] = None, 
                    result: Any = None, duration: float = None):
    default_logger.log_db_operation(operation, table, data, result, duration)

def log_performance(operation: str, duration: float, data: Dict[str, Any] = None):
    default_logger.log_performance(operation, duration, data)

def log_user_action(action: str, user_id: str = None, data: Dict[str, Any] = None):
    default_logger.log_user_action(action, user_id, data)

def log_startup(service_name: str, config: Dict[str, Any] = None):
    default_logger.log_startup(service_name, config)

def log_shutdown(service_name: str, reason: str = None):
    default_logger.log_shutdown(service_name, reason)

# Export the main logger class and default instance
__all__ = [
    'StructuredLogger', 'default_logger',
    'debug', 'info', 'warning', 'error', 'critical',
    'log_api_request', 'log_api_response', 'log_db_operation',
    'log_performance', 'log_user_action', 'log_startup', 'log_shutdown'
] 