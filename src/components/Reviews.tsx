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

type ReviewsProps = {
  intervalMs?: number;
  pauseAfterMs?: number;
  scrollDurationMs?: number;
};

export default function Reviews({
  intervalMs = 3800,
  pauseAfterMs = 3000,
  scrollDurationMs = 600,
}: ReviewsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // autoplay uses per-card interval
  const autoplayIntervalRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  // smooth scroll raf handle (so we can cancel)
  const smoothRafRef = useRef<number | null>(null);

  // interaction and lifecycle
  const lastInteractionAtRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef<boolean>(false);
  const visibleRef = useRef<boolean>(true);

  // drag state for pointer interactions
  const drag = useRef({ startX: 0, scrollLeft: 0, dragging: false });

  // create extended list: [copy, original, copy]
  const reviews = [...baseReviews];
  const extended = [
    ...reviews.map((r) => ({ ...r, id: `m-${r.id}` })),
    ...reviews,
    ...reviews.map((r) => ({ ...r, id: `p-${r.id}` })),
  ];

  // measured card width (includes gap) and derived values
  const cardWidthRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const itemsCount = reviews.length;

  // active/scroll bookkeeping
  const scrollEndDebounceRef = useRef<number | null>(null);

  // animation lock for preventing input during animation
  const isAnimatingRef = useRef<boolean>(false);
  const [isAnimating, setIsAnimating] = useState(false);
  function setAnimating(v: boolean) {
    isAnimatingRef.current = v;
    setIsAnimating(v);
  }

  // Measure card width and set initial scroll position to the middle set
  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.querySelector<HTMLElement>("[data-review-card]");
      const gap = parseInt(getComputedStyle(track).gap || (getComputedStyle(track) as any).columnGap || "16", 10) || 16;
      const cardWidth = firstCard ? firstCard.clientWidth : Math.min(track.clientWidth * 0.86, 360);
      cardWidthRef.current = cardWidth + gap;
      singleSetWidthRef.current = cardWidthRef.current * itemsCount;

      // Position at middle set (the second chunk)
      requestAnimationFrame(() => {
        if (track) {
          track.scrollLeft = singleSetWidthRef.current;
          updateActiveCard();
        }
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
  }, [itemsCount]);

  // smooth scroll helper (cancellable) with automatic snap disabling and animation lock
  function stopSmoothScroll() {
    if (smoothRafRef.current) {
      cancelAnimationFrame(smoothRafRef.current);
      smoothRafRef.current = null;
    }
    const t = trackRef.current;
    if (t) t.classList.remove("no-snap");
    setAnimating(false);
  }
  function smoothScrollTo(track: HTMLDivElement, targetLeft: number, duration: number, onComplete?: () => void) {
    stopSmoothScroll();
    // lock inputs while animating
    setAnimating(true);

    // temporarily disable browser snapping so animation is smooth
    track.classList.add("no-snap");

    const start = performance.now();
    const from = track.scrollLeft;
    const delta = targetLeft - from;
    if (duration <= 0) {
      track.scrollLeft = targetLeft;
      track.classList.remove("no-snap");
      setAnimating(false);
      onComplete?.();
      return;
    }
    // easeInOutCubic
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const v = ease(t);
      track.scrollLeft = Math.round(from + delta * v);
      if (t < 1) {
        smoothRafRef.current = requestAnimationFrame(step);
      } else {
        smoothRafRef.current = null;
        track.classList.remove("no-snap");
        setAnimating(false);
        onComplete?.();
      }
    };
    smoothRafRef.current = requestAnimationFrame(step);
  }

  // Interval-based autoplay
  useEffect(() => {
    try {
      prefersReducedMotionRef.current = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      prefersReducedMotionRef.current = false;
    }

    function handleVisibility() {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        visibleRef.current = false;
        stopAutoplay();
      } else {
        visibleRef.current = true;
        scheduleResume();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    let io: IntersectionObserver | null = null;
    try {
      if (typeof IntersectionObserver !== "undefined" && trackRef.current) {
        io = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            visibleRef.current = e.isIntersecting;
            if (!e.isIntersecting) stopAutoplay();
            else scheduleResume();
          },
          { threshold: 0.2 }
        );
        if (trackRef.current) io.observe(trackRef.current);
      }
    } catch {}

    startAutoplay();

    return () => {
      stopAutoplay();
      clearResumeTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (io) {
        try {
          io.disconnect();
        } catch {}
      }
      stopSmoothScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, pauseAfterMs, scrollDurationMs]);

  function startAutoplay() {
    if (autoplayIntervalRef.current) return;
    if (prefersReducedMotionRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (!visibleRef.current) return;

    autoplayIntervalRef.current = window.setInterval(() => {
      // don't run autoplay while a programmatic animation is already underway
      if (isAnimatingRef.current) return;
      const last = lastInteractionAtRef.current || 0;
      if (Date.now() - last < pauseAfterMs) return;
      const track = trackRef.current;
      if (!track) return;

      const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
      const single = singleSetWidthRef.current || step * itemsCount;
      const offset = ((track.scrollLeft - single) % single + single) % single;
      const desired = offset + step;
      const targetOffset = ((desired % single) + single) % single;
      const target = single + targetOffset;

      smoothScrollTo(track, target, scrollDurationMs, () => {
        normalizeScrollIfNeeded(track);
        updateActiveCard();
      });
    }, intervalMs) as unknown as number;
  }

  function stopAutoplay() {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function scheduleResume() {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      startAutoplay();
    }, pauseAfterMs);
  }

  // Pause autoplay on user interaction and resume after pauseAfterMs of inactivity.
  // If an animation is running we ignore user inputs (per requirement).
  function pauseForInteraction() {
    // if animating, ignore the interaction entirely
    if (isAnimatingRef.current) return;
    stopAutoplay();
    clearResumeTimer();
    lastInteractionAtRef.current = Date.now();
    stopSmoothScroll();
    const t = trackRef.current;
    if (t) t.classList.remove("no-snap");
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      startAutoplay();
    }, pauseAfterMs);
  }

  // helper to normalize loop when user scrolls into copies (silent rebase)
  function normalizeScrollIfNeeded(track: HTMLDivElement | null) {
    if (!track) return;
    const single = singleSetWidthRef.current;
    if (!single) return;

    const total = track.scrollLeft;
    const min = single * 0.25;
    const max = single * 1.75;
    if (total > min && total < max) return;

    const offset = ((total - single) % single + single) % single;
    const mapped = single + offset;
    if (Math.abs(mapped - total) <= 1) return;
    // silent jump to equivalent position inside central set
    track.scrollLeft = mapped;
  }

  // update which card is visually active (centered) and toggle a class for pop
  function updateActiveCard() {
    const track = trackRef.current;
    if (!track) return;
    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const single = singleSetWidthRef.current || step * itemsCount;
    const offset = ((track.scrollLeft - single) % single + single) % single;
    const centerIndex = Math.round(offset / step);
    const centralStart = itemsCount; // original set starts at this child index
    const targetIndex = centralStart + centerIndex;

    const children = Array.from(track.children) as HTMLElement[];
    children.forEach((el, i) => {
      if (i === targetIndex) el.classList.add("reviews-card-active");
      else el.classList.remove("reviews-card-active");
    });
  }

  // scroll by one card (used by arrow buttons and keyboard)
  function scrollByCard(direction = 1, markInteraction = true) {
    // if animating currently, ignore input to prevent cancel/restart
    if (isAnimatingRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    if (markInteraction) pauseForInteraction();

    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const single = singleSetWidthRef.current || step * itemsCount;
    const offset = ((track.scrollLeft - single) % single + single) % single;
    const desired = offset + direction * step;
    const targetOffset = ((desired % single) + single) % single;
    const target = single + targetOffset;

    if (markInteraction) pauseForInteraction();
    smoothScrollTo(track, target, scrollDurationMs, () => {
      normalizeScrollIfNeeded(track);
      updateActiveCard();
    });
    if (markInteraction) lastInteractionAtRef.current = Date.now();
  }

  function clamp(value: number) {
    const track = trackRef.current;
    if (!track) return value;
    const max = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(max, value));
  }

  // pointer handlers for drag-to-scroll
  function onPointerDown(e: React.PointerEvent) {
    // ignore interactions while animating
    if (isAnimatingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current.dragging = true;
    drag.current.startX = e.clientX;
    drag.current.scrollLeft = track.scrollLeft;
    pauseForInteraction();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (isAnimatingRef.current) return;
    if (!drag.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - drag.current.startX;
    track.scrollLeft = clamp(drag.current.scrollLeft - dx);

    if (scrollEndDebounceRef.current) {
      clearTimeout(scrollEndDebounceRef.current);
    }
    // quick live update while dragging
    scrollEndDebounceRef.current = window.setTimeout(() => {
      scrollEndDebounceRef.current = null;
      updateActiveCard();
    }, 90);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (isAnimatingRef.current) return;
    drag.current.dragging = false;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    const track = trackRef.current;
    if (!track) return;

    // snap to nearest card on pointer up
    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const single = singleSetWidthRef.current || step * itemsCount;
    const offset = ((track.scrollLeft - single) % single + single) % single;
    const targetIndex = Math.round(offset / step);
    const target = single + targetIndex * step;

    smoothScrollTo(track, target, Math.min(scrollDurationMs, 320), () => {
      normalizeScrollIfNeeded(track);
      updateActiveCard();
    });
  }

  function onScroll() {
    if (scrollEndDebounceRef.current) {
      clearTimeout(scrollEndDebounceRef.current);
    }
    scrollEndDebounceRef.current = window.setTimeout(() => {
      scrollEndDebounceRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      normalizeScrollIfNeeded(track);
      updateActiveCard();
    }, 120);
  }

  // pause on user interactions (pointer, wheel, touch, keyboard); reset timer on each action
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function handlePointerDown() {
      // ignore while animating
      if (isAnimatingRef.current) return;
      pauseForInteraction();
    }
    function handleWheel(e: WheelEvent) {
      if (isAnimatingRef.current) return;
      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) pauseForInteraction();
    }
    function handleKey(e: KeyboardEvent) {
      if (isAnimatingRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        pauseForInteraction();
        e.key === "ArrowLeft" ? scrollByCard(-1) : scrollByCard(1);
      }
    }
    function handleTouchStart() {
      if (isAnimatingRef.current) return;
      pauseForInteraction();
    }

    track.addEventListener("pointerdown", handlePointerDown, { passive: true });
    track.addEventListener("wheel", handleWheel, { passive: true });
    track.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("keydown", handleKey);

    // initial active mark
    updateActiveCard();

    return () => {
      track.removeEventListener("pointerdown", handlePointerDown);
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, pauseAfterMs, scrollDurationMs]);

  // ensure cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoplay();
      clearResumeTimer();
      stopSmoothScroll();
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
                // clicks ignored if animating (also button is disabled)
                if (isAnimatingRef.current) return;
                pauseForInteraction();
                scrollByCard(-1);
              }}
              disabled={isAnimating}
              aria-disabled={isAnimating}
              className={`hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-sm hover:shadow-md transition ${isAnimating ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => {
                if (isAnimatingRef.current) return;
                pauseForInteraction();
                scrollByCard(1);
              }}
              disabled={isAnimating}
              aria-disabled={isAnimating}
              className={`hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition ${isAnimating ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              const track = trackRef.current;
              if (track) {
                normalizeScrollIfNeeded(track);
                updateActiveCard();
              }
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
                className="snap-center reviews-card flex-shrink-0 rounded-2xl p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
                style={{
                  width: "clamp(260px, 75vw, 360px)",
                  minHeight: 220,
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