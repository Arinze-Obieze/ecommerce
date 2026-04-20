/**
 * ConfirmModal
 * A fixed-overlay confirmation dialog.
 * Renders nothing when `open` is false.
 *
 * Props:
 *   open          — (boolean)
 *   title         — (string)
 *   message       — (string | ReactNode)
 *   confirmLabel  — (string) default "Confirm"
 *   cancelLabel   — (string) default "Cancel"
 *   onConfirm     — () => void
 *   onCancel      — () => void
 *   danger        — (boolean) if true, confirm button is red; default true
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#2E6417] hover:bg-[#245213]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
