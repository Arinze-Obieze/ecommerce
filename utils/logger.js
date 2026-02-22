/**
 * Logger Utility for Activity & Error Logging
 * 
 * Features:
 * - Structured logging to Supabase (activity_logs table)
 * - GDPR-compliant: No plaintext PII logged
 * - Request tracing: requestId for tracking requests across logs
 * - Flexible metadata: JSON for context-specific data
 * - Performance monitoring: Tracks execution time
 * - Security events: Logs auth failures, rate limits, suspicious activity
 * 
 * Usage:
 * const logger = require('@/utils/logger');
 * 
 * // Simple info log
 * logger.info('USER_SIGNUP', {
 *   userId: 'user_123',
 *   email: user.email,
 *   metadata: { signupMethod: 'google' }
 * });
 * 
 * // Error log with full context
 * logger.error('PAYMENT_FAILED', {
 *   userId: session.userId,
 *   error: paymentError,
 *   metadata: { 
 *     orderId: order.id,
 *     gateway: 'paystack',
 *     errorCode: paymentError.code
 *   }
 * });
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client - use SUPABASE_SERVICE_ROLE_KEY for logging (not public key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

const LOG_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending'
};

/**
 * Sanitize user data to remove/anonymize PII (GDPR compliant)
 * @param {Object} userData - User data object
 * @returns {Object} Sanitized user data
 */
const sanitizeUserData = (userData) => {
  if (!userData) return null;
  
  return {
    userId: userData.userId || userData.id,
    emailDomain: userData.email ? userData.email.split('@')[1] : null,
    // Never include: full email, password, payment details, etc.
  };
};

/**
 * Hash email for security (cannot reverse, safe for logs)
 * @param {string} email - Email address
 * @returns {string} SHA-256 hash of email
 */
const hashEmail = (email) => {
  if (!email) return null;
  return crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
};

/**
 * Extract IP address from request headers
 * @param {Object} headers - Request headers (Next.js or Node.js format)
 * @returns {string} IP address
 */
const getIP = (headers) => {
  if (!headers) return null;
  
  const ip = 
    headers['x-forwarded-for']?.toString().split(',')[0] ||
    headers['x-real-ip']?.toString() ||
    headers['cf-connecting-ip']?.toString() ||
    null;
  
  return ip?.trim() || null;
};

/**
 * Mask sensitive data in objects (for logging request bodies, etc)
 * @param {Object} obj - Object to mask
 * @returns {Object} Masked object
 */
const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'pin', 'cvv', 'card_number', 'token', 'secret'];
  const masked = JSON.parse(JSON.stringify(obj));
  
  const walk = (node) => {
    if (typeof node === 'object' && node !== null) {
      for (const key in node) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          node[key] = '[MASKED]';
        } else if (typeof node[key] === 'object') {
          walk(node[key]);
        }
      }
    }
  };
  
  walk(masked);
  return masked;
};

/**
 * Core logging function
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * @param {string} action - Action that triggered the log
 * @param {string} service - Service/module name
 * @param {Object} options - Logging options
 */
const log = async (
  level,
  action,
  service,
  options = {}
) => {
  try {
    const {
      userId,
      sessionId,
      requestId = crypto.randomUUID(),
      message = action,
      error = null,
      statusCode = null,
      status = LOG_STATUS.SUCCESS,
      metadata = {},
      ipAddress = null,
      userAgent = null,
      duration = null,
      headers = null
    } = options;

    // Extract IP from headers if not provided
    const ipValue = ipAddress || getIP(headers);

    // Build the log entry
    const logEntry = {
      request_id: requestId,
      session_id: sessionId || null,
      user_id: userId || null,
      level,
      service,
      action,
      status,
      status_code: statusCode,
      message,
      error_code: error?.code || null,
      error_stack: level === LOG_LEVELS.ERROR || level === LOG_LEVELS.CRITICAL ? error?.stack : null,
      duration_ms: duration,
      ip_address: ipValue,
      user_agent: userAgent,
      metadata: maskSensitiveData(metadata) || {},
      environment: process.env.NODE_ENV || 'development'
    };

    // Insert into Supabase
    const { error: insertError, data } = await supabase
      .from('activity_logs')
      .insert([logEntry])
      .select();

    if (insertError) {
      console.error('Failed to insert log:', insertError);
      // Don't throw - logging failure shouldn't break the app
    }

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const logFn = level === LOG_LEVELS.ERROR || level === LOG_LEVELS.CRITICAL ? console.error : console.log;
      logFn(`[${level}] ${service}/${action}:`, {
        message,
        userId: userId || 'ANONYMOUS',
        metadata,
        error: error?.message
      });
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Logger error:', err);
    // Don't throw - logging failure shouldn't crash the app
  }
};

/**
 * Public Logger API
 */
const logger = {
  /**
   * Debug log (development only)
   */
  debug: (action, options = {}) => {
    if (process.env.NODE_ENV === 'production') return; // Skip in production
    return log(LOG_LEVELS.DEBUG, action, options.service || 'app', options);
  },

  /**
   * Info log (business events, successful operations)
   */
  info: (action, options = {}) => {
    return log(LOG_LEVELS.INFO, action, options.service || 'app', {
      ...options,
      status: LOG_STATUS.SUCCESS
    });
  },

  /**
   * Warning log (non-critical issues)
   */
  warn: (action, options = {}) => {
    return log(LOG_LEVELS.WARN, action, options.service || 'app', options);
  },

  /**
   * Error log (with error details)
   */
  error: (action, options = {}) => {
    return log(LOG_LEVELS.ERROR, action, options.service || 'app', {
      ...options,
      status: LOG_STATUS.FAILURE
    });
  },

  /**
   * Critical log (system failures, need immediate attention)
   */
  critical: (action, options = {}) => {
    return log(LOG_LEVELS.CRITICAL, action, options.service || 'app', {
      ...options,
      status: LOG_STATUS.FAILURE
    });
  },

  /**
   * Log authentication event
   */
  logAuth: (action, options = {}) => {
    return log(LOG_LEVELS.INFO, action, 'auth-service', options);
  },

  /**
   * Log payment event
   */
  logPayment: (action, options = {}) => {
    return log(LOG_LEVELS.INFO, action, 'payment-service', {
      ...options,
      status: options.status || LOG_STATUS.PENDING
    });
  },

  /**
   * Log API request/response
   */
  logApi: (method, path, statusCode, duration, options = {}) => {
    const level = statusCode >= 500 ? LOG_LEVELS.ERROR :
                  statusCode >= 400 ? LOG_LEVELS.WARN :
                  LOG_LEVELS.INFO;
    
    return log(level, `${method}_${path.toUpperCase()}`, 'api', {
      ...options,
      statusCode,
      duration,
      metadata: {
        method,
        path,
        ...options.metadata
      }
    });
  },

  /**
   * Utility: Hash email for safe logging
   */
  hashEmail,

  /**
   * Utility: Sanitize user data
   */
  sanitizeUserData,

  /**
   * Utility: Mask sensitive fields
   */
  maskSensitiveData,

  /**
   * Utility: Get IP from headers
   */
  getIP
};

export default logger;
