'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { preload } from 'react-dom';
import gsap from 'gsap';
import { initHeroJourney } from './heroJourneyEngine';
import { LAYOUTS, SIZE } from './heroJourneyLayout';
import './hero-journey.css';

const assets = '/assets/hero/journey';
const artwork = (Object.keys(SIZE) as (keyof typeof SIZE)[]).map((name) => {
  const [width, height] = SIZE[name];
  const position = Object.entries(LAYOUTS).flatMap(([mode, layout]) => {
    const [x, y] = layout.obj[name];
    const [shopX, shopY] = layout.obj.center;
    const [shopWidth, shopHeight] = SIZE.center;
    return [
      [`--${mode}-left`, `${x / layout.w * 100}%`],
      [`--${mode}-top`, `${(y + layout.dy) / layout.h * 100}%`],
      [`--${mode}-width`, `${width / layout.w * 100}%`],
      [`--${mode}-entrance-x`, `${(shopX + shopWidth / 2 - x - width / 2) / width * 70}%`],
      [`--${mode}-entrance-y`, `${(shopY + shopHeight / 2 - y - height / 2) / height * 70}%`],
    ];
  });
  return { name, width, height, style: Object.fromEntries(position) as CSSProperties };
});

export default function HeroJourney() {
  const root = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const id = `hero-journey-${useId().replace(/[^\w-]/g, '')}`;

  preload(`${assets}/website.webp`, { as: 'image', fetchPriority: 'high' });
  preload(`${assets}/seo.webp`, { as: 'image', fetchPriority: 'high' });

  useEffect(() => {
    if (!root.current || !poster.current) return;

    let disposed = false;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<gsap.core.Tween>();
    const icons = Array.from(poster.current.querySelectorAll<HTMLImageElement>('[data-icon-entrance]'));
    const entranceStart = performance.now();
    const entrance = Promise.allSettled(icons.map(async (icon, index) => {
      await icon.decode();
      if (disposed || motion.matches) return;
      const state = { progress: 0 };
      await new Promise<void>((resolve) => {
        const finish = () => {
          icon.style.removeProperty('--entrance-progress');
          animations.delete(animation);
          resolve();
        };
        const animation = gsap.to(state, {
          progress: 1,
          duration: 0.9,
          ease: 'back.out(1.5)',
          delay: Math.max(0, (entranceStart + index * 90 - performance.now()) / 1000),
          onUpdate: () => icon.style.setProperty('--entrance-progress', String(state.progress)),
          onComplete: finish,
          onInterrupt: finish,
        });
        animations.add(animation);
      });
    }));

    const syncMotionPreference = () => {
      if (motion.matches) animations.forEach((animation) => animation.totalProgress(1));
    };
    motion.addEventListener('change', syncMotionPreference);
    const disposeJourney = initHeroJourney(root.current, { gsap, assets, id, entrance });
    return () => {
      disposed = true;
      disposeJourney();
      motion.removeEventListener('change', syncMotionPreference);
      animations.forEach((animation) => animation.kill());
    };
  }, [id]);

  return (
    <div
      className="hj-shell"
      role="img"
      aria-label="Website, search, ads and AI connect to a local shop and lead to a booked call."
      data-journey
    >
      <div ref={root} className="hj" aria-hidden="true" />
      <div ref={poster} className="hj-poster" aria-hidden="true">
        {artwork.map(({ name, width, height, style }) => (
          <img
            key={name}
            src={`${assets}/${name}.webp`}
            data-icon-entrance={name === 'center' ? undefined : name}
            width={width}
            height={height}
            fetchPriority={['center', 'website', 'seo'].includes(name) ? 'high' : 'auto'}
            style={style}
            alt=""
          />
        ))}
      </div>
    </div>
  );
}
