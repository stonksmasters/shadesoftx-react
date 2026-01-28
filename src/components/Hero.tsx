import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const [active, setActive] = useState<"residential" | "commercial" | null>(null);

  const lanes = [
    {
      key: "residential",
      title: "Residential",
      badge: "For Your Home",
      text: "Residential solutions for home owners.",
      btnText: "Home Tinting Solutions",
      href: "/residential",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
    },
    {
      key: "commercial",
      title: "Commercial",
      badge: "For Your Business",
      text: "Professional solutions for offices, retail, and commercial properties.",
      btnText: "Commercial Solutions",
      href: "/commercial",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    },
  ] as const;

  return (
    <section className="min-h-screen w-full bg-[var(--color-bg)]">
      <div className="flex flex-col md:flex-row min-h-screen">
        {lanes.map((lane) => {
          const isActive = active === lane.key;
          const laneStyle: React.CSSProperties = {
            flex: isActive ? 1.6 : 1,
            transition: "flex 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundImage: `url('${lane.img}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };

          return (
            <div
              key={lane.key}
              onMouseEnter={() => setActive(lane.key)}
              onMouseLeave={() => setActive(null)}
              className="relative flex-1 flex items-center justify-center p-6 md:p-16 cursor-pointer h-[62vh] md:h-auto md:min-h-[100vh]"
              style={laneStyle}
              aria-labelledby={`hero-${lane.key}-title`}
            >
              {/* Theme-aware overlay from index.css */}
              <div className="overlay" aria-hidden />

              {/* Content panel uses z-index to sit above overlay */}
              <div className="relative z-20 max-w-md mx-auto text-center">
                <span className="text-on-image font-extrabold uppercase tracking-wider text-sm mb-4 inline-block">
                  {lane.badge}
                </span>

                <h2
                  id={`hero-${lane.key}-title`}
                  className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight hero-heading uppercase"
                >
                  {lane.title}
                </h2>

                <p className="mt-4 text-lg md:text-xl hero-subtext max-w-xl mx-auto">
                  {lane.text}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to={lane.href}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-md font-extrabold text-sm transition transform hover:-translate-y-1 bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-md"
                    aria-label={lane.btnText}
                  >
                    {lane.btnText}
                  </Link>

                  <Link
                    to={lane.href}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-sm border-2 border-[rgba(255,255,255,0.9)] text-[var(--color-primary-content)] bg-[rgba(0,0,0,0.08)] hover:opacity-95 transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}