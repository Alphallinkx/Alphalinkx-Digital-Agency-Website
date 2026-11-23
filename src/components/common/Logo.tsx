'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND } from '@/content/siteContent';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heightClass = {
    sm: 'h-7',
    md: 'h-9 min-[360px]:h-10 sm:h-11 lg:h-12',
    lg: 'h-12',
  }[size];

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5400] transition-transform hover:scale-105 duration-200 ${className}`}
      aria-label="Alphalinkx Home"
    >
      <img
        src={BRAND.logo.url}
        width={BRAND.logo.width}
        height={BRAND.logo.height}
        alt=""
        className={`${heightClass} w-auto object-contain`}
      />
    </Link>
  );
};
