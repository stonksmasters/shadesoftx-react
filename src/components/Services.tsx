import { Link } from "react-router-dom";

const services = [
  {
    key: "residential",
    title: "Residential Tinting",
    description:
      "Reduce heat, glare, and UV damage while keeping your home's curb appeal. Lifetime edge-seal warranty available.",
    href: "/residential",
    features: [
      "Energy & UV reduction",
      "Lifetime edge-seal warranty",
      "Discreet, factory-like finish",
    ],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 12l9-7 9 7v7a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-7z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "commercial",
    title: "Commercial Solutions",
    description:
      "Custom solutions for offices, retail, and multi-site properties — energy savings and glare control at scale.",
    href: "/commercial",
    features: [
      "Project scoping & site surveys",
      "Multi-site consistency",
      "Compliance & energy rebates support",
    ],
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 8h.01M12 8h.01M16 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section aria-labelledby="services-title" className="py-16 bg-bg">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="text-center mb-10">
          <h2 id="services-title" className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
            Our Services
          </h2>
          <p className="mt-3 text-md text-muted max-w-2xl mx-auto">
            Professional window films and installation for homes and businesses — protection, comfort, and savings.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <li key={s.key} className="h-full">
              <article
                className="panel group h-full flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-transform transform hover:-translate-y-2 hover:shadow-xl"
                aria-labelledby={`svc-${s.key}-title`}
              >
                <header className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="inline-flex items-center justify-center rounded-xl"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-primary-content)",
                        boxShadow: "0 8px 18px rgba(37,99,235,0.12)",
                      }}
                    >
                      {s.icon}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 id={`svc-${s.key}-title`} className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted max-w-[60ch]">{s.description}</p>
                  </div>
                </header>

                <div className="mt-6">
                  <ul className="grid grid-cols-1 gap-3">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-[var(--color-text)]/90">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold">
                          ✓
                        </span>
                        <span className="text-sm text-[var(--color-text)]/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      to={s.href}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition"
                      aria-label={`Learn more about ${s.title}`}
                    >
                      Learn More
                    </Link>

                    <Link
                      to="/booking"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-xl font-medium text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface)/0.95] transition"
                      aria-label={`Book a ${s.title} estimate`}
                    >
                      Book Estimate
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}