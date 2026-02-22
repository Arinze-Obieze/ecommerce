# Logging System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your E-Commerce App                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐                                            │
│  │  API Endpoints   │                                            │
│  ├──────────────────┤                                            │
│  │ - /auth/login    │                                            │
│  │ - /checkout      │                                            │
│  │ - /products      │                                            │
│  └────────┬─────────┘                                            │
│           │                                                       │
│           │ (calls logger)                                       │
│           ▼                                                       │
│  ┌──────────────────┐     ┌────────────────────┐                │
│  │  logger.info()   │────▶│  Logger Utility    │                │
│  │  logger.error()  │     │  (/utils/logger.js)│                │
│  │  logger.warn()   │     └────────┬───────────┘                │
│  └──────────────────┘              │                            │
│                                    │                            │
│                          ┌─────────▼────────────────┐           │
│                          │   Mask & Sanitize Data   │           │
│                          │ - Remove passwords       │           │
│                          │ - Hash emails            │           │
│                          │ - Anonymize PII          │           │
│                          └─────────┬────────────────┘           │
│                                    │                            │
└────────────────────────────────────┼────────────────────────────┘
                                     │
                    ┌────────────────▼──────────────┐
                    │  Supabase Client (JS SDK)     │
                    │  (INSERT into activity_logs)  │
                    └────────────────┬───────────────┘
                                     │
                                     │ HTTPS
                                     ▼
        ┌────────────────────────────────────────────┐
        │         Supabase PostgreSQL Database       │
        ├────────────────────────────────────────────┤
        │                                            │
        │  activity_logs                             │
        │  ┌──────────────────────────────────────┐  │
        │  │ id, created_at, level, action, ...  │  │
        │  │ user_id, ip_address, metadata       │  │
        │  │ error_code, error_stack, duration   │  │
        │  └──────────────────────────────────────┘  │
        │                                            │
        │  Indexes:                                  │
        │  - idx_logs_created_at                     │
        │  - idx_logs_user_id                        │
        │  - idx_logs_action                         │
        │  - idx_logs_level                          │
        │  - idx_logs_metadata (GIN)                 │
        │                                            │
        │  Views (pre-built):                        │
        │  - error_summary                           │
        │  - auth_analytics                          │
        │  - payment_analytics                       │
        │                                            │
        │  Functions (automation):                   │
        │  - cleanup_old_logs()                      │
        │  - anonymize_user_logs()                   │
        │                                            │
        └────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐        ┌──────────┐
   │ Queries│         │ Views  │        │Automation│
   │ Logs   │         │ Analysis
   │ Per    │         │ Trends │        │Cleanup   │
   │ User   │         │ Errors │        │GDPR      │
   └────────┘         └────────┘        └──────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Insights   │
                    │ - Error     │
                    │   Patterns  │
                    │ - Payment   │
                    │   Success   │
                    │ - Security  │
                    │   Events    │
                    └─────────────┘
```

---

## Data Flow for Key Operations

### 1. Authentication Flow

```
User Input (Login)
     │
     ▼
┌──────────────┐
│ POST /login  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ Validate credentials        │
└──────┬──────────────────────┘
       │
       ├─ SUCCESS ─────────────────┐
       │                           │
       │         ┌─────────────────────────┐
       │         │ logger.logAuth(        │
       │         │   'LOGIN_SUCCESS', {   │
       │         │   userId,              │
       │         │   metadata: {...}      │
       │         │ })                     │
       │         └────────┬────────────────┘
       │                  │
       │                  ▼ (INSERT)
       │         activity_logs table
       │                  │
       │                  ▼
       └──────────────────────────▶ Response: { token }
       │
       │
       ├─ FAILURE ─────────────────┐
       │                           │
       │         ┌─────────────────────────┐
       │         │ logger.warn(            │
       │         │   'LOGIN_FAILED', {    │
       │         │   ip, email_hash,       │
       │         │   attempt_number        │
       │         │ })                      │
       │         └────────┬────────────────┘
       │                  │
       │                  ▼ (INSERT)
       │         activity_logs table
       │                  │
       │                  ▼
       └──────────────────────────▶ Response: { error }
```

### 2. Payment Flow

```
User Checkout
     │
     ▼
┌──────────────────────┐
│ POST /api/checkout   │
└──────┬───────────────┘
       │
       ├─▶ logger.logPayment('CHECKOUT_INITIATED', {...}) ─▶ DB
       │
       ▼
┌────────────────────────────┐
│ Initialize Paystack        │
│ Gateway                    │
└──────┬─────────────────────┘
       │
       ├─▶ logger.logPayment('PAYMENT_GATEWAY_INITIALIZED', {...}) ─▶ DB
       │
       ▼
┌────────────────────────────┐
│ Create Order in DB         │
│ (status: PENDING)          │
└──────┬─────────────────────┘
       │
       ▼
Return Payment URL to Frontend
       │
       ▼
    User Pays on Paystack
       │
       ▼
