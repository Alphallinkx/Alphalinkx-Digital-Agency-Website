'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { MagneticHeading } from '../common/MagneticHeading';
import { Two26Button } from '../common/Two26Button';
import HeroJourney from '../hero-journey/HeroJourney';

const loopPath = 'M -88 8 C 8 67 180 166 218 320 C 255 463 161 545 59 506 C -38 468 -44 345 30 361 C 117 380 172 538 104 635 C 62 694 5 719 -78 743';
const headlineSize = 'block text-[clamp(32px,6.75vw,120px)] tracking-[-0.04em] leading-[0.89]';
const entranceEase = [0.16, 1, 0.3, 1] as const;

export function Two26Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const inView = useInView(heroRef);
  const [paused, setPaused] = useState(false);

  return (
    <section
      ref={heroRef}
      data-enter
      data-motion-paused={paused || !inView}
      className="two26-hero relative isolate flex w-full flex-col items-center overflow-hidden px-4 pb-10 pt-[104px] text-center sm:px-8 sm:pb-12 sm:pt-[112px] lg:pt-[116px]"
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

      <div className="relative w-full max-w-[1100px]">
        <div className="mb-3 hidden items-center justify-between px-[8%] sm:flex lg:px-[11%]">
          <motion.span
            data-hero-enter
            initial={reduceMotion ? false : { opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: entranceEase }}
            className="-rotate-6 rounded-full bg-black px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white lg:text-[11px]"
          >
            Boutique growth studio
          </motion.span>
          <motion.span
            data-hero-enter
            initial={reduceMotion ? false : { opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.23, ease: entranceEase }}
            className="rotate-[4deg] rounded-full bg-[#ff5400] px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-black lg:text-[11px]"
          >
            Web &amp; AI visibility
          </motion.span>
        </div>
        <motion.div
          data-hero-enter
          initial={reduceMotion ? false : { opacity: 0, y: 17 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: entranceEase }}
        >
          <MagneticHeading as="h1" className="text-center">
            <span className={headlineSize}>BE THE <span className="text-[#FF5400]">ALPHA</span></span>
            <span className={headlineSize}>IN YOUR MARKET.</span>
          </MagneticHeading>
        </motion.div>
      </div>

      <motion.p
        data-hero-enter
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68, delay: 0.15, ease: entranceEase }}
        className="mx-auto mt-5 max-w-[680px] px-2 font-sans text-[16px] leading-[1.45] text-[#333333] sm:mt-6 sm:text-[18px] lg:text-[20px]"
      >
        We engineer high-performance websites, generative AI search visibility, and revenue acquisition engines for brands that refuse to settle.
      </motion.p>

      <motion.div
        data-hero-enter
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68, delay: 0.23, ease: entranceEase }}
        className="relative mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-5"
      >
        <Two26Button to="/contact" variant="black">
          Start a Project
        </Two26Button>
        <Two26Button to="#work" variant="cream">
          See Our Work
        </Two26Button>
        <span className="absolute left-full ml-9 hidden -rotate-[5deg] whitespace-nowrap rounded-full border border-[#DAD1CC] bg-[#FDF8F5] px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-black xl:inline-flex">
          Engineered for scale
        </span>
      </motion.div>

      <div className="relative w-full max-w-[1500px]">
        <HeroJourney paused={paused} />
        <button
          type="button"
          aria-label={paused ? 'Play hero animation' : 'Pause hero animation'}
          className="hero-motion-control absolute bottom-0 right-0 z-10 grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-[#fdf8f5]/90 text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ab3800]"
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

export default Two26Hero;
