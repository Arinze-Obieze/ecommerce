'use client';

import { useEffect, useState } from 'react';

export default function useAuthSlideshow(totalSlides, intervalMs = 5500) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!totalSlides) return undefined;

    const id = setInterval(() => {
      setSlide((current) => (current + 1) % totalSlides);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, totalSlides]);

  return {
    slide,
    setSlide,
  };
}
