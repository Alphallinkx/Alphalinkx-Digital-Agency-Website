'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Two26ButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'black' | 'orange' | 'cream';
  className?: string;
  disabled?: boolean;
}

export const Two26Button: React.FC<Two26ButtonProps> = ({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'black',
  className = '',
  disabled = false,
}) => {
  const destination = to || href;

  const themeClasses = {
    black: 'bg-[#000000] text-white border border-[#000000]',
    orange: 'bg-[#FF5400] text-white border border-[#FF5400]',
    cream: 'bg-[#FDF8F5] text-[#000000] border border-[#DAD1CC]',
  };

  const badgeBg = {
    black: 'bg-[#FF5400] text-white',
    orange: 'bg-[#000000] text-white',
    cream: 'bg-[#000000] text-white',
  };

  const baseClasses = `site-cta relative inline-flex items-center justify-between gap-3 sm:gap-4 pl-5 sm:pl-6 pr-1.5 sm:pr-2 py-1.5 sm:py-2 rounded-full font-mono text-[13px] sm:text-[14px] font-bold tracking-[0.04em] uppercase overflow-hidden cursor-pointer select-none shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ad3300] ${themeClasses[variant]} ${className}`;

  const innerContent = (
    <>
      <span className="relative z-10 whitespace-nowrap">{children}</span>

      {/* Circular Arrow Badge */}
      <span
        aria-hidden="true"
        className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${badgeBg[variant]}`}
      >
        <ArrowUpRight data-cta-arrow className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </span>
    </>
  );

  if (destination) {
    if (destination.startsWith('http') || destination.startsWith('mailto:') || destination.startsWith('tel:')) {
      return (
        <a
          href={destination}
          onClick={onClick}
          className={baseClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {innerContent}
        </a>
      );
    }

    return (
      <Link
        href={destination}
        onClick={onClick}
        className={baseClasses}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {innerContent}
    </button>
  );
};

export default Two26Button;
