import { MARQUEE_ITEMS } from './hero.constants';

export default function TrustMarquee() {
  return (
    <div className="mt-2 overflow-hidden border-y border-primary/10 bg-white/60 backdrop-blur-sm">
      <div className="relative py-2.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white/95 to-transparent" />
        <div className="zova-hero-marquee-track flex whitespace-nowrap">
          {[0, 1].map((repeat) => (
            <div key={repeat} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((item, index) => (
                <span
                  key={`${repeat}-${index}`}
                  className="mx-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