┌────────────────────────┐
│ Paystack Webhook       │
│ POST /paystack/webhook │
└──────┬─────────────────┘
       │
       ├─ SUCCESS ─────────────────────┐
       │                               │
       │      ┌──────────────────────┐│
       │      │ Update Order: PAID   ││
       │      └──────┬───────────────┘│
       │             │                │
       │             ├─▶logger.logPayment( ──▶ DB
       │             │   'PAYMENT_SUCCESS'
       │             │
       │             ▼
       │      Send Confirmation Email
       │
       ├─ FAILURE ─────────────────────┐
       │                               │
       │      ┌──────────────────────┐│
       │      │ Update Order: FAILED ││
       │      └──────┬───────────────┘│
       │             │                │
       │             ├─▶logger.logPayment( ──▶ DB
       │             │   'PAYMENT_FAILED'
```

### 3. Error Handling Flow

```
Your Code
     │
     ▼
┌────────────────┐
│ Try Operation  │
└────┬────────┬──┘
     │        │
  Success   Catch (error)
     │        │
     │        ▼
     │   ┌──────────────────────┐
     │   │ logger.error(        │
     │   │   'OP_FAILED', {    │
     │   │   userId,            │
     │   │   error (full),       │
     │   │   stack trace,        │
     │   │   metadata           │
     │   │ })                   │
     │   └─────┬────────────────┘
     │         │
     │         ▼ (INSERT)
     │   activity_logs table
     │         │
     │         ▼
     │   Searchable Error Record
     │         │
     ▼         ▼
  Dashboard  Alerts/Monitoring
```

---

## Log Entry Structure (Example)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-02-21T10:30:45.123Z",
  "request_id": "req_abc123",
  "session_id": "sess_xyz789",
  "user_id": "user_123456",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "level": "INFO",
  "service": "auth-service",
  "action": "LOGIN_SUCCESS",
  "status": "success",
  "status_code": 200,
  "message": "User successfully logged in",
  "error_code": null,
  "error_stack": null,
  "duration_ms": 245,
  "metadata": {
    "email": "abc...@example.com (last 3 chars)",
    "loginMethod": "password",
    "country": "NG",
    "isFirstLogin": false,
    "mfaEnabled": false
  },
  "environment": "production"
}
```

---

## Query Patterns

### Find all login attempts by IP (brute force detection)
```sql
SELECT 
  ip_address,
  COUNT(*) as attempt_count,
  MAX(created_at) as latest_attempt
FROM activity_logs
WHERE action = 'LOGIN_FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5;
```

### Track payment success rate
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM activity_logs
WHERE action LIKE 'PAYMENT%'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

### Find slowest API endpoints
```sql
SELECT 
  metadata->>'path' as endpoint,
  ROUND(AVG(duration_ms::numeric), 0) as avg_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  COUNT(*) as request_count
FROM activity_logs
WHERE service = 'api'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY metadata->>'path'
HAVING ROUND(AVG(duration_ms::numeric), 0) > 500
ORDER BY avg_duration_ms DESC;
```

### Get error frequency
```sql
SELECT 
  action,
  error_code,
  COUNT(*) as occurrence_count,
  MAX(created_at) as latest,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM activity_logs WHERE level = 'ERROR'), 2) as percentage
FROM activity_logs
WHERE level = 'ERROR'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY action, error_code
ORDER BY occurrence_count DESC;
```

---

## Metadata Examples by Feature

### Authentication
```json
{
  "email": "abc...@example.com",
  "loginMethod": "password|google|github",
  "mfaUsed": true,
  "attemptNumber": 2,
  "lockoutTriggered": false,
  "country": "NG"
}
```

### Payment
```json
{
  "transactionId": "txn_abc123",
  "orderId": "ord_xyz789",
  "amount": 50000,
  "currency": "NGN",
  "gateway": "paystack",
  "gatewayTransactionId": "ref_paystack_123",
  "status": "pending|success|failed",
  "errorCode": "INSUFFICIENT_FUNDS",
  "itemCount": 3
}
```

### Search/Browse
```json
{
  "query": "blue shoes",
  "filters": [
    "category:footwear",
    "price:5000-50000",
    "brand:nike"
  ],
  "resultsCount": 24,
  "duration_ms": 145,
  "pageNumber": 1
}
```

### API Error
```json
{
  "method": "POST",
  "path": "/api/checkout",
  "endpoint":"/api/checkout",
  "statusCode": 500,
  "errorMessage": "Payment gateway timeout",
  "errorCode": "GATEWAY_TIMEOUT",
  "duration_ms": 30000,
  "queryParams": {
    "orderId": "ord_123"
  }
}
```

---

## Integration Pattern

```javascript
// PATTERN 1: Wrap route handler
import logger from '@/utils/logger';

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    // Your logic here
    logger.info('ACTION_SUCCESS', {
      userId: user.id,
      duration: Date.now() - startTime,
      metadata: { field: 'value' }
    });
  } catch (error) {
    logger.error('ACTION_FAILED', {
      error,
      userId: user?.id,
      duration: Date.now() - startTime,
      metadata: { attempted: 'operation' }
    });
  }
}

// PATTERN 2: Structured metadata
logger.logPayment('PAYMENT_SUCCESS', {
  userId,
  metadata: {
    orderId: order.id,
    amount: totalAmount,
    gateway: 'paystack',
    transactionId: gateway.ref
  }
});

// PATTERN 3: Security events
logger.warn('SUSPICIOUS_ACTIVITY', {
  userId,
  ipAddress: logger.getIP(headers),
  metadata: {
    reason: 'Multiple failed logins',
    attempts: 5,
    timeWindow: '15 minutes'
  }
});
```

---

This architecture is:
✅ Scalable (PostgreSQL can handle millions of logs)
✅ Queryable (Pre-built indexes and views)
✅ Secure (No PII in plaintext, GDPR compliant)
✅ Automated (Functions for cleanup and anonymization)
✅ Developer-friendly (Simple API, clear examples)
