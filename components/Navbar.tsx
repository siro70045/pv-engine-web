"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-meridiana-cream/80 backdrop-blur-xl backdrop-saturate-150 border-b border-meridiana-border-light"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-serif text-xl">
          <span className="text-meridiana-yellow">☀</span>
          <span className="text-meridiana-black font-semibold">Meridiana</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          {["Scuole", "Casa", "Aziende", "Magazine", "Metodologia"].map((item) => (
            <li key={item}>
              <a
                href={`/${item.toLowerCase()}`}
                className="text-meridiana-text-secondary hover:text-meridiana-black transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side: lang + CTA */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs text-meridiana-text-tertiary tracking-wider">
            IT · <span className="opacity-50">EN</span>
          </span>
          <a
            href="/simulatore"
            className="bg-meridiana-yellow hover:bg-meridiana-yellow-hover text-meridiana-black font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            Avvia simulatore →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-meridiana-black mb-1.5" />
          <div className="w-6 h-0.5 bg-meridiana-black mb-1.5" />
          <div className="w-6 h-0.5 bg-meridiana-black" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-meridiana-cream backdrop-blur-xl z-40">
          <ul className="flex flex-col gap-6 p-8 text-2xl font-serif">
            {["Scuole", "Casa", "Aziende", "Magazine", "Metodologia"].map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase()}`}
                  className="text-meridiana-black"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
            <li className="pt-6 border-t border-meridiana-border-light">
              <a
                href="/simulatore"
                className="inline-block bg-meridiana-yellow text-meridiana-black font-semibold text-base px-6 py-3 rounded-full"
              >
                Avvia simulatore →
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
