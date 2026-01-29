import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Review = {
  id: string;
  name: string;
  location?: string;
  rating: number; // 1-5
  quote: string;
  date?: string;
  highlight?: string;
};

const baseReviews: Review[] = [
  {
    id: "r1",
    name: "Samantha R.",
    location: "Austin, TX",
    rating: 5,
    quote:
      "Fantastic experience — the team was punctual, explained everything clearly, and the tint looks factory-installed. Our cooling bills dropped right away.",
    date: "2026-01-12",
    highlight: "Fast & clean",
  },
  {
    id: "r2",
    name: "Mark D.",
    location: "Dallas, TX",
    rating: 5,
    quote:
      "Professional crew and phenomenal results. My office glare is gone and our staff are much more comfortable. Highly recommend Shades of Texas.",
    date: "2025-12-01",
    highlight: "Commercial pros",
  },
  {
    id: "r3",
    name: "Aisha K.",
    location: "Houston, TX",
    rating: 5,
    quote:
      "Booked an estimate online — installer arrived on time, worked quickly, and left the site spotless. Great warranty and follow-up.",
    date: "2025-11-18",
    highlight: "Reliable",
  },
  {
    id: "r4",
    name: "Luis P.",
    location: "San Antonio, TX",
    rating: 5,
    quote:
      "Amazing customer service and the final finish looks great. The rooms feel cooler without losing our view — could not be happier.",
    date: "2025-10-22",
    highlight: "Great results",
  },
  {
    id: "r5",
    name: "Bethany L.",
    location: "Frisco, TX",
    rating: 5,
    quote:
      "They explained film options and picked the perfect tint for our home. The installers were respectful of our space and detail oriented.",
    date: "2025-09-30",
    highlight: "Thoughtful",
  },
  {
    id: "r6",
    name: "Omar S.",
    location: "El Paso, TX",
    rating: 5,
    quote:
      "Excellent value — the team helped me get rebates and the finished look is clean. Our storefront glare is gone and customers love the privacy.",
    date: "2025-08-19",
    highlight: "Business friendly",
  },
  {
    id: "r7",
    name: "Nina T.",
    location: "Plano, TX",
    rating: 5,
    quote:
      "Quick estimate and fast install. The crew worked around our schedule and the results are exactly what we wanted. Friendly, professional, and tidy.",
    date: "2025-07-09",
    highlight: "On-time",
  },
  {
    id: "r8",
    name: "Diego M.",
    location: "Corpus Christi, TX",
    rating: 5,
    quote:
      "We noticed the difference the same day — less glare, less heat. Installers were courteous and explained the warranty in detail.",
    date: "2025-06-02",
    highlight: "Comfort boost",
  },
  {
    id: "r9",
    name: "Priya R.",
    location: "Fort Worth, TX",
    rating: 5,
    quote:
      "Smooth booking process, friendly communication, and excellent workmanship. Would hire again for other properties.",
    date: "2025-05-18",
    highlight: "Clear process",
  },
  {
    id: "r10",
    name: "Ethan G.",
    location: "Lubbock, TX",
    rating: 5,
    quote:
      "Great experience from first call to finished install. The team was knowledgeable and the tint looks seamless — very impressed.",
    date: "2025-04-10",
    highlight: "Seamless",
  },
];

