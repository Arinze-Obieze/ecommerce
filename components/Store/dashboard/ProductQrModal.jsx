'use client';

import { FiCopy } from 'react-icons/fi';

/**
 * ProductQrModal
 * The QR code popup extracted from ProductsClientView.
 *
 * Props:
 *   open          — (boolean)
 *   product       — { name, sku } | null
 *   qrValue       — (string) the URL encoded in the QR
 *   qrImageUrl    — (string) the src of the QR <img>
 *   onCopyValue   — () => void
 *   onOpenPng     — () => void
 *   onDownload    — () => void
 *   onPrint       — () => void
 *   onClose       — () => void
 */
export default function ProductQrModal({
  open,
  product,
  qrValue,
  qrImageUrl,
  onCopyValue,
  onOpenPng,
  onDownload,
  onPrint,
  onClose,
}) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Product QR Code</h3>
        <p className="mt-1 text-sm text-gray-500">
          {product.name}
          {product.sku ? ` • ${product.sku}` : ''}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          One QR for all contexts: staff from this store open scan tools, others open public product page.
        </p>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-[#fafcfa] p-4">
          <img
            src={qrImageUrl}
            alt={`QR for ${product.name}`}
            className="mx-auto h-56 w-56 rounded-xl border border-gray-200 bg-white p-2"
          />
          <p className="mt-3 break-all text-xs text-gray-500">{qrValue}</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCopyValue}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <FiCopy size={14} />
            Copy value
          </button>
          <button
            type="button"
            onClick={onOpenPng}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Open PNG
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="rounded-xl border border-[#2E5C45] px-3 py-2 text-sm font-semibold text-[#2E5C45] hover:bg-[#f3f8f5]"
          >
            Print
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2E5C45] px-3 py-2 text-sm font-semibold text-white hover:bg-[#254a38]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
