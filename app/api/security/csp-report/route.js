import { NextResponse } from 'next/server';
import { enforceRateLimit } from '@/utils/platform/rate-limit';
import { getRequestIp } from '@/utils/platform/rate-limit';

export const dynamic = 'force-dynamic';

function sanitizeReport(input) {
  const report = input?.['csp-report'] || input?.body || input || {};
  return {
    documentUri: String(report['document-uri'] || report.documentURL || '').slice(0, 500),
    blockedUri: String(report['blocked-uri'] || report.blockedURL || '').slice(0, 500),
    violatedDirective: String(report['violated-directive'] || report.effectiveDirective || '').slice(0, 160),
    originalPolicy: String(report['original-policy'] || '').slice(0, 1000),
    sourceFile: String(report['source-file'] || report.sourceFile || '').slice(0, 500),
    lineNumber: Number.parseInt(report['line-number'] || report.lineNumber || '0', 10) || null,
    columnNumber: Number.parseInt(report['column-number'] || report.columnNumber || '0', 10) || null,
  };
}

export async function POST(request) {
  const rateLimit = await enforceRateLimit({
    request,
    scope: 'security_csp_report',
    identifier: getRequestIp(request),
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return new NextResponse(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }

  const body = await request.json().catch(() => null);
  const reports = Array.isArray(body) ? body : [body];
  const safeReports = reports.filter(Boolean).map(sanitizeReport);

  if (safeReports.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('[csp-report]', safeReports);
  }

  return new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
