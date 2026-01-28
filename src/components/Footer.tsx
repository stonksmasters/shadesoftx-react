import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-screen-xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex-1 min-w-0">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
              <span>SHADES</span>
              <span className="text-[var(--color-accent)]">OF</span>
              <span>TEXAS</span>
            </Link>

            <p className="mt-4 text-sm text-muted max-w-md">
              Professional window films and installation across residential and commercial properties. Protect interiors, save energy.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a aria-label="Facebook" href="#" className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-content)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3V2z" fill="currentColor" />
                </svg>
              </a>

              <a aria-label="Instagram" href="#" className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-[var(--color-accent)] text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/residential" className="text-[var(--color-text)]/90 hover:underline">Residential</Link></li>
                <li><Link to="/commercial" className="text-[var(--color-text)]/90 hover:underline">Commercial</Link></li>
                <li><Link to="/booking" className="text-[var(--color-text)]/90 hover:underline">Book Estimate</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-[var(--color-text)]/90 hover:underline">About</Link></li>
                <li><Link to="/reviews" className="text-[var(--color-text)]/90 hover:underline">Reviews</Link></li>
                <li><Link to="/contact" className="text-[var(--color-text)]/90 hover:underline">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-[var(--color-text)]/90 hover:underline">FAQ</a></li>
                <li><a href="#" className="text-[var(--color-text)]/90 hover:underline">Warranty</a></li>
                <li><a href="#" className="text-[var(--color-text)]/90 hover:underline">Care</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Contact</h4>
              <address className="not-italic text-sm text-muted">
                (800) 555-1234<br />
                hello@shadesoftx.com<br />
                Serving greater Texas
              </address>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm text-muted flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>© {year} Shades of Texas. All rights reserved.</div>
          <div className="text-[var(--color-text)]/80">Built with care • Accessibility-first</div>
        </div>
      </div>
    </footer>
  );
}