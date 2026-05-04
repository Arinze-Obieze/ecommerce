import { useEffect, useState } from 'react';
import { HERO_SLIDES } from './hero.constants';

export default function useHeroSlides() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return {
    activeSlide,
    setActiveSlide,
  };
}
