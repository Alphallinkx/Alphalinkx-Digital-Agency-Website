'use client';

import { useEffect, useId, useRef } from 'react';
import './showcase-ribbon.css';

const services = [
  'Web Architecture',
  'Technical SEO & AEO',
  'Generative Engine',
  'Paid Social & Scale',
  'Google Ads Supremacy',
  'Full Stack App Dev',
  'Brand Systems & Design',
  'Autonomous AI Agents',
  'Local GMB Dominance',
  'Conversion Architecture',
];

const curve = 'M -6000 650 H -1150 C -850 650 -500 550 -175 365 C 340 65 910 33 1460 132 S 2090 245 2380 245 H 9000';
const firstOffset = 5860;
const unitsPerSecond = 62;

export function Two26ShowcaseSlider() {
  const curveId = useId();
  const section = useRef<HTMLElement>(null);
  const first = useRef<SVGTextPathElement>(null);
  const second = useRef<SVGTextPathElement>(null);
  useEffect(() => {
    const ribbon = section.current;
    const leading = first.current;
    const trailing = second.current;
    if (!ribbon || !leading || !trailing) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let repeatWidth = 0;
    let distance = 0;

    const render = () => {
      leading.setAttribute('startOffset', String(firstOffset - distance));
      trailing.setAttribute('startOffset', String(firstOffset + repeatWidth - distance));
    };

    function advance(time: number) {
      if (lastTime) {
        distance = (distance + Math.min(time - lastTime, 50) * unitsPerSecond / 1000) % repeatWidth;
      }
      lastTime = time;
      render();
      frame = requestAnimationFrame(advance);
    }

    function syncPlayback() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (visible && !motion.matches && !document.hidden && repeatWidth) {
        frame = requestAnimationFrame(advance);
      }
    }

    const measure = () => {
      repeatWidth = leading.getComputedTextLength();
      if (repeatWidth) {
        distance %= repeatWidth;
        render();
      }
      syncPlayback();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(ribbon);
    motion.addEventListener('change', measure);
    document.addEventListener('visibilitychange', syncPlayback);
    document.fonts.addEventListener('loadingdone', measure);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener('change', measure);
      document.removeEventListener('visibilitychange', syncPlayback);
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, []);

  const ribbonText = services.map((service) => (
    <tspan key={service}>
      {service.toUpperCase()}
      {'\u00a0\u00a0'}
      <tspan className="showcase-ribbon__separator">●</tspan>
      {'\u00a0\u00a0'}
    </tspan>
  ));

  return (
    <section ref={section} className="showcase-ribbon" aria-label="Services at a glance">
      <svg className="showcase-ribbon__art" viewBox="0 0 1440 375" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <path id={curveId} d={curve} />
        </defs>
        <use href={`#${curveId}`} className="showcase-ribbon__band" />
        <text className="showcase-ribbon__type" dy=".32em" xmlSpace="preserve">
          <textPath ref={first} href={`#${curveId}`} startOffset={firstOffset}>{ribbonText}</textPath>
        </text>
        <text className="showcase-ribbon__type" dy=".32em" xmlSpace="preserve">
          <textPath ref={second} href={`#${curveId}`} startOffset={14000}>{ribbonText}</textPath>
        </text>
      </svg>

      <ul className="showcase-ribbon__services">
        {services.map((service) => <li key={service}>{service}</li>)}
      </ul>
    </section>
  );
}
