// Comprehensive Error Handling Utility for Scanémon

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  offlineCompatible: boolean;
  action?: string;
}

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

class ErrorHandler {
  private errorMap: Map<string, ErrorInfo> = new Map();
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: Date }> = [];

  constructor() {
    this.initializeErrorMap();
  }

  private initializeErrorMap() {
    // Network Errors
    this.errorMap.set('NETWORK_ERROR', {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      userMessage: 'Connection lost. Your data is saved locally and will sync when you\'re back online.',
      severity: 'medium',
      retryable: true,
      offlineCompatible: true,
      action: 'retry_when_online'
    });

    this.errorMap.set('TIMEOUT_ERROR', {
      code: 'TIMEOUT_ERROR',
      message: 'Request timed out',
      userMessage: 'Request took too long. Please try again.',
      severity: 'medium',
      retryable: true,
      offlineCompatible: false,
      action: 'retry'
    });

    // Authentication Errors
    this.errorMap.set('AUTH_FAILED', {
      code: 'AUTH_FAILED',
      message: 'Authentication failed',
      userMessage: 'Sign-in issue. You can continue using the app offline.',
      severity: 'high',
      retryable: true,
      offlineCompatible: true,
      action: 'retry_auth'
    });

    this.errorMap.set('TOKEN_EXPIRED', {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token expired',
      userMessage: 'Your session expired. Please sign in again.',
      severity: 'medium',
      retryable: true,
      offlineCompatible: false,
      action: 'reauthenticate'
    });

    // Scan Errors
    this.errorMap.set('SCAN_FAILED', {
      code: 'SCAN_FAILED',
      message: 'Card scan failed',
      userMessage: 'Scan failed. Try adjusting lighting or taking a clearer photo.',
      severity: 'low',
      retryable: true,
      offlineCompatible: false,
      action: 'retry_scan'
    });

    this.errorMap.set('INVALID_IMAGE', {
      code: 'INVALID_IMAGE',
      message: 'Invalid image format or size',
      userMessage: 'Please upload a valid image (JPG, PNG, WebP) under 10MB.',
      severity: 'low',
      retryable: true,
      offlineCompatible: false,
      action: 'upload_better_image'
    });

    // API Errors
    this.errorMap.set('API_ERROR', {
      code: 'API_ERROR',
      message: 'API request failed',
      userMessage: 'Service temporarily unavailable. Please try again later.',
      severity: 'medium',
      retryable: true,
      offlineCompatible: false,
      action: 'retry'
    });

    this.errorMap.set('SERVER_ERROR', {
      code: 'SERVER_ERROR',
      message: 'Server error occurred',
      userMessage: 'Server is experiencing issues. Please try again later.',
      severity: 'high',
      retryable: true,
      offlineCompatible: false,
      action: 'retry_later'
    });

    // Offline Errors
    this.errorMap.set('OFFLINE_MODE', {
      code: 'OFFLINE_MODE',
      message: 'Feature unavailable offline',
      userMessage: 'This feature requires an internet connection. Please try again when online.',
      severity: 'medium',
      retryable: false,
      offlineCompatible: true,
      action: 'wait_for_online'
    });

    // Storage Errors
    this.errorMap.set('STORAGE_ERROR', {
      code: 'STORAGE_ERROR',
      message: 'Local storage error',
      userMessage: 'Unable to save data locally. Please check your browser settings.',
      severity: 'high',
      retryable: true,
      offlineCompatible: false,
      action: 'check_storage'
    });

    // Unknown Errors
    this.errorMap.set('UNKNOWN_ERROR', {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      userMessage: 'Something went wrong. Your progress is saved.',
      severity: 'medium',
      retryable: true,
      offlineCompatible: true,
      action: 'retry'
    });
  }

  public handleError(error: Error, context: ErrorContext): ErrorInfo {
    // Log the error
    this.logError(error, context);

    // Determine error type
    const errorCode = this.determineErrorCode(error);
    const errorInfo = this.errorMap.get(errorCode) || this.errorMap.get('UNKNOWN_ERROR')!;

    // Enhance error info with context
    return {
      ...errorInfo,
      message: `${errorInfo.message}: ${error.message}`,
      userMessage: this.enhanceUserMessage(errorInfo.userMessage, context)
    };
  }

  private determineErrorCode(error: Error): string {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT_ERROR';
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return 'AUTH_FAILED';
    }

    // Scan errors
    if (message.includes('scan') || message.includes('image') || message.includes('card')) {
      return 'SCAN_FAILED';
    }

    // API errors
    if (message.includes('api') || message.includes('server') || message.includes('500')) {
      return 'API_ERROR';
    }

    // Storage errors
    if (message.includes('storage') || message.includes('localstorage') || message.includes('quota')) {
      return 'STORAGE_ERROR';
    }

    // Offline errors
    if (message.includes('offline') || message.includes('no connection')) {
      return 'OFFLINE_MODE';
    }

    return 'UNKNOWN_ERROR';
  }

  private enhanceUserMessage(message: string, context: ErrorContext): string {
    // Add context-specific information
    if (context.component === 'ScanPage') {
      return `${message} Try taking a photo in better lighting.`;
    }

    if (context.component === 'CollectionPage') {
      return `${message} Your collection data is saved locally.`;
    }

    if (context.component === 'AuthContext') {
      return `${message} You can continue using the app offline.`;
    }

    return message;
  }

  private logError(error: Error, context: ErrorContext) {
    const errorEntry = {
      error,
      context,
      timestamp: new Date()
    };

    this.errorLog.push(errorEntry);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: errorEntry.timestamp
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToAnalytics(errorEntry);
    }
  }

  private sendErrorToAnalytics(errorEntry: { error: Error; context: ErrorContext; timestamp: Date }) {
    // This would integrate with your analytics service
    // For now, just log to console
    console.log('Sending error to analytics:', {
      error: errorEntry.error.message,
      component: errorEntry.context.component,
      action: errorEntry.context.action,
      timestamp: errorEntry.timestamp
    });
  }

  public getErrorLog(): Array<{ error: Error; context: ErrorContext; timestamp: Date }> {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public isRetryable(error: Error): boolean {
    const errorCode = this.determineErrorCode(error);
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.retryable || false;
  }

  public getRetryDelay(error: Error, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    const backoffFactor = 2;
    
    return Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
  }

  public shouldShowError(error: Error): boolean {
    const errorCode = this.determineErrorCode(error);
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.severity !== 'low';
  }

  public getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorCode = this.determineErrorCode(error);
    const errorInfo = this.errorMap.get(errorCode);
    return errorInfo?.severity || 'medium';
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const createErrorContext = (component: string, action: string, userId?: string): ErrorContext => ({
  component,
  action,
  timestamp: new Date(),
  userId,
  sessionId: getSessionId()
});

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = errorHandler.handleError(error as Error, context);
    
    // If we have a fallback and the error is offline compatible, use fallback
    if (fallback !== undefined && errorInfo.offlineCompatible) {
      return fallback;
    }
    
    // Re-throw the error with enhanced information
    const enhancedError = new Error(errorInfo.userMessage);
    (enhancedError as any).errorInfo = errorInfo;
    throw enhancedError;
  }
};

export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  maxRetries: number = 3,
  fallback?: T
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorInfo = errorHandler.handleError(error as Error, context);
      
      // If this is the last attempt or error is not retryable
      if (attempt === maxRetries || !errorInfo.retryable) {
        if (fallback !== undefined && errorInfo.offlineCompatible) {
          return fallback;
        }
        throw error;
      }
      
      // Wait before retrying
      const delay = errorHandler.getRetryDelay(error as Error, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}; 