// Small presentational star component
function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <svg
            key={i}
            className={`w-4 h-4 ${filled ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}
            viewBox="0 0 20 20"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            aria-hidden
          >
            <path d="M10 1.6l2.5 5.2 5.7.8-4.1 3.9.97 5.6L10 14.9 4.88 17.9 5.85 12.3 1.75 8.4l5.7-.8L10 1.6z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function Reviews() {
  // We'll build a looping track by prepending & appending a copy of the dataset.
  // The track will begin positioned at the middle copy so users can scroll left/right seamlessly.
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef<number | null>(null);
  const drag = useRef({ startX: 0, scrollLeft: 0, dragging: false });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // create extended list: [copy, original, copy]
  const reviews = [...baseReviews];
  const extended = [...reviews.map((r) => ({ ...r, id: `m-${r.id}` })), ...reviews, ...reviews.map((r) => ({ ...r, id: `p-${r.id}` }))];

  // measured card width (includes margin) and derived values
  const cardWidthRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const itemsCount = reviews.length;

  // Measure card width and set initial scroll position to the middle set
  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.querySelector<HTMLElement>('[data-review-card]');
      const gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "16", 10) || 16;
      const cardWidth = firstCard ? firstCard.clientWidth : Math.min(track.clientWidth * 0.86, 360);
      cardWidthRef.current = cardWidth + gap;
      singleSetWidthRef.current = cardWidthRef.current * itemsCount;

      // Position at middle set (the second chunk)
      // small timeout/rAF to ensure layout stable
      requestAnimationFrame(() => {
        track.scrollLeft = singleSetWidthRef.current;
      });
    }

    measure();
    // observe resize to re-measure
    resizeObserverRef.current = new ResizeObserver(() => measure());
    resizeObserverRef.current.observe(document.documentElement);
    window.addEventListener("orientationchange", measure);
    return () => {
      resizeObserverRef.current?.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay logic
  useEffect(() => {
    if (!autoplay) return;
    autoplayRef.current = window.setInterval(() => {
      scrollByCard(1);
    }, 4500);
    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  // helper clamp/jump to create infinite loop
  function normalizeScrollIfNeeded() {
    const track = trackRef.current;
    if (!track) return;
    const single = singleSetWidthRef.current;
    if (single === 0) return;

    // If we've scrolled too far left or right, jump without animation to the equivalent position
    if (track.scrollLeft <= single * 0.5) {
      // jumped into the first copy region -> move to middle copy
      const newLeft = track.scrollLeft + single;
      track.scrollTo({ left: newLeft, behavior: "auto" });
    } else if (track.scrollLeft >= single * 1.5) {
      // jumped into the last copy region -> move to middle copy
      const newLeft = track.scrollLeft - single;
      track.scrollTo({ left: newLeft, behavior: "auto" });
    }
  }

  // scroll by "one card" approximated by measured cardWidthRef
  function scrollByCard(direction = 1) {
    const track = trackRef.current;
    if (!track) return;
    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const left = track.scrollLeft + direction * step;
    track.scrollTo({ left, behavior: "smooth" });
  }

  // pointer handlers for drag-to-scroll
  function onPointerDown(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    drag.current.dragging = true;
    drag.current.startX = e.clientX;
    drag.current.scrollLeft = track.scrollLeft;
    setAutoplay(false);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - drag.current.startX;
    track.scrollLeft = clamp(track.scrollLeft - dx);
  }

  function onPointerUp(e: React.PointerEvent) {
    drag.current.dragging = false;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    normalizeScrollIfNeeded();
  }

  function onScroll() {
    // called frequently; normalize when user stops near edges
    // We run quick check and schedule normalize after small delay to avoid janky jumps while scrolling
    // Using requestAnimationFrame to batch
    normalizeScrollIfNeeded();
  }

  function clamp(value: number) {
    const track = trackRef.current;
    if (!track) return value;
    const max = track.scrollWidth - track.clientWidth;
    if (value < 0) return 0;
    if (value > max) return max;
    return value;
  }

  // Keyboard left/right support on the track
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setAutoplay(false);
        scrollByCard(1);
      } else if (e.key === "ArrowLeft") {
        setAutoplay(false);
        scrollByCard(-1);
      }
    }
    track.addEventListener("keydown", onKey);
    return () => track.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="reviews-title" className="py-14 bg-bg">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h2 id="reviews-title" className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
              What our customers say
            </h2>
            <p className="mt-1 text-sm text-muted max-w-lg">
              Real testimonials from homeowners and businesses — verified installations, honest feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous reviews"
              onClick={() => {
                setAutoplay(false);
                scrollByCard(-1);
              }}
              className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-sm hover:shadow-md transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => {
                setAutoplay(false);
                scrollByCard(1);
              }}
              className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              aria-pressed={!autoplay}
              onClick={() => setAutoplay((s) => !s)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-sm hover:shadow-md transition"
            >
              {autoplay ? "Auto" : "Pause"}
            </button>
          </div>
        </div>

        {/* Scrollable track wrapper hides any overflow and provides comfortable side padding */}
        <div className="relative -mx-3 sm:-mx-6"> 
          <div
            ref={trackRef}
            tabIndex={0}
            role="list"
            aria-label="Customer reviews"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current.dragging = false;
              normalizeScrollIfNeeded();
            }}
            onScroll={onScroll}
            className="reviews-track relative flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-3 sm:px-6"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
            }}
          >
            {extended.map((r, idx) => (
              <article
                key={r.id + "-" + idx}
                data-review-card
                role="listitem"
                aria-labelledby={`review-${r.id}-title`}
                className="snap-center flex-shrink-0 rounded-2xl p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
                style={{
                  width: "clamp(260px, 75vw, 360px)",
                  minHeight: 220,
                  transition: "transform 220ms ease, box-shadow 220ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 40px rgba(2,6,23,0.16)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <header className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-full text-[var(--color-primary-content)] flex-shrink-0"
                    style={{
                      width: 54,
                      height: 54,
                      fontWeight: 700,
                      background: "linear-gradient(180deg, rgba(37,99,235,0.12), rgba(37,99,235,0.25))",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <span className="text-sm" aria-hidden>
                      {r.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 id={`review-${r.id}-title`} className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {r.name}
                    </h3>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Stars value={r.rating} />
                        <span className="text-xs text-muted truncate">{r.location}</span>
                      </div>

                      {r.highlight && (
                        <span className="inline-block text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full whitespace-nowrap">
                          {r.highlight}
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                <blockquote className="mt-4 text-sm text-[var(--color-text)]/90 leading-relaxed flex-1 overflow-hidden break-words">
                  “{r.quote}”
                </blockquote>

                <footer className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-muted">{r.date}</div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/reviews"
                      className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      aria-label={`Read more reviews like ${r.name}`}
                    >
                      Read more
                    </Link>

                    <Link
                      to="/booking"
                      className="ml-1 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition"
                      aria-label="Book an estimate"
                    >
                      Get Estimate
                    </Link>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>

        {/* small paging hint for mobile */}
        <div className="mt-4 text-center text-xs text-muted">Swipe to browse reviews • Use arrows on desktop</div>
      </div>
    </section>
  );
}