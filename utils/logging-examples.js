/**
 * LOGGING INTEGRATION EXAMPLES
 * 
 * This file shows how to integrate the logger into critical parts of your e-commerce app:
 * - Authentication (login, signup, logout)
 * - Payment processing (Paystack)
 * - Error handling
 * - User actions (search, add to cart, etc.)
 * 
 * Copy and adapt these patterns to your actual route handlers and API endpoints.
 */

import logger from '@/utils/logger';
import { withApiLogging } from '@/utils/apiLogger';

// ============================================================
// 1. AUTHENTICATION LOGGING
// ============================================================

/**
 * Example: Login API Handler
 * Location: /app/api/auth/login/route.js
 */
export async function loginExample(req) {
  const { email, password } = await req.json();
  const ipAddress = logger.getIP(Object.fromEntries(req.headers));
  const requestId = crypto.randomUUID();

  // Check if account is locked (brute force protection)
  const failedAttempts = await redis.get(`login_attempts:${email}:${ipAddress}`);
  if (failedAttempts && parseInt(failedAttempts) > 5) {
    logger.warn('LOGIN_BLOCKED_BRUTE_FORCE', {
      service: 'auth-service',
      action: 'LOGIN_BLOCKED',
      requestId,
      ipAddress,
      metadata: {
        email: logger.hashEmail(email),
        attemptsSoFar: failedAttempts,
        reason: 'Too many failed attempts'
      }
    });

    return Response.json(
      { error: 'Account temporarily locked. Try again later.' },
      { status: 429 }
    );
  }

  try {
    // Find user
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      // Failed login attempt
      await redis.incr(`login_attempts:${email}:${ipAddress}`);
      await redis.expire(`login_attempts:${email}:${ipAddress}`, 900); // 15 min

      logger.warn('LOGIN_FAILED', {
        service: 'auth-service',
        requestId,
        ipAddress,
        message: 'Invalid email or password',
        metadata: {
          email: logger.hashEmail(email),
          reason: 'Invalid credentials',
          attemptNumber: parseInt(failedAttempts || 0) + 1
        }
      });

      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Clear failed attempts
    await redis.del(`login_attempts:${email}:${ipAddress}`);

    // Generate token
    const token = generateJWT({
      sub: user.id,
      email: user.email,
      expiresIn: '24h'
    });

    // Log successful login
    logger.logAuth('LOGIN_SUCCESS', {
      requestId,
      userId: user.id,
      ipAddress,
      userAgent: req.headers.get('user-agent'),
      metadata: {
        email: logger.hashEmail(email),
        loginMethod: 'password',
        country: user.country,
        isFirstLogin: !user.lastLoginAt
      }
    });

    return Response.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    logger.error('LOGIN_ERROR', {
      service: 'auth-service',
      requestId,
      ipAddress,
      error,
      metadata: {
        email: logger.hashEmail(email),
        errorReason: 'Unexpected server error'
      }
    });

    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Example: Signup API Handler
 * Location: /app/api/auth/signup/route.js
 */
export async function signupExample(req) {
  const { email, password, fullName } = await req.json();
  const requestId = crypto.randomUUID();

  try {
    // Validate input
    if (!isValidEmail(email)) {
      logger.warn('SIGNUP_VALIDATION_ERROR', {
        service: 'auth-service',
        requestId,
        ipAddress: logger.getIP(Object.fromEntries(req.headers)),
        metadata: {
          validationField: 'email',
          reason: 'Invalid email format'
        }
      });

      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn('SIGNUP_EMAIL_ALREADY_EXISTS', {
        service: 'auth-service',
        requestId,
        metadata: {
          email: logger.hashEmail(email),
          reason: 'Duplicate email'
        }
      });

      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await db.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
        createdAt: new Date()
      }
    });

    // Log successful signup
    logger.logAuth('SIGNUP_SUCCESS', {
      requestId,
      userId: newUser.id,
      ipAddress: logger.getIP(Object.fromEntries(req.headers)),
      userAgent: req.headers.get('user-agent'),
      metadata: {
        email: logger.hashEmail(email),
        signupMethod: 'email_password',
        country: newUser.country || 'NG'
      }
    });

    return Response.json(
      { message: 'Account created successfully', userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    logger.error('SIGNUP_ERROR', {
      service: 'auth-service',
      requestId,
      error,
      metadata: {
        email: logger.hashEmail(email),
        errorReason: 'Database or server error'
      }
    });

    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// ============================================================
// 2. PAYMENT LOGGING
// ============================================================

/**
 * Example: Checkout Initiation
 * Location: /app/api/checkout/route.js
 */
export async function checkoutExample(req) {
  const session = await getSession(req);
  const { cartItems, totalAmount } = await req.json();
  const requestId = crypto.randomUUID();
  const transactionId = generateTransactionId();

  // Log checkout initiation
  logger.logPayment('CHECKOUT_INITIATED', {
    requestId,
    userId: session.user.id,
    ipAddress: logger.getIP(Object.fromEntries(req.headers)),
    metadata: {
      transactionId,
      itemCount: cartItems.length,
      amount: totalAmount,
      currency: 'NGN',
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }
  });

  try {
    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: totalAmount * 100, // Convert to kobo
        reference: transactionId,
        metadata: {
          orderId: transactionId,
          userId: session.user.id
        }
      })
    });

    const data = await paystackResponse.json();

    if (!data.status) {
      throw new Error(data.message || 'Payment gateway error');
    }

    // Create order in database
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        transactionId,
        status: 'PENDING',
        totalAmount,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Log successful payment gateway initialization
    logger.logPayment('PAYMENT_GATEWAY_INITIALIZED', {
      requestId,
      userId: session.user.id,
      ipAddress: logger.getIP(Object.fromEntries(req.headers)),
      metadata: {
        transactionId,
        orderId: order.id,
        gateway: 'paystack',
        gatewayTransactionId: data.data.authorization_url,
        amount: totalAmount,
        status: 'pending'
      }
    });

    return Response.json({
      authorizationUrl: data.data.authorization_url,
      orderId: order.id,
      transactionId
    });
  } catch (error) {
    logger.error('CHECKOUT_ERROR', {
      service: 'payment-service',
      requestId,
      userId: session.user.id,
      ipAddress: logger.getIP(Object.fromEntries(req.headers)),
      error,
      metadata: {
        transactionId,
        amount: totalAmount,
        gateway: 'paystack',
        errorReason: error.message
      }
    });

    return Response.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}

/**
 * Example: Payment Webhook Handler (Paystack callback)
 * Location: /app/api/webhooks/paystack/route.js
 */
export async function paystackWebhookExample(req) {
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();
  const requestId = crypto.randomUUID();

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    logger.warn('WEBHOOK_VERIFICATION_FAILED', {
      service: 'payment-service',
      requestId,
      ipAddress: logger.getIP(Object.fromEntries(req.headers)),
      metadata: {
        webhook: 'paystack',
        reason: 'Invalid signature'
      }
    });

    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const { event: eventType, data } = event;

  logger.info('WEBHOOK_RECEIVED', {
    service: 'payment-service',
    requestId,
    metadata: {
      webhook: 'paystack',
      eventType,
      transactionId: data.reference,
      amount: data.amount / 100,
      timestamp: data.paidAt
    }
  });

  try {
    if (eventType === 'charge.success') {
      // Find order by transaction ID
      const order = await db.order.findUnique({
        where: { transactionId: data.reference }
      });

      if (!order) {
        throw new Error(`Order not found for transaction ${data.reference}`);
      }

      // Update order status
      await db.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(data.paid_at)
        }
      });

      // Log successful payment
      logger.logPayment('PAYMENT_SUCCESS', {
        userId: order.userId,
        requestId,
        metadata: {
          orderId: order.id,
          transactionId: data.reference,
          amount: data.amount / 100,
          gateway: 'paystack',
          gatewayResponse: data,
          timestamp: data.paid_at
        }
      });

      // Send confirmation email
      await sendOrderConfirmationEmail(order);

      return Response.json({ success: true });
    }

    if (eventType === 'charge.failed') {
      // Find and update order
      const order = await db.order.findUnique({
        where: { transactionId: data.reference }
      });

      if (order) {
        await db.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        });

        logger.logPayment('PAYMENT_FAILED', {
          userId: order.userId,
          requestId,
          metadata: {
            orderId: order.id,
            transactionId: data.reference,
            amount: data.amount / 100,
            gateway: 'paystack',
            failureReason: data.gateway_response,
            errorCode: data.authorization?.authorization_code
          }
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    logger.error('WEBHOOK_PROCESSING_ERROR', {
      service: 'payment-service',
      requestId,
      error,
      metadata: {
        webhook: 'paystack',
        eventType,
        transactionId: data.reference,
        errorReason: error.message
      }
    });

    return Response.json({ success: false }, { status: 500 });
  }
}

