import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitHeaders, rateLimitPayload } from '@/utils/platform/rate-limit';

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapePdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdfDocument(contentStream) {
  const objects = [
    null,
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, 'utf8');
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function buildReceiptPdf({ storeName, order, items, customer, shippingAddress }) {
  const BRAND = '0.180 0.361 0.271';
  let y = 812;
  const lines = [];

  const addText = ({ text, x = 40, size = 11, bold = false, color = '0 0 0' }) => {
    lines.push(`${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
    y -= size + 7;
  };

  lines.push(`${BRAND} rg 0 770 595 72 re f`);
  lines.push(`1 1 1 rg BT /F2 18 Tf 1 0 0 1 40 814 Tm (ZOVA RECEIPT) Tj ET`);
  lines.push(`1 1 1 rg BT /F1 11 Tf 1 0 0 1 40 794 Tm (${escapePdfText(storeName || 'Zova Store')}) Tj ET`);

  y = 742;
  addText({ text: `Order ID: ${order.id}`, bold: true });
  addText({ text: `Created: ${formatDateTime(order.created_at)}` });
  addText({ text: `Payment Status: ${prettify(order.status || 'pending')}` });
  addText({ text: `Fulfillment: ${prettify(order.fulfillment_status || 'processing')}` });
  addText({ text: `Escrow: ${prettify(order.escrow_status || 'not_funded')}` });
  addText({ text: `Payment Ref: ${order.payment_reference || '-'}` });

  y -= 4;
  addText({ text: 'Bill To', bold: true, size: 12, color: BRAND });
  addText({ text: customer?.full_name || 'Unknown customer' });
  addText({ text: customer?.email || '-' });
  addText({ text: customer?.phone || shippingAddress?.phone || '-' });

  y -= 4;
  addText({ text: 'Ship To', bold: true, size: 12, color: BRAND });
  addText({ text: shippingAddress?.address_line1 || '-' });
  if (shippingAddress?.address_line2) addText({ text: shippingAddress.address_line2 });
  addText({
    text: [shippingAddress?.city, shippingAddress?.state, shippingAddress?.country].filter(Boolean).join(', ') || '-',
  });
  addText({ text: shippingAddress?.postal_code ? `Postal: ${shippingAddress.postal_code}` : 'Postal: -' });

  y -= 6;
  addText({ text: 'Order Items', bold: true, size: 12, color: BRAND });

  const maxItems = 10;
  const visibleItems = items.slice(0, maxItems);

  visibleItems.forEach((item, index) => {
    const unitPrice = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);
    const lineTotal = unitPrice * quantity;
    const variant = [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
    const itemLabel = `${index + 1}. ${item.product?.name || 'Product'}${variant ? ` (${variant})` : ''}`;

    addText({ text: itemLabel, bold: true, size: 10 });
    addText({ text: `Qty ${quantity} x ${formatMoney(unitPrice)} = ${formatMoney(lineTotal)}`, size: 10 });
  });

  if (items.length > maxItems) {
    addText({ text: `+ ${items.length - maxItems} more item(s) not shown`, size: 10 });
  }

  y -= 6;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  addText({ text: `Store Subtotal: ${formatMoney(subtotal)}`, bold: true, size: 12, color: BRAND });
  addText({ text: `Generated: ${formatDateTime(new Date().toISOString())}`, size: 9, color: '0.4 0.4 0.4' });

  return buildPdfDocument(lines.join('\n'));
}

async function getStoreOrderDetailForReceipt(ctx, orderId) {
  const { data: productRows, error: productError } = await ctx.adminClient
    .from('products')
    .select('id')
    .eq('store_id', ctx.membership.store_id)
    .limit(5000);

  if (productError) throw new Error(productError.message || 'Failed to load store products');

  const productIds = (productRows || []).map((row) => row.id);
  if (productIds.length === 0) return null;

  const { data: orderItemsRows, error: orderItemsError } = await ctx.adminClient
    .from('order_items')
    .select('id, order_id, product_id, quantity, price, variant_id')
    .eq('order_id', orderId)
    .in('product_id', productIds);

  if (orderItemsError) throw new Error(orderItemsError.message || 'Failed to load order items');
  if (!orderItemsRows || orderItemsRows.length === 0) return null;

  const { data: order, error: orderError } = await ctx.adminClient
    .from('orders')
    .select('id, user_id, status, payment_reference, created_at, fulfillment_status, escrow_status')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message || 'Failed to load order');
  if (!order) return null;

  const productIdsForOrder = [...new Set(orderItemsRows.map((item) => item.product_id).filter(Boolean))];
  const variantIds = [...new Set(orderItemsRows.map((item) => item.variant_id).filter(Boolean))];

  let productsById = new Map();
  let variantsById = new Map();

  if (productIdsForOrder.length > 0) {
    const { data: productDetails, error: productDetailsError } = await ctx.adminClient
      .from('products')
      .select('id, name, store_id')
      .in('id', productIdsForOrder);

    if (productDetailsError) throw new Error(productDetailsError.message || 'Failed to load product details');
    productsById = new Map((productDetails || []).map((row) => [row.id, row]));
  }

  if (variantIds.length > 0) {
    const { data: variantRows, error: variantError } = await ctx.adminClient
      .from('product_variants')
      .select('id, color, size')
      .in('id', variantIds);

    if (variantError) throw new Error(variantError.message || 'Failed to load variants');
    variantsById = new Map((variantRows || []).map((row) => [row.id, row]));
  }

  const items = orderItemsRows
    .map((item) => ({
      ...item,
      product: productsById.get(item.product_id) || null,
      variant: variantsById.get(item.variant_id) || null,
    }))
    .filter((item) => item.product?.store_id === ctx.membership.store_id);

  if (items.length === 0) return null;

  const { data: shippingAddress, error: shippingError } = await ctx.adminClient
    .from('order_shipping_addresses')
    .select('address_line1, address_line2, city, state, postal_code, country, phone, contact_email')
    .eq('order_id', orderId)
    .maybeSingle();

  if (shippingError && shippingError.code !== 'PGRST116') {
    throw new Error(shippingError.message || 'Failed to load shipping address');
  }

  const { data: customer, error: customerError } = await ctx.adminClient
    .from('users')
    .select('full_name, email, phone')
    .eq('id', order.user_id)
    .maybeSingle();

  if (customerError && customerError.code !== 'PGRST116') {
    throw new Error(customerError.message || 'Failed to load customer');
  }

  return {
    order,
    items,
    customer: customer || (shippingAddress?.contact_email ? { full_name: 'Guest customer', email: shippingAddress.contact_email, phone: shippingAddress.phone } : null),
    shippingAddress: shippingAddress || null,
  };
}

export async function GET(request, { params }) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_orders_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), {
      status: 429,
      headers: rateLimitHeaders(rateLimit),
    });
  }

  try {
    const { id } = await params;
    const detail = await getStoreOrderDetailForReceipt(ctx, id);

    if (!detail?.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const pdfBuffer = buildReceiptPdf({
      storeName: ctx.store?.name || 'Zova Store',
      order: detail.order,
      items: detail.items,
      customer: detail.customer,
      shippingAddress: detail.shippingAddress,
    });

    const { searchParams } = new URL(request.url);
    const shouldDownload = searchParams.get('download') === '1';
    const filename = `zova-receipt-${detail.order.id.slice(0, 8)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.byteLength),
        'Content-Disposition': `${shouldDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to generate receipt PDF' }, { status: 500 });
  }
}
