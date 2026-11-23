'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../content/siteContent';
import { Two26Button } from '../common/Two26Button';
import { Logo } from '../common/Logo';

const navigation = [
  { title: 'Work', href: '/#work' },
  { title: 'Services' },
  { title: 'About', href: '/#about' },
  { title: 'Process', href: '/about#process' },
  { title: 'FAQ', href: '/#faq' },
];

const navLink = 'inline-flex min-h-11 items-center rounded-md font-display text-[15px] font-bold tracking-tight text-black transition-colors hover:text-[#ad3300] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ad3300] xl:text-base';
const actionButton = 'min-h-11 !gap-1.5 !py-1 !pl-2.5 lg:!gap-2 lg:!pl-3 !pr-1.5 !font-display !text-[13px] !normal-case !tracking-tight xl:!pl-4 xl:!text-[14px]';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeMenus = () => {
      setIsMegaMenuOpen(false);
      setIsMobileMenuOpen(false);
    };
    desktop.addEventListener('change', closeMenus);
    return () => desktop.removeEventListener('change', closeMenus);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen && !isMegaMenuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, isMegaMenuOpen]);

  return (
    <>
      <header className="site-header fixed inset-x-0 top-0 z-50" data-scrolled={isScrolled} data-home={pathname === '/'}>
        <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 sm:px-5 lg:px-8 xl:px-10">
          <nav aria-label="Main navigation" className="hidden items-center gap-3 lg:flex xl:gap-5">
            {navigation.map(({ title, href }) => (
              href ? (
                <Link className={navLink} key={title} href={href} onClick={() => setIsMegaMenuOpen(false)}>
                  {title}
                </Link>
              ) : (
                <button
                  type="button"
                  key={title}
                  className={`${navLink} inline-flex items-center gap-1`}
                  aria-expanded={isMegaMenuOpen}
                  aria-controls="services-menu"
                  onClick={() => setIsMegaMenuOpen((open) => !open)}
                >
                  {title}
                  <ChevronDown size={14} aria-hidden="true" className={isMegaMenuOpen ? 'rotate-180' : ''} />
                </button>
              )
            ))}
          </nav>

          <button
            type="button"
            className="grid size-11 place-items-center justify-self-start rounded-full text-black hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ab3800] lg:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
          </button>

          <Logo className="justify-self-center" />

          <div className="hidden items-center justify-self-end gap-2 md:flex xl:gap-3">
            <Two26Button to="/contact" variant="black" className={actionButton}>Start a Project</Two26Button>
            <Two26Button to="/client-portal" variant="cream" className={actionButton}>Client Portal</Two26Button>
          </div>
        </div>
      </header>

      {/* Services Mega Menu Overlay (Desktop) */}
      {isMegaMenuOpen && (
        <div
          id="services-menu"
          aria-label="Services menu"
          className="site-header-menu fixed inset-0 z-40 hidden overflow-y-auto rounded-b-3xl border-b border-[#DAD1CC] bg-[#f7ede7] shadow-xl lg:block"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#DAD1CC]">
              <div>
                <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#FF5400]">
                  // CORE CAPABILITIES
                </p>
                <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-[#000000] mt-1">
                  Engineered for Search, AI, and Revenue Conversion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(false)}
                className="font-mono text-[12px] font-medium text-[#333333] hover:text-[#000000] uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full border border-[#DAD1CC] bg-[#FDF8F5] hover:bg-[#F3EEEB] transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {SERVICE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services/${cat.slug}`}
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="group flex flex-col p-5 rounded-2xl bg-[#FDF8F5] border border-[#DAD1CC] hover:border-[#FF5400] hover:bg-[#F3EEEB] transition-all duration-200 shadow-sm"
                >
                  <span className="font-mono text-[12px] font-bold text-[#FF5400] tracking-[0.18em]">
                    {cat.number}
                  </span>
                  <h4 className="font-display font-bold text-base text-[#000000] tracking-[-0.01em] mt-2 group-hover:text-[#FF5400] transition-colors">
                    {cat.name}
                  </h4>
                  <p className="font-sans text-[15px] text-[#333333] mt-2 line-clamp-2 leading-[1.6]">
                    {cat.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#DAD1CC]/60 flex flex-wrap gap-1.5">
                    {cat.chips.slice(0, 3).map((chip) => (
                      <span
                        key={chip}
                        className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-[#555555] bg-[#ECEAE5] px-2 py-0.5 rounded"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-[#FDF8F5] border border-[#DAD1CC] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#FF5400] uppercase tracking-[0.18em]">
                  Need a full-stack growth retainer?
                </span>
                <p className="font-sans text-[15px] sm:text-[16px] text-[#333333] mt-1 leading-[1.6]">
                  We unite web engineering, AI answer optimization, and paid acquisition into one compounding machine.
                </p>
              </div>
              <Two26Button
                to="/contact"
                variant="black"
                onClick={() => setIsMegaMenuOpen(false)}
              >
                Request Growth Audit
              </Two26Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="site-header-menu fixed inset-0 z-40 flex flex-col justify-between gap-8 overflow-y-auto bg-[#f7ede7] px-6 pb-8 pt-6 sm:px-8 lg:hidden"
        >
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[12px] font-bold text-[#FF5400] tracking-[0.18em] uppercase">
              // ALPHALINKX MENU
            </span>

            <a
              href="/#work"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-4xl font-extrabold text-[#000000] hover:text-[#FF5400] tracking-[-0.02em] transition-colors"
            >
              Work
            </a>

            <div className="flex flex-col gap-3 py-2 border-y border-[#DAD1CC]">
              <span className="font-mono text-[12px] font-medium text-[#555555] tracking-[0.18em] uppercase">
                Services:
              </span>
              {SERVICE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-display text-xl text-[#000000] hover:text-[#FF5400] pl-3 flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <span className="font-mono text-[12px] font-bold text-[#FF5400] tracking-[0.18em]">{cat.number}</span>
                </Link>
              ))}
            </div>

            <a
              href="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-4xl font-extrabold text-[#000000] hover:text-[#FF5400] tracking-[-0.02em] transition-colors"
            >
              About
            </a>

            <a
              href="/about#process"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-4xl font-extrabold text-[#000000] hover:text-[#FF5400] tracking-[-0.02em] transition-colors"
            >
              Process
            </a>

            <a
              href="/#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-display text-4xl font-extrabold text-[#000000] hover:text-[#FF5400] tracking-[-0.02em] transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#DAD1CC] pt-6">
            <div className="grid gap-3 md:hidden">
              <Two26Button to="/contact" variant="black" onClick={() => setIsMobileMenuOpen(false)} className={actionButton}>Start a Project</Two26Button>
              <Two26Button to="/client-portal" variant="cream" onClick={() => setIsMobileMenuOpen(false)} className={actionButton}>Client Portal</Two26Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://x.com/alphalinkx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#555555] hover:text-[#FF5400] hover:bg-black/5 active:scale-95 transition-all"
                aria-label="X (Twitter)"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/alphalinkx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#555555] hover:text-[#FF5400] hover:bg-black/5 active:scale-95 transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/alphalinkx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#555555] hover:text-[#FF5400] hover:bg-black/5 active:scale-95 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://github.com/alphalinkx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#555555] hover:text-[#FF5400] hover:bg-black/5 active:scale-95 transition-all"
                aria-label="GitHub"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
