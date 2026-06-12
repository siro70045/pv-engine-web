"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MeridianaLogo from "@/components/MeridianaLogo";
import logoStyles from "@/components/MeridianaLogo.module.css";

interface NavbarProps {
  active?: "scuole" | "casa" | "aziende" | "magazine" | "metodologia";
}

export default function Navbar({ active }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Scuole", href: "/scuole", id: "scuole" },
    { label: "Casa", href: "/casa", id: "casa" },
    { label: "Aziende", href: "/aziende", id: "aziende" },
    { label: "Magazine", href: "/magazine", id: "magazine" },
    { label: "Metodologia", href: "/metodologia", id: "metodologia" },
  ] as const;

  // Lock background scroll while the mobile menu is open. Cleanup always
  // restores overflow so a navigation/unmount mid-open leaves no residue.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-meridiana-cream/25 backdrop-blur-2xl backdrop-saturate-150 border-b border-meridiana-border-light/50">
        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo + wordmark — single Link. Hover lifts the whole
              brand (scale 1.10, slightly under the menu's 1.12 to keep
              it anchored/editorial) and triggers the ray sway via the
              .logoGroup hover-root (see MeridianaLogo.module.css). */}
          <Link
            href="/"
            className={`flex items-center gap-2.5 font-serif text-xl transition-all duration-200 ease-out hover:scale-[1.10] ${logoStyles.logoGroup}`}
          >
            <MeridianaLogo size={28} />
            <span className="text-meridiana-black font-semibold">Meridiana</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`inline-block transition-all duration-200 ease-out pb-1 hover:scale-[1.12] hover:text-meridiana-yellow ${
                    active === item.id
                      ? "text-meridiana-black border-b-2 border-meridiana-yellow"
                      : "text-meridiana-text-secondary"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right: lang switcher */}
          <div className="hidden md:flex items-center gap-5">
            <span className="text-xs text-meridiana-text-tertiary tracking-wider">
              <span className="text-meridiana-text-secondary">IT</span> · <span className="opacity-50">EN</span>
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <div className="w-6 h-0.5 bg-meridiana-black mb-1.5" />
            <div className="w-6 h-0.5 bg-meridiana-black mb-1.5" />
            <div className="w-6 h-0.5 bg-meridiana-black" />
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay — rendered OUTSIDE <header> on purpose.
          The header has backdrop-filter (backdrop-blur), which would make
          it the containing block for a `fixed` descendant and collapse the
          panel to zero height. As a sibling here, `fixed` resolves against
          the viewport. Sits below the navbar (top-16) and under the header
          z-50 so the hamburger stays tappable to toggle/close. */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40">
          {/* Backdrop — tap to close */}
          <button
            type="button"
            aria-label="Chiudi menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 w-full bg-meridiana-black/30"
          />

          {/* Panel — opaque cream, content-height, above the backdrop */}
          <div className="relative bg-meridiana-cream shadow-lg">
            <ul className="flex flex-col gap-2 p-8 text-2xl font-serif">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="block py-2 text-meridiana-black transition-colors hover:text-meridiana-yellow active:text-meridiana-yellow"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
