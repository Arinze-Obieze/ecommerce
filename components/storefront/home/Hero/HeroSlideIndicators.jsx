import { HERO_SLIDES } from './hero.constants';

export default function HeroSlideIndicators({ activeSlide, onSelectSlide }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {HERO_SLIDES.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          aria-label={`Show hero slide ${index + 1}`}
          aria-pressed={index === activeSlide}
          onClick={() => onSelectSlide(index)}
          className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
        />
      ))}
    </div>
  );
}
