// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Escape + scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    setTimeout(() => firstLinkRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Click outside (fixed)
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        toggleBtnRef.current && !toggleBtnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Announcement bar */}
      <div className="bg-[var(--color-accent)/10] text-[var(--color-text)] text-sm font-medium py-2 text-center">
        Don’t see your area?{" "}
        <a
          href="#contact"
          className="underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors"
        >
          Ask us.
        </a>
      </div>

      {/* Main nav */}
      <nav className="backdrop-blur-md bg-[var(--color-bg)/80] border-b border-[var(--color-border)] h-[72px]">
        <div className="mx-auto max-w-screen-xl h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 font-semibold text-lg tracking-tight text-[var(--color-text)]"
          >
            <span>SHADES</span>
            <span className="text-[var(--color-accent)]">OF</span>
            <span>TEXAS</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm">
            {[
              ["Residential", "/residential"],
              ["Commercial", "/commercial"],
              ["Reviews", "/reviews"],
            ].map(([label, href], i) => (
              <li key={href}>
                <Link
                  to={href}
                  className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-200"
                  ref={i === 0 ? firstLinkRef : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}

            <li>
              <Link
                to="/booking"
                className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-content)] hover:opacity-90 transition"
              >
                Get Estimate
              </Link>
            </li>

            <li>
              <ThemeToggle />
            </li>
          </ul>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2 relative">
            <ThemeToggle />
            <button
              ref={toggleBtnRef}
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)] transition focus:outline-none"
            >
              {!open ? (
                <svg width="24" height="24" fill="none">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          ref={panelRef}
          className={`md:hidden absolute inset-x-0 top-[72px] bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-md overflow-hidden transition-all duration-300 ease-out transform origin-top ${
            open ? "max-h-screen opacity-100 scale-100" : "max-h-0 opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {[
              ["Residential", "/residential"],
              ["Commercial", "/commercial"],
              ["Reviews", "/reviews"],
            ].map(([label, href], i) => (
              <li key={href}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={href}
                  onClick={() => setOpen(false)}
                  className="block w-full px-6 py-4 text-lg font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
                >
                  {label}
                </Link>
              </li>
            ))}

            <li className="px-6 py-4">
              <Link
                to="/booking"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-[var(--color-primary-content)] hover:opacity-90 transition"
              >
                Get Free Estimate
              </Link>
            </li>

            <li className="px-6 py-4 flex justify-center">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
