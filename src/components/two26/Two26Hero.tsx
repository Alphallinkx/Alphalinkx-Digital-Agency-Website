'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { MagneticHeading } from '../common/MagneticHeading';
import HeroJourney from '../hero-journey/HeroJourney';

const loopPath = 'M -88 8 C 8 67 180 166 218 320 C 255 463 161 545 59 506 C -38 468 -44 345 30 361 C 117 380 172 538 104 635 C 62 694 5 719 -78 743';
const headlineSize = 'block text-[clamp(32px,6.75vw,120px)] tracking-[-0.04em] leading-[0.89]';
const entranceEase = [0.16, 1, 0.3, 1] as const;

export function Two26Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const inView = useInView(heroRef);

  return (
    <section
      ref={heroRef}
      data-enter
      data-motion-paused={!inView}
      className="two26-hero relative isolate flex w-full flex-col items-center overflow-hidden px-4 pt-[104px] text-center sm:px-8 sm:pt-[124px] lg:pt-[143px]"
    >
      {(['left', 'right'] as const).map((side, index) => (
        <svg
          key={side}
          aria-hidden="true"
          className={`two26-hero-loop two26-hero-loop--${side} pointer-events-none absolute -z-10`}
          viewBox="0 0 255 744"
          fill="none"
        >
          <g className="two26-hero-loop-drift">
            <motion.path
              data-hero-loop
              d={loopPath}
              stroke="#fe5300"
              strokeWidth="24"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 1.7, delay: reduceMotion ? 0 : 0.04 + index * 0.14, ease: entranceEase }}
            />
          </g>
        </svg>
      ))}

      <motion.div
        data-hero-enter
        initial={reduceMotion ? false : { opacity: 0, y: 17 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.82, ease: entranceEase }}
        className="max-w-full"
      >
        <MagneticHeading as="h1" className="text-center">
          <span className={headlineSize}>BE THE <span className="text-[#FF5400]">ALPHA</span></span>
          <span className={headlineSize}>IN YOUR MARKET.</span>
        </MagneticHeading>
      </motion.div>

      <motion.p
        data-hero-enter
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68, delay: 0.15, ease: entranceEase }}
        className="mx-auto mt-[10px] max-w-[680px] px-2 font-sans text-[16px] leading-[1.45] text-[#333333] sm:text-[18px] lg:text-[20px]"
      >
        We engineer high-performance websites, generative AI search visibility, and revenue acquisition engines for brands that refuse to settle.
      </motion.p>

      <HeroJourney />
    </section>
  );
}

export default Two26Hero;
