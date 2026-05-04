import { useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const ALWAYS_OPEN = new Set(['category', 'price', 'sizes', 'colors']);

export default function FilterSection({ title, section, isExpanded, onToggle, children }) {
  const pinned = ALWAYS_OPEN.has(section);
  const open = pinned || isExpanded;
  const bodyId = useId();

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
      <button
        type="button"
        onClick={() => !pinned && onToggle(section)}
        className="flex w-full items-center justify-between py-3"
        style={{ cursor: pinned ? 'default' : 'pointer' }}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-[3px] shrink-0 rounded-full transition-colors"
            style={{ backgroundColor: open ? 'var(--zova-accent-emphasis)' : 'transparent' }}
          />
          <span
            className="text-[11px] font-black uppercase tracking-[0.14em] transition-colors"
            style={{ color: open ? 'var(--zova-primary-action)' : 'var(--zova-ink)' }}
          >
            {title}
          </span>
        </div>
        {!pinned ? (
          <FiChevronDown
            className="h-3.5 w-3.5 shrink-0 transition-transform duration-300"
            style={{
              color: open ? 'var(--zova-primary-action)' : 'var(--zova-text-muted)',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        ) : null}
      </button>

      <div
        id={bodyId}
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 pb-4">{children}</div>
      </div>
    </div>
  );
}
