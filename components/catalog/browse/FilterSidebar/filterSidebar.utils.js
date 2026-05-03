export function parsePriceInput(value) {
  const normalized = String(value || '').replace(/,/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function handleArrowKeyNavigation(event) {
  const { key, currentTarget } = event;
  const navigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!navigationKeys.includes(key)) return;

  const group = currentTarget.closest('[data-nav-group]');
  if (!group) return;

  const items = Array.from(group.querySelectorAll('[data-nav-item="true"]:not([disabled])'));
  const currentIndex = items.indexOf(currentTarget);
  if (currentIndex === -1 || items.length === 0) return;

  event.preventDefault();

  if (key === 'Home') {
    items[0]?.focus();
    return;
  }

  if (key === 'End') {
    items[items.length - 1]?.focus();
    return;
  }

  const direction = key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1;
  const nextIndex = (currentIndex + direction + items.length) % items.length;
  items[nextIndex]?.focus();
}

export function findCategoryPath(categories, slug, path = []) {
  for (const category of categories || []) {
    const nextPath = [...path, category];
    if (category.slug === slug) return nextPath;
    const childPath = findCategoryPath(category.children, slug, nextPath);
    if (childPath) return childPath;
  }

  return null;
}
