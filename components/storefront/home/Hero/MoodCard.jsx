import Link from 'next/link';
import MoodPill from './MoodPill';

const CARD_VARIANTS = {
  hero: {
    linkClass: 'zova-mood-card h-full rounded-[18px]',
    bodyClass: 'absolute inset-x-0 bottom-0 z-[1] p-[16px_18px]',
    titleClass: 'mb-[5px] text-[22px] font-extrabold leading-[1.15] text-white',
    subtitleClass: 'mb-[14px] text-[12px] text-white/70',
    cta: true,
  },
  side: {
    linkClass: 'zova-mood-card flex-1 min-h-0 rounded-[16px]',
    bodyClass: 'absolute inset-x-0 bottom-0 z-[1] p-[10px_13px]',
    titleClass: 'mb-[2px] text-[15px] font-bold leading-[1.2] text-white',
    subtitleClass: 'text-[11px] text-white/70',
    cta: false,
  },
  chip: {
    linkClass: 'zova-mood-card h-[138px] w-[110px] min-w-[110px] shrink-0 rounded-[14px]',
    bodyClass: 'absolute inset-x-0 bottom-0 z-[1] p-[8px_10px]',
    titleClass: 'text-[12px] font-bold leading-[1.2] text-white',
    subtitleClass: '',
    cta: false,
    smallPill: true,
  },
  rail: {
    linkClass: 'zova-mood-card h-[125px] w-[100px] min-w-[100px] shrink-0 rounded-[13px]',
    bodyClass: 'absolute inset-x-0 bottom-0 z-[1] p-[7px_9px]',
    titleClass: 'text-[11px] font-bold leading-[1.2] text-white',
    subtitleClass: '',
    cta: false,
    titleOnly: true,
  },
};

export default function MoodCard({ mood, variant = 'chip' }) {
  const config = CARD_VARIANTS[variant];

  return (
    <Link href={mood.link} className={`${config.linkClass} snap-start no-underline`}>
      <img
        src={mood.image}
        alt={mood.title}
        className="zova-mood-image absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent from-25% to-black/75" />
      <div className={config.bodyClass}>
        {variant !== 'rail' ? <MoodPill label={mood.label} small={Boolean(config.smallPill)} /> : null}
        <div className={config.titleClass}>{mood.title}</div>
        {!config.titleOnly && mood.subtitle ? <div className={config.subtitleClass}>{mood.subtitle}</div> : null}
        {config.cta ? (
          <span className="inline-flex items-center gap-[5px] rounded-full bg-(--zova-accent-emphasis) px-[17px] py-2 text-[12px] font-bold text-white">
            Shop now ›
          </span>
        ) : null}
      </div>
    </Link>
  );
}
