/**
 * API Logging Middleware
 * 
 * Automatically logs all API requests, responses, and errors
 * Can be used as a Next.js middleware or wrapped around individual route handlers
 * 
 * Usage in route handler:
 * import { withLogging } from '@/utils/apiLogger';
 * 
 * export const POST = withLogging(async (req) => {
 *   // Your route logic
 *   return Response.json({ success: true });
 * }, { service: 'auth-service', action: 'LOGIN' });
 */

import logger from './logger';
import crypto from 'crypto';

/**
 * Wrap a route handler with automatic logging
 * @param {Function} handler - The route handler function
 * @param {Object} options - Logging options
 * @returns {Function} Wrapped handler
 */
export const withLogging = (handler, options = {}) => {
  return async (req, res, ...args) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID?.() || Math.random().toString(36);
    
    // Extract useful info from request
    const method = req.method;
    const url = new URL(req.url || '', `http://${req.headers?.host}`);
    const path = url.pathname;
    const ipAddress = logger.getIP(req.headers);
    const userAgent = req.headers?.['user-agent'];

    // Get user info from session/auth if available
    let userId = null;
    try {
      // Attempt to get userId from auth header or session
      const authHeader = req.headers?.authorization;
      if (authHeader) {
        // Could decode JWT here if needed
        // userId = decodeJWT(authHeader).sub;
      }
    } catch (err) {
      // Silently fail if can't extract user
    }

    try {
      // Call the actual route handler
      const response = await handler(req, ...args);

      // Log successful request
      const duration = Date.now() - startTime;
      const status = response?.status || 200;

      if (status >= 400) {
        // Log 4xx/5xx as warnings/errors
        const level = status >= 500 ? 'ERROR' : 'WARN';
        logger[level.toLowerCase()](options.action || `${method}_${path}`, {
          service: options.service || 'api',
          userId,
          requestId,
          statusCode: status,
          duration,
          ipAddress,
          userAgent,
          metadata: {
            method,
            path,
            queryParams: Object.fromEntries(url.searchParams)
          }
        });
      } else {
        // Log successful requests as INFO
        logger.info(options.action || `${method}_${path}`, {
          service: options.service || 'api',
          userId,
          requestId,
          statusCode: status,
          duration,
          ipAddress,
          userAgent,
          metadata: {
            method,
            path,
            queryParams: Object.fromEntries(url.searchParams)
          }
        });
      }

      return response;
    } catch (error) {
      // Log errors
      const duration = Date.now() - startTime;

      logger.error(options.action || `${method}_${path}`, {
        service: options.service || 'api',
        userId,
        requestId,
        statusCode: 500,
        duration,
        ipAddress,
        userAgent,
        error,
        metadata: {
          method,
          path,
          errorMessage: error?.message,
          errorCode: error?.code
        }
      });

      // Re-throw so the framework handles it
      throw error;
    }
  };
};

/**
 * Next.js 13+ Route Handler wrapper (for App Router)
 * @param {Function} handler - Route handler (async function)
 * @param {Object} options - Logging options
 * @returns {Function} Wrapped handler
 */
export const withApiLogging = (handler, options = {}) => {
  return async (req, context) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID?.() || Math.random().toString(36);

    // Extract request info
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;
    const ipAddress = logger.getIP(Object.fromEntries(req.headers));
    const userAgent = req.headers.get('user-agent');

    try {
      // Call the handler
      const response = await handler(req, context);

      // Log the request
      const duration = Date.now() - startTime;
      const status = response?.status || 200;

      const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
      logger[logLevel](options.action || `${method}_${path}`, {
        service: options.service || 'api',
        requestId,
        statusCode: status,
        duration,
        ipAddress,
        userAgent,
        metadata: {
          method,
          path,
          ...options.metadata
        }
      });

      return response;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;

      logger.error(options.action || 'API_ERROR', {
        service: options.service || 'api',
        requestId,
        statusCode: 500,
        duration,
        ipAddress,
        userAgent,
        error,
        metadata: {
          method,
          path,
          ...options.metadata
        }
      });

      // Return error response
      return Response.json(
        { error: error.message, requestId },
        { status: 500 }
      );
    }
  };
};

export default { withLogging, withApiLogging };
