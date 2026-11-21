'use client';

import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';
import { initHeroJourney } from './heroJourneyEngine';
import './hero-journey.css';

const assets = '/assets/hero/journey';

export default function HeroJourney({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<ReturnType<typeof initHeroJourney> | null>(null);
  const id = `hero-journey-${useId().replace(/[^\w-]/g, '')}`;

  useEffect(() => {
    if (!root.current) return;

    const scene = initHeroJourney(root.current, { gsap, assets, delay: 0.38, id });
    controls.current = scene;

    return () => {
      scene.dispose();
      controls.current = null;
    };
  }, [id]);

  useEffect(() => {
    controls.current?.setPlaying(!paused);
  }, [paused]);

  return (
    <div
      className="hj-shell"
      role="img"
      aria-label="Website, search, ads and AI connect to a local shop and lead to a booked call."
      data-journey
    >
      <div ref={root} className="hj" aria-hidden="true" />
      <img
        className="hj-poster"
        src={`${assets}/center.webp`}
        width={886}
        height={616}
        fetchPriority="high"
        alt=""
      />
    </div>
  );
}
