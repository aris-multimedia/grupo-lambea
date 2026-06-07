'use client';

import Image from 'next/image';
import {
  ShoppingCart, Phone, Mail, Package,
  ChevronDown, Anchor, Caravan, Factory, Search, X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  { label: 'Náutica',    sub: 'Barcos y embarcaciones',           Icon: Anchor,  color: '#1E92D8' },
  { label: 'Caravaning', sub: 'Caravanas, campers y furgonetas',  Icon: Caravan, color: '#1370A8' },
  { label: 'Industrial', sub: 'Talleres, camiones y flotas',      Icon: Factory, color: '#0E5784' },
] as const;

function prevent(e: React.SyntheticEvent) {
  e.preventDefault();
}

export function SiteHeader() {
  const [tiendaOpen, setTiendaOpen] = useState(false);
  const tiendaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTiendaOpen, setMobileTiendaOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 60);
  }
  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
  }

  function openDropdown() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTiendaOpen(true);
  }
  function closeDropdown() {
    timeoutRef.current = setTimeout(() => setTiendaOpen(false), 120);
  }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (tiendaRef.current && !tiendaRef.current.contains(e.target as Node)) {
        setTiendaOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    function syncMenuHeight() {
      const el = headerRef.current;
      if (!el) return;
      const headerRect = el.getBoundingClientRect();
      const viewportH = window.visualViewport?.height ?? window.innerHeight;
      const available = Math.max(0, viewportH - headerRect.bottom);
      el.style.setProperty('--mobile-menu-h', `${available}px`);
    }
    syncMenuHeight();
    window.addEventListener('resize', syncMenuHeight);
    window.addEventListener('scroll', syncMenuHeight, { passive: true });
    window.addEventListener('orientationchange', syncMenuHeight);
    window.visualViewport?.addEventListener('resize', syncMenuHeight);
    window.visualViewport?.addEventListener('scroll', syncMenuHeight);
    return () => {
      window.removeEventListener('resize', syncMenuHeight);
      window.removeEventListener('scroll', syncMenuHeight);
      window.removeEventListener('orientationchange', syncMenuHeight);
      window.visualViewport?.removeEventListener('resize', syncMenuHeight);
      window.visualViewport?.removeEventListener('scroll', syncMenuHeight);
    };
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  return (
    <>
      {/* ── TOP BAR ───────────────────────── */}
      <div className="hidden md:block bg-[var(--blue-deep)] text-white text-[13px] py-[9px]">
        <div className="max-w-[1320px] mx-auto px-8 flex justify-between items-center gap-6">
          <div className="flex gap-5 items-center">
            <a
              href="tel:+34637916345"
              className="flex items-center gap-1.5 opacity-90 hover:opacity-100 no-underline text-white"
            >
              <Phone size={13} strokeWidth={2.2} />
              637 916 345
            </a>
            <a
              href="mailto:francisco@grupolambea.com"
              className="flex items-center gap-1.5 opacity-90 hover:opacity-100 no-underline text-white"
            >
              <Mail size={13} strokeWidth={2.2} />
              francisco@grupolambea.com
            </a>
          </div>
          <div className="flex-1 text-center">
            <span className="text-white/80 text-[12px] tracking-wide">
              <strong className="text-[#B3DEF2]">OFERTA 3×2</strong>{' '}
              — ¡Compra 3 unidades de cualquier producto y te regalamos 1!
            </span>
          </div>
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1.5 opacity-90 text-white">
              <Package size={13} strokeWidth={2.2} />
              Envío gratis Península
            </span>
          </div>
        </div>
      </div>

      {/* ── MOBILE PROMO BAR ── */}
      <div
        className="md:hidden text-white text-center text-[11.5px] font-medium py-2"
        style={{ background: 'var(--blue-deep)' }}
      >
        <strong style={{ color: '#B3DEF2' }}>3×2</strong>
        {' '}en toda la tienda · Envío gratis Península
      </div>

      {/* ── MAIN HEADER ── */}
      <header ref={headerRef} className="bg-white/95 backdrop-blur-[12px] border-b border-[var(--line)] sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-3 md:py-[18px] flex items-center justify-between gap-4 md:gap-8">

          <a href="#" onClick={prevent} className="flex items-center gap-3 no-underline flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Grupo Lambea"
              width={160}
              height={56}
              className="h-10 md:h-14 w-auto"
              priority
            />
          </a>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center">
            <a
              href="#"
              onClick={prevent}
              className="no-underline text-[14px] font-semibold px-[18px] py-3 transition-colors rounded-sm"
              style={{ color: 'var(--blue)' }}
            >
              Inicio
            </a>

            <div
              ref={tiendaRef}
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <button
                onClick={() => setTiendaOpen((o) => !o)}
                className="flex items-center gap-1.5 text-[14px] font-semibold px-[18px] py-3 transition-colors hover:text-[var(--blue)] rounded-sm cursor-pointer"
                style={{
                  color: 'var(--ink-700)',
                  background: 'none',
                  border: 'none',
                }}
                aria-expanded={tiendaOpen}
                aria-haspopup="true"
              >
                Tienda
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  style={{ transform: tiendaOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                />
              </button>

              {tiendaOpen && (
                <div
                  className="absolute top-full left-1/2 pt-2 z-50"
                  style={{ transform: 'translateX(-50%)' }}
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <div
                    className="rounded-[var(--r-lg)] bg-white overflow-hidden"
                    style={{ boxShadow: '0 20px 50px rgba(14,87,132,0.18)', border: '1px solid var(--line)', minWidth: 400 }}
                  >
                    <div className="p-2">
                      {CATEGORIES.map(({ label, sub, Icon, color }) => (
                        <a
                          key={label}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setTiendaOpen(false); }}
                          className="flex items-center gap-4 px-4 py-3.5 rounded-[10px] no-underline group transition-colors hover:bg-[var(--blue-soft)]"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${color}18` }}
                          >
                            <Icon size={18} strokeWidth={1.8} style={{ color }} />
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--ink)] text-[14px] leading-none mb-1 group-hover:text-[var(--blue)] transition-colors">
                              {label}
                            </div>
                            <div className="text-[12px] text-[var(--ink-500)] leading-none">{sub}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#"
              onClick={prevent}
              className="text-[var(--ink-700)] no-underline text-[14px] font-semibold px-[18px] py-3 transition-colors hover:text-[var(--blue)] rounded-sm"
            >
              Nosotros
            </a>

            <a
              href="#"
              onClick={prevent}
              className="text-[var(--ink-700)] no-underline text-[14px] font-semibold px-[18px] py-3 transition-colors hover:text-[var(--blue)] rounded-sm"
            >
              Contacto
            </a>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Buscar"
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors cursor-pointer"
            >
              <Search size={18} strokeWidth={1.9} />
            </button>

            <a
              href="#"
              onClick={prevent}
              className="flex items-center gap-2 bg-[var(--blue)] text-white no-underline px-4 md:px-5 py-2 md:py-2.5 rounded-[100px] font-semibold text-[13px] md:text-[14px] transition-colors hover:bg-[var(--blue-dark)]"
              aria-label="Cesta"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Cesta</span>
            </a>

            <button
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-[10px] text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)] cursor-pointer"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              <span
                className="block w-[22px] h-[2px] bg-current rounded-full"
                style={{
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block w-[22px] h-[2px] bg-current rounded-full"
                style={{
                  transition: 'opacity 0.2s ease',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-[22px] h-[2px] bg-current rounded-full"
                style={{
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-white overflow-hidden border-t border-[var(--line)]"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          style={{
            height: mobileOpen ? 'var(--mobile-menu-h)' : 0,
            opacity: mobileOpen ? 1 : 0,
            boxShadow: mobileOpen ? '0 12px 28px rgba(14,87,132,0.12)' : 'none',
            visibility: mobileOpen ? 'visible' : 'hidden',
            transition: mobileOpen
              ? 'height 0.35s ease-out, opacity 0.25s ease-out, visibility 0s'
              : 'height 0.3s ease-in, opacity 0.2s ease-in, visibility 0s 0.3s',
          }}
        >
          <div className="h-full flex flex-col">
            <nav className="flex-1 overflow-y-auto px-5 pt-2" aria-label="Navegación móvil">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                className="flex items-center justify-between no-underline border-b border-[var(--line)] py-6 active:bg-[var(--bg-soft)] -mx-5 px-5 transition-colors"
                style={{ color: 'var(--blue)' }}
              >
                <span className="text-[22px] font-semibold">Inicio</span>
              </a>

              <div className="border-b border-[var(--line)]">
                <button
                  onClick={() => setMobileTiendaOpen((o) => !o)}
                  className="flex items-center justify-between w-full py-6 cursor-pointer active:bg-[var(--bg-soft)] -mx-5 px-5 transition-colors"
                  style={{
                    color: 'var(--ink)',
                    background: 'none',
                    border: 'none',
                  }}
                  aria-expanded={mobileTiendaOpen}
                >
                  <span className="text-[22px] font-semibold">Tienda</span>
                  <ChevronDown
                    size={24}
                    strokeWidth={2}
                    style={{
                      color: 'var(--ink-500)',
                      transform: mobileTiendaOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease-out',
                    }}
                  />
                </button>

                <div
                  style={{
                    maxHeight: mobileTiendaOpen ? '360px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out',
                  }}
                >
                  <div className="pb-4 space-y-1">
                    {CATEGORIES.map(({ label, sub, Icon, color }) => (
                      <a
                        key={label}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                        className="flex items-center gap-4 px-3 py-3.5 rounded-[12px] no-underline transition-colors hover:bg-[var(--blue-soft)] active:bg-[var(--blue-soft)]"
                      >
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}18` }}
                        >
                          <Icon size={20} strokeWidth={1.8} style={{ color }} />
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--ink)] text-[16px] leading-tight">{label}</div>
                          <div className="text-[13px] text-[var(--ink-500)] mt-0.5">{sub}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                className="flex items-center justify-between no-underline border-b border-[var(--line)] py-6 active:bg-[var(--bg-soft)] -mx-5 px-5 transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                <span className="text-[22px] font-semibold">Nosotros</span>
              </a>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                className="flex items-center justify-between no-underline py-6 active:bg-[var(--bg-soft)] -mx-5 px-5 transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                <span className="text-[22px] font-semibold">Contacto</span>
              </a>
            </nav>

            <div
              className="px-5 pt-5 border-t border-[var(--line)] space-y-3.5 bg-[var(--bg-soft)] flex-shrink-0"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
            >
              <a
                href="tel:+34637916345"
                className="flex items-center gap-3 text-[16px] font-medium text-[var(--ink-700)] no-underline hover:text-[var(--blue)] transition-colors"
              >
                <Phone size={18} strokeWidth={2} className="text-[var(--blue)]" />
                637 916 345
              </a>
              <a
                href="mailto:francisco@grupolambea.com"
                className="flex items-center gap-3 text-[14px] text-[var(--ink-500)] no-underline hover:text-[var(--blue)] transition-colors break-all"
              >
                <Mail size={17} strokeWidth={2} className="text-[var(--blue)] shrink-0" />
                francisco@grupolambea.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <button
          type="button"
          aria-label="Cerrar búsqueda"
          onClick={closeSearch}
          className="fixed inset-0 z-[55] bg-black/30 cursor-default"
        />
      )}
      <div
        className="fixed top-0 left-0 right-0 z-[60] bg-white px-4 md:px-8 py-5 md:py-6 border-b border-[var(--line)] shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        style={{
          borderBottomLeftRadius: 'var(--r-lg)',
          borderBottomRightRadius: 'var(--r-lg)',
          transform: searchOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-out',
          visibility: searchOpen ? 'visible' : 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
      >
        <form onSubmit={(e) => { e.preventDefault(); closeSearch(); }} className="max-w-[900px] mx-auto flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search size={18} strokeWidth={1.9} className="absolute left-5 text-[var(--ink-500)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca un producto, fórmula o aplicación…"
              className="w-full pl-13 pr-5 py-3.5 md:py-4 text-[15px] md:text-[16px] bg-[var(--bg-soft)] border-2 border-[var(--line)] rounded-full text-[var(--ink)] focus:bg-white focus:border-[var(--blue)] outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Cerrar"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--ink-700)] hover:bg-[var(--bg-soft)] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </form>
        <div className="max-w-[900px] mx-auto mt-4 flex flex-wrap gap-2">
          {['Náutica', 'Caravaning', 'Industrial', 'Desoxilam', 'Inyeclam diésel'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={closeSearch}
              className="px-4 py-[7px] bg-[var(--blue-soft)] text-[var(--blue-deep)] rounded-full text-[13px] font-medium border-0 hover:bg-[var(--blue)] hover:text-white transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
