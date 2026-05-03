import { handleArrowKeyNavigation } from './filterSidebar.utils';

export default function SizeChip({ size, isActive, isUnavailable, count, onClick }) {
  return (
    <button
      type="button"
      onClick={() => !isUnavailable && onClick(size)}
      onKeyDown={handleArrowKeyNavigation}
      data-nav-item="true"
      disabled={isUnavailable}
      className="rounded-lg border py-2 text-xs font-bold transition-all"
      style={{
        borderColor: isActive ? 'var(--zova-primary-action)' : 'var(--zova-border)',
        backgroundColor: isActive ? 'var(--zova-primary-action)' : 'transparent',
        color: isActive ? '#ffffff' : 'var(--zova-text-muted)',
        opacity: isUnavailable ? 0.45 : 1,
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(event) => {
        if (!isActive && !isUnavailable) {
          event.currentTarget.style.borderColor = 'var(--zova-primary-action)';
          event.currentTarget.style.color = 'var(--zova-primary-action)';
        }
      }}
      onMouseLeave={(event) => {
        if (!isActive && !isUnavailable) {
          event.currentTarget.style.borderColor = 'var(--zova-border)';
          event.currentTarget.style.color = 'var(--zova-text-muted)';
        }
      }}
    >
      <span>{size}</span>
      {count > 0 ? <span className="ml-1 text-[9px] opacity-70">({count})</span> : null}
    </button>
  );
}