// ============================================================
// 3. ERROR HANDLING & LOGGING
// ============================================================

/**
 * Global error handler
 * Wrap this in your error boundary or middleware
 */
export function logUncaughtError(error, context = {}) {
  logger.critical('UNCAUGHT_ERROR', {
    service: 'app',
    error,
    metadata: {
      ...context,
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    }
  });
}

/**
 * Validation error logger
 */
export function logValidationError(field, value, reason) {
  logger.warn('VALIDATION_ERROR', {
    service: 'api',
    metadata: {
      field,
      valueType: typeof value,
      reason,
      timestamp: new Date()
    }
  });
}

// ============================================================
// 4. USER ACTIONS LOGGING
// ============================================================

/**
 * Log product search
 */
export function logProductSearch(userId, query, filters, resultsCount) {
  logger.info('PRODUCT_SEARCH', {
    service: 'product-service',
    userId,
    metadata: {
      query,
      filters,
      resultsCount,
      timestamp: new Date()
    }
  });
}

/**
 * Log cart operations
 */
export function logCartAction(userId, action, productId, quantity) {
  logger.info(`CART_${action.toUpperCase()}`, {
    service: 'cart-service',
    userId,
    metadata: {
      productId,
      quantity,
      action,
      timestamp: new Date()
    }
  });
}

/**
 * Log wishlist operations
 */
export function logWishlistAction(userId, action, productId) {
  logger.info(`WISHLIST_${action.toUpperCase()}`, {
    service: 'wishlist-service',
    userId,
    metadata: {
      productId,
      action,
      timestamp: new Date()
    }
  });
}

export default {
  loginExample,
  signupExample,
  checkoutExample,
  paystackWebhookExample,
  logUncaughtError,
  logValidationError,
  logProductSearch,
  logCartAction,
  logWishlistAction
};
