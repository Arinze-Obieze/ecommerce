import { handleArrowKeyNavigation } from './filterSidebar.utils';

export default function CategoryChip({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleArrowKeyNavigation}
      data-nav-item="true"
      className="rounded-full border px-3 py-2 text-sm font-semibold transition-all"
      style={{
        borderColor: isActive ? 'var(--zova-primary-action)' : 'var(--zova-border)',
        backgroundColor: isActive ? 'var(--zova-green-soft)' : '#FFFFFF',
        color: isActive ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
      }}
    >
      {label}
    </button>
  );
}
