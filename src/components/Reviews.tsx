import { useEffect, useRef } from "react";
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
  const trackRef = useRef<HTMLDivElement | null>(null);

  // RAF autoplay
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  // drag state
  const drag = useRef({
    startX: 0,
    lastX: 0,
    scrollLeft: 0,
    dragging: false,
  });

  const reviews = [...baseReviews];
  const extended = [...reviews.map((r) => ({ ...r, id: `m-${r.id}` })), ...reviews, ...reviews.map((r) => ({ ...r, id: `p-${r.id}` }))];

  const cardWidthRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const itemsCount = reviews.length;

  // tuning
  const speedPxPerSec = 70;
  const pauseAfterMs = 3000;

  // manual action rate limit (arrows / keys)
  const lastManualActionRef = useRef<number>(0);
  const MANUAL_ACTION_MIN_MS = 350;

  // swipe tuning
  const SWIPE_THRESHOLD = 10; // px - movement must exceed this to be considered a swipe
  const MAX_MOVE_PER_EVENT = 240; // px limit per move event to avoid huge jumps

  // measure & position center copy
  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.querySelector<HTMLElement>("[data-review-card]");
      const gap = parseInt(getComputedStyle(track).gap || getComputedStyle(track).columnGap || "16", 10) || 16;
      const cardWidth = firstCard ? firstCard.clientWidth : Math.min(track.clientWidth * 0.86, 360);
      cardWidthRef.current = cardWidth + gap;
      singleSetWidthRef.current = cardWidthRef.current * itemsCount;

      requestAnimationFrame(() => {
        if (track) track.scrollLeft = singleSetWidthRef.current;
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay lifecycle
  useEffect(() => {
    startAutoplay();
    return () => {
      stopAutoplay();
      clearResumeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAutoplay() {
    if (rafRef.current) return;
    lastFrameRef.current = performance.now();
    const loop = (now: number) => {
      const track = trackRef.current;
      if (!track) {
        rafRef.current = null;
        return;
      }
      const last = lastFrameRef.current ?? now;
      const dt = Math.min(40, Math.max(8, now - last));
      lastFrameRef.current = now;

      const dx = (speedPxPerSec * dt) / 1000;
      track.scrollLeft = track.scrollLeft + dx;
      normalizeScrollIfNeeded(track);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  function stopAutoplay() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastFrameRef.current = null;
  }

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  // Called when an explicit interaction should pause autoplay (swipe end or arrow/key/button).
  function pauseForInteraction() {
    stopAutoplay();
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      lastFrameRef.current = performance.now();
      startAutoplay();
    }, pauseAfterMs);
  }

  // Robust normalization: map any scrollLeft into the middle copy while preserving offset
  function normalizeScrollIfNeeded(track: HTMLDivElement) {
    const single = singleSetWidthRef.current;
    if (!single) return;
    const total = track.scrollLeft;
    // if we're within middle range, nothing to do
    const min = single * 0.5;
    const max = single * 1.5;
    if (total > min && total < max) return;

    // compute offset modulo single and place into middle copy
    const offset = ((total - single) % single + single) % single;
    track.scrollLeft = single + offset;
  }

  function clamp(value: number) {
    const track = trackRef.current;
    if (!track) return value;
    const max = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(max, value));
  }

  // scroll by one card (arrow buttons / keyboard)
  function scrollByCard(direction = 1) {
    const now = Date.now();
    if (now - lastManualActionRef.current < MANUAL_ACTION_MIN_MS) return; // rate limit
    lastManualActionRef.current = now;

    const track = trackRef.current;
    if (!track) return;
    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const left = clamp(track.scrollLeft + direction * step);
    // explicit interaction -> pause & schedule resume
    pauseForInteraction();
    track.scrollTo({ left, behavior: "smooth" });
  }

  // Pointer (drag) handlers
  function onPointerDown(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    drag.current.dragging = true;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.scrollLeft = track.scrollLeft;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    // Do not pause autoplay here; we only pause when the user finishes a swipe that actually moved.
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;

    // incremental movement since last event — this avoids using an absolute baseline and allows a smooth drag
    const rawMove = e.clientX - drag.current.lastX;
    // limit per-event move to prevent huge jumps when device reports large deltas
    const move = Math.max(-MAX_MOVE_PER_EVENT, Math.min(MAX_MOVE_PER_EVENT, rawMove));

    // user moved pointer to the right (positive move) -> we should scroll left (drag behavior)
    track.scrollLeft = clamp(track.scrollLeft - move);

    drag.current.lastX = e.clientX;
  }

  function onPointerUp(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    // total displacement from down -> up
    const totalMoved = Math.abs(drag.current.startX - drag.current.lastX);
    drag.current.dragging = false;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}

    normalizeScrollIfNeeded(track);

    // Only treat as an explicit interaction (pause/resume) if user actually swiped beyond threshold
    if (totalMoved > SWIPE_THRESHOLD) {
      pauseForInteraction();
    }
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    normalizeScrollIfNeeded(track);
  }

  // Keyboard: only act when track is focused
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const track = trackRef.current;
      if (!track) return;
      if (document.activeElement === track) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollByCard(-1); // scrollByCard handles pause + rate-limit
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollByCard(1);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoplay();
      clearResumeTimer();
    };
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
                scrollByCard(1);
              }}
              className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* autoplay button removed per request - autoplay always on by default */}
          </div>
        </div>

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
              const track = trackRef.current;
              if (track) normalizeScrollIfNeeded(track);
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

        <div className="mt-4 text-center text-xs text-muted">Swipe to browse reviews • Use arrows on desktop</div>
      </div>
    </section>
  );
}