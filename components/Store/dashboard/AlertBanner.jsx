/**
 * AlertBanner
 * Renders nothing when `message` is falsy — safe to render unconditionally.
 *
 * Props:
 *   type    — 'error' | 'notice' | 'warning'   (default: 'error')
 *   message — (string) the text to display
 */
const STYLES = {
  error:   'border-red-200 bg-red-50 text-red-700',
  notice:  'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

export default function AlertBanner({ type = 'error', message }) {
  if (!message) return null;
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${STYLES[type] ?? STYLES.error}`}>
      {message}
    </div>
  );
}
