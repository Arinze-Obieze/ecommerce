import { FiCheck } from 'react-icons/fi';
import { handleArrowKeyNavigation } from './filterSidebar.utils';

export default function ColorSwatchButton({ color, isActive, isUnavailable, count, onClick }) {
  return (
    <button
      type="button"
      onClick={() => !isUnavailable && onClick(color.name)}
      onKeyDown={handleArrowKeyNavigation}
      data-nav-item="true"
      disabled={isUnavailable}
      className="relative flex flex-col items-center gap-1 rounded-xl p-2 transition-all"
      style={{
        backgroundColor: isActive ? 'var(--zova-green-soft)' : 'transparent',
        outline: isActive ? '1px solid var(--zova-primary-action)' : 'none',
        opacity: isUnavailable ? 0.45 : 1,
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(event) => {
        if (!isActive && !isUnavailable) event.currentTarget.style.backgroundColor = 'var(--zova-linen)';
      }}
      onMouseLeave={(event) => {
        if (!isActive && !isUnavailable) event.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label={`${color.name}${count ? ` (${count})` : ''}`}
    >
      <div
        className="h-9 w-9 rounded-full border shadow-sm"
        style={{
          backgroundColor: color.hex,
          borderColor: color.hex === '#FFFFFF' ? 'var(--zova-border)' : 'transparent',
        }}
      />
      {isActive ? (
        <span
          className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--zova-primary-action)', color: '#FFFFFF' }}
        >
          <FiCheck className="h-2.5 w-2.5" />
        </span>
      ) : null}
      <span
        className="w-full truncate text-center text-[10px] font-medium"
        style={{ color: isActive ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)' }}
      >
        {color.name}
      </span>
      {count > 0 ? (
        <span className="text-[9px] leading-none" style={{ color: 'var(--zova-text-muted)' }}>
          {count}
        </span>
      ) : null}
    </button>
  );
}
