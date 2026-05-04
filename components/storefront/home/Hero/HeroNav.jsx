import Link from 'next/link';
import { HERO_NAV_ITEMS } from './hero.constants';

export default function HeroNav({ activeTab, onSelectTab, onOpenCategories }) {
  return (
    <div className="relative z-40">
      <div className="zova-shell zova-topbar mt-3 rounded-full px-3 sm:px-5">
        <div className="zova-scrollbar-hide flex items-center justify-center gap-6 overflow-x-auto py-3 md:gap-10">
          {HERO_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.name;
            const content = (
              <>
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-(--zova-accent-emphasis) transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`}
                />
              </>
            );

            if (item.name === 'Categories') {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.name);
                    onOpenCategories();
                  }}
                  className={`relative whitespace-nowrap pb-1.5 text-[13px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                    isActive ? 'text-(--zova-primary-action)' : 'text-gray-500 hover:text-(--zova-primary-action)'
                  }`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onSelectTab(item.name)}
                className={`relative whitespace-nowrap pb-1.5 text-[13px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                  isActive ? 'text-(--zova-primary-action)' : 'text-gray-500 hover:text-(--zova-primary-action)'
                }`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
