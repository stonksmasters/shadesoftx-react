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
  { id: "r1", name: "Samantha R.", location: "Austin, TX", rating: 5, quote: "Fantastic experience — the team was punctual, explained everything clearly, and the tint looks factory-installed. Our cooling bills dropped right away.", date: "2026-01-12", highlight: "Fast & clean" },
  { id: "r2", name: "Mark D.", location: "Dallas, TX", rating: 5, quote: "Professional crew and phenomenal results. My office glare is gone and our staff are much more comfortable. Highly recommend Shades of Texas.", date: "2025-12-01", highlight: "Commercial pros" },
  { id: "r3", name: "Aisha K.", location: "Houston, TX", rating: 5, quote: "Booked an estimate online — installer arrived on time, worked quickly, and left the site spotless. Great warranty and follow-up.", date: "2025-11-18", highlight: "Reliable" },
  { id: "r4", name: "Luis P.", location: "San Antonio, TX", rating: 5, quote: "Amazing customer service and the final finish looks great. The rooms feel cooler without losing our view — could not be happier.", date: "2025-10-22", highlight: "Great results" },
  { id: "r5", name: "Bethany L.", location: "Frisco, TX", rating: 5, quote: "They explained film options and picked the perfect tint for our home. The installers were respectful of our space and detail oriented.", date: "2025-09-30", highlight: "Thoughtful" },
  { id: "r6", name: "Omar S.", location: "El Paso, TX", rating: 5, quote: "Excellent value — the team helped me get rebates and the finished look is clean. Our storefront glare is gone and customers love the privacy.", date: "2025-08-19", highlight: "Business friendly" },
  { id: "r7", name: "Nina T.", location: "Plano, TX", rating: 5, quote: "Quick estimate and fast install. The crew worked around our schedule and the results are exactly what we wanted. Friendly, professional, and tidy.", date: "2025-07-09", highlight: "On-time" },
  { id: "r8", name: "Diego M.", location: "Corpus Christi, TX", rating: 5, quote: "We noticed the difference the same day — less glare, less heat. Installers were courteous and explained the warranty in detail.", date: "2025-06-02", highlight: "Comfort boost" },
  { id: "r9", name: "Priya R.", location: "Fort Worth, TX", rating: 5, quote: "Smooth booking process, friendly communication, and excellent workmanship. Would hire again for other properties.", date: "2025-05-18", highlight: "Clear process" },
  { id: "r10", name: "Ethan G.", location: "Lubbock, TX", rating: 5, quote: "Great experience from first call to finished install. The team was knowledgeable and the tint looks seamless — very impressed.", date: "2025-04-10", highlight: "Seamless" },
];

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

  // RAF refs
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const startupRetryRef = useRef<number | null>(null);

  // fractional remainder accumulator
  const scrollRemainderRef = useRef<number>(0);

  // last interaction timestamp
  const lastInteractionAtRef = useRef<number | null>(null);

  // normalization debounce + cooldown
  const lastNormalizeAtRef = useRef<number>(0);
  const LAST_NORMALIZE_MS = 60; // don't normalize more often than this
  const BLOCK_AFTER_NORMALIZE_MS = 140; // block autoplay application for this short window after normalize
  const blockedUntilRef = useRef<number>(0);

  // drag state
  const drag = useRef({ startX: 0, lastX: 0, scrollLeft: 0, dragging: false });

  const reviews = [...baseReviews];
  const extended = [
    ...reviews.map((r) => ({ ...r, id: `m-${r.id}` })),
    ...reviews,
    ...reviews.map((r) => ({ ...r, id: `p-${r.id}` })),
  ];

  const cardWidthRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const itemsCount = reviews.length;

  const speedPxPerSec = 70;
  const pauseAfterMs = 3000;

  const lastManualActionRef = useRef<number>(0);
  const MANUAL_ACTION_MIN_MS = 350;

  const SWIPE_THRESHOLD = 10;
  const MAX_MOVE_PER_EVENT = 240;

  // cap autoplay int move per frame (conservative)
  const MAX_AUTOPLAY_MOVE_PER_FRAME = 1; // 1 px per frame to avoid bursts

  // debug overlay
  const overlayElRef = useRef<HTMLDivElement | null>(null);
  const lastPauseSourceRef = useRef<string | null>(null);
  const readDebugFlag = () => {
    if (typeof window === "undefined") return false;
    try {
      return !!(window as any).__REVIEWS_DEBUG__ || !!(window as any).REVIEWS_DEBUG || !!localStorage.getItem("REVIEWS_DEBUG");
    } catch {
      return !!(window as any).__REVIEWS_DEBUG__ || !!(window as any).REVIEWS_DEBUG;
    }
  };
  const log = (...args: any[]) => {
    if (!readDebugFlag()) return;
    console.log("[reviews]", ...args);
  };
  const ensureOverlay = () => {
    if (!readDebugFlag()) return null;
    if (overlayElRef.current) return overlayElRef.current;
    const el = document.createElement("div");
    el.id = "reviews-debug-overlay";
    Object.assign(el.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "99999",
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      padding: "8px 10px",
      fontSize: "12px",
      lineHeight: "1.2",
      borderRadius: "8px",
      maxWidth: "360px",
      pointerEvents: "none",
      fontFamily: "monospace",
      whiteSpace: "pre-line",
    } as any);
    document.body.appendChild(el);
    overlayElRef.current = el;
    return el;
  };
  const updateOverlay = () => {
    if (!readDebugFlag()) return;
    const el = overlayElRef.current || ensureOverlay();
    if (!el) return;
    const t = trackRef.current;
    const running = !!rafRef.current;
    const dragging = drag.current.dragging;
    const scrollLeftF = t ? t.scrollLeft.toFixed(3) : "-";
    const singleF = singleSetWidthRef.current ? singleSetWidthRef.current.toFixed(3) : "-";
    const lastPause = lastPauseSourceRef.current || "-";
    el.innerText = `autoplay:${running ? "ON" : "OFF"}\nscroll:${scrollLeftF}\nsingle:${singleF}\ndrag:${dragging}\nlastPause:${lastPause}`;
  };

  // measure & center
  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.querySelector<HTMLElement>("[data-review-card]");
      const gap = parseInt(getComputedStyle(track).gap || (getComputedStyle(track) as any).columnGap || "16", 10) || 16;
      const cardWidth = firstCard ? firstCard.clientWidth : Math.min(track.clientWidth * 0.86, 360);
      cardWidthRef.current = cardWidth + gap;
      singleSetWidthRef.current = cardWidthRef.current * itemsCount;
      log("measure", { cardWidth, gap, cardWidthWithGap: cardWidthRef.current, singleSetWidth: singleSetWidthRef.current });
      requestAnimationFrame(() => {
        if (track) track.scrollLeft = singleSetWidthRef.current;
        updateOverlay();
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

  // autoplay + overlay lifecycle
  useEffect(() => {
    let overlayRaf: number | null = null;
    if (readDebugFlag()) {
      ensureOverlay();
      overlayRaf = requestAnimationFrame(function overlayLoop() {
        updateOverlay();
        overlayRaf = requestAnimationFrame(overlayLoop);
      });
    }
    startAutoplay();
    return () => {
      stopAutoplay();
      clearResumeTimer();
      if (overlayRaf) cancelAnimationFrame(overlayRaf);
      if (overlayElRef.current) {
        try {
          overlayElRef.current.remove();
        } catch {}
        overlayElRef.current = null;
      }
      if (startupRetryRef.current) {
        clearTimeout(startupRetryRef.current);
        startupRetryRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleResume() {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      const last = lastInteractionAtRef.current ?? 0;
      if (Date.now() - last >= pauseAfterMs) {
        lastFrameRef.current = performance.now();
        log("scheduleResume: idle reached -> startAutoplay");
        startAutoplay();
      } else {
        const remaining = pauseAfterMs - (Date.now() - last);
        log("scheduleResume: rescheduling, remaining", remaining);
        resumeTimerRef.current = window.setTimeout(() => {
          resumeTimerRef.current = null;
          lastFrameRef.current = performance.now();
          startAutoplay();
        }, Math.max(0, remaining));
      }
    }, pauseAfterMs);
  }

  // Ensure we don't leave multiple RAFs running
  function startAutoplay() {
    if (rafRef.current) {
      log("startAutoplay: RAF already running (stopping first to be safe)");
      stopAutoplay();
    }

    const track = trackRef.current;
    if (!track || !singleSetWidthRef.current) {
      log("startAutoplay: not ready, retry");
      if (!startupRetryRef.current) {
        startupRetryRef.current = window.setTimeout(() => {
          startupRetryRef.current = null;
          startAutoplay();
        }, 120);
      }
      return;
    }

    // reset remainder when restarting
    scrollRemainderRef.current = 0;
    lastFrameRef.current = performance.now();

    const loop = (now: number) => {
      const t = trackRef.current;
      if (!t) {
        rafRef.current = null;
        log("autoplay stopped: track missing");
        return;
      }
      const last = lastFrameRef.current ?? now;
      const dt = Math.min(40, Math.max(8, now - last));
      lastFrameRef.current = now;

      // block applying movement for short cooldown after normalization
      if (Date.now() < blockedUntilRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dx = (speedPxPerSec * dt) / 1000;
      if (!drag.current.dragging) {
        scrollRemainderRef.current += dx;
        let intMove = Math.trunc(scrollRemainderRef.current);
        if (intMove !== 0) {
          intMove = Math.sign(intMove) * Math.min(Math.abs(intMove), MAX_AUTOPLAY_MOVE_PER_FRAME);
          try {
            t.scrollBy({ left: intMove, behavior: "auto" });
            if (readDebugFlag()) log("autoplay applied intMove", { dt: dt.toFixed(3), dx: dx.toFixed(6), intMove, scrollLeft: t.scrollLeft });
          } catch {
            const before = t.scrollLeft;
            t.scrollLeft = before + intMove;
            if (readDebugFlag()) log("autoplay fallback assign", { intMove, before, after: t.scrollLeft });
          }
          scrollRemainderRef.current -= intMove;
          normalizeScrollIfNeeded(t);
        } else {
          if (readDebugFlag()) {
            const nowMs = performance.now();
            const lastLog = (lastFrameRef as any).__lastLogTime || 0;
            if (nowMs - lastLog > 1000) {
              (lastFrameRef as any).__lastLogTime = nowMs;
              log("autoplay accumulating fraction", { dx: dx.toFixed(6), remainder: scrollRemainderRef.current.toFixed(6), scrollLeft: t.scrollLeft.toFixed(6) });
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    log("startAutoplay scheduled");
    updateOverlay();
  }

  function stopAutoplay() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      log("stopAutoplay");
      updateOverlay();
    }
    lastFrameRef.current = null;
  }

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
      log("clearResumeTimer");
    }
  }

  function pauseForInteraction(source = "unknown") {
    lastPauseSourceRef.current = source;
    lastInteractionAtRef.current = Date.now();
    log("pauseForInteraction", source);
    stopAutoplay();
    scheduleResume();
    updateOverlay();
  }

  // Debounced, guarded normalization
  function normalizeScrollIfNeeded(track: HTMLDivElement) {
    const single = singleSetWidthRef.current;
    if (!single || drag.current.dragging) return;
    const now = Date.now();
    if (now - lastNormalizeAtRef.current < LAST_NORMALIZE_MS) return;

    // Use wider thresholds so we don't remap while near edges
    const min = single * 0.2;
    const max = single * 1.8;
    const total = track.scrollLeft;
    if (total > min && total < max) return;

    const offset = ((total - single) % single + single) % single;
    const mapped = single + offset;

    lastNormalizeAtRef.current = now;
    // block autoplay application briefly so browser has time to settle after the programmatic jump
    blockedUntilRef.current = Date.now() + BLOCK_AFTER_NORMALIZE_MS;

    // reset remainder to prevent a lump of intMoves immediately after mapping
    scrollRemainderRef.current = 0;

    log("normalize", { total: total.toFixed(6), single: single.toFixed(6), offset: offset.toFixed(6), mapped: mapped.toFixed(6), blockedUntil: blockedUntilRef.current });
    track.scrollTo({ left: mapped, behavior: "auto" });
    updateOverlay();
  }

  function clamp(value: number) {
    const track = trackRef.current;
    if (!track) return value;
    const max = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(max, value));
  }

  function getOffsetInSingle(track: HTMLDivElement) {
    const single = singleSetWidthRef.current;
    if (!single) return 0;
    return ((track.scrollLeft - single) % single + single) % single;
  }

  function scrollByCard(direction = 1) {
    const now = Date.now();
    if (now - lastManualActionRef.current < MANUAL_ACTION_MIN_MS) {
      log("scrollByCard throttled");
      return;
    }
    lastManualActionRef.current = now;
    const track = trackRef.current;
    if (!track || !singleSetWidthRef.current) return;
    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const offset = getOffsetInSingle(track);
    const desired = offset + direction * step;
    const single = singleSetWidthRef.current;
    const targetOffset = ((desired % single) + single) % single;
    const target = single + targetOffset;
    log("scrollByCard", { direction, step, offset, desired, targetOffset, target });
    pauseForInteraction("arrow");
    track.scrollTo({ left: target, behavior: "smooth" });
  }

  // pointer handlers
  function onPointerDown(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    lastInteractionAtRef.current = Date.now();
    stopAutoplay();
    clearResumeTimer();
    drag.current.dragging = true;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.scrollLeft = track.scrollLeft;
    log("onPointerDown", { clientX: e.clientX, scrollLeft: track.scrollLeft.toFixed(6) });
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateOverlay();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.dragging) return;
    const rawDelta = e.clientX - drag.current.lastX;
    const delta = Math.max(-MAX_MOVE_PER_EVENT, Math.min(MAX_MOVE_PER_EVENT, rawDelta));
    const track = trackRef.current;
    if (!track) return;
    const before = track.scrollLeft;
    track.scrollLeft = clamp(track.scrollLeft - delta);
    drag.current.lastX = e.clientX;
    log("onPointerMove", { clientX: e.clientX, rawDelta: rawDelta.toFixed(3), delta: delta.toFixed(3), before: before.toFixed(6), after: track.scrollLeft.toFixed(6) });
    updateOverlay();
  }

  function finalizeInteractionAfterTouchLike() {
    const track = trackRef.current;
    if (!track) {
      drag.current.dragging = false;
      return;
    }
    const totalMoved = Math.abs(drag.current.startX - drag.current.lastX);
    const swipeDelta = drag.current.startX - drag.current.lastX;
    drag.current.dragging = false;

    log("finalizeInteractionAfterTouchLike", { totalMoved, swipeDelta, startX: drag.current.startX, lastX: drag.current.lastX, scrollLeft: track.scrollLeft.toFixed(6) });

    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const single = singleSetWidthRef.current || step * itemsCount;
    const offset = getOffsetInSingle(track);
    let targetIndex = Math.round(offset / step);

    if (totalMoved > SWIPE_THRESHOLD) {
      if (swipeDelta > 0) targetIndex = Math.floor(offset / step) + 1;
      else if (swipeDelta < 0) targetIndex = Math.ceil(offset / step) - 1;
    } else {
      targetIndex = Math.round(offset / step);
    }
    targetIndex = Math.max(0, Math.min(itemsCount - 1, targetIndex));
    const targetOffset = targetIndex * step;
    const target = single + targetOffset;
    log("touch finalize snap target", { step, offset, targetIndex, targetOffset, target });
    track.scrollTo({ left: target, behavior: "smooth" });

    lastInteractionAtRef.current = Date.now();
    pauseForInteraction(totalMoved > SWIPE_THRESHOLD ? "swipe" : "tap");
    updateOverlay();
  }

  function onPointerUp(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) {
      drag.current.dragging = false;
      return;
    }
    const totalMoved = Math.abs(drag.current.startX - drag.current.lastX);
    const swipeDelta = drag.current.startX - drag.current.lastX;
    drag.current.dragging = false;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    log("onPointerUp", { totalMoved, swipeDelta, startX: drag.current.startX, lastX: drag.current.lastX, scrollLeft: track.scrollLeft.toFixed(6) });

    const step = cardWidthRef.current || Math.min(track.clientWidth * 0.86, 360);
    const single = singleSetWidthRef.current || step * itemsCount;
    const offset = getOffsetInSingle(track);
    let targetIndex = Math.round(offset / step);

    if (totalMoved > SWIPE_THRESHOLD) {
      if (swipeDelta > 0) targetIndex = Math.floor(offset / step) + 1;
      else if (swipeDelta < 0) targetIndex = Math.ceil(offset / step) - 1;
    } else {
      targetIndex = Math.round(offset / step);
    }
    targetIndex = Math.max(0, Math.min(itemsCount - 1, targetIndex));
    const targetOffset = targetIndex * step;
    const target = single + targetOffset;
    log("pointerup snap target", { step, offset, targetIndex, targetOffset, target });

    track.scrollTo({ left: target, behavior: "smooth" });

    lastInteractionAtRef.current = Date.now();
    pauseForInteraction(totalMoved > SWIPE_THRESHOLD ? "swipe" : "tap");
    updateOverlay();
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    log("onScroll", { scrollLeft: track.scrollLeft.toFixed(6), scrollWidth: track.scrollWidth, clientWidth: track.clientWidth });
    if (!drag.current.dragging) normalizeScrollIfNeeded(track);
    updateOverlay();
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    function handleWheel(e: WheelEvent) {
      log("wheel", { deltaX: e.deltaX, deltaY: e.deltaY });
      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
        lastInteractionAtRef.current = Date.now();
        pauseForInteraction("wheel");
      }
    }
    function handleTouchStart() {
      lastInteractionAtRef.current = Date.now();
      stopAutoplay();
      clearResumeTimer();
      log("touchstart: stopAutoplay");
      updateOverlay();
    }
    function handleTouchEnd() {
      log("touchend: finalize");
      finalizeInteractionAfterTouchLike();
    }
    function handleTouchCancel() {
      log("touchcancel: finalize");
      finalizeInteractionAfterTouchLike();
    }
    function handleKey(e: KeyboardEvent) {
      if (document.activeElement === track) {
        log("keydown on track", { key: e.key });
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollByCard(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollByCard(1);
        }
      }
    }
    track.addEventListener("wheel", handleWheel, { passive: true });
    track.addEventListener("touchstart", handleTouchStart, { passive: true });
    track.addEventListener("touchend", handleTouchEnd, { passive: true });
    track.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    window.addEventListener("keydown", handleKey);

    log("listeners attached (wheel/touch/key)");
    return () => {
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("touchstart", handleTouchStart);
      track.removeEventListener("touchend", handleTouchEnd);
      track.removeEventListener("touchcancel", handleTouchCancel);
      window.removeEventListener("keydown", handleKey);
      log("listeners removed");
    };
  }, []);

  useEffect(() => {
    return () => {
      stopAutoplay();
      clearResumeTimer();
      if (startupRetryRef.current) {
        clearTimeout(startupRetryRef.current);
        startupRetryRef.current = null;
      }
    };
  }, []);

  return (
    <section aria-labelledby="reviews-title" className="py-14 bg-bg">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h2 id="reviews-title" className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">What our customers say</h2>
            <p className="mt-1 text-sm text-muted max-w-lg">Real testimonials from homeowners and businesses — verified installations, honest feedback.</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" aria-label="Previous reviews" onClick={() => { pauseForInteraction("prev-button"); scrollByCard(-1); }} className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-sm hover:shadow-md transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <button type="button" aria-label="Next reviews" onClick={() => { pauseForInteraction("next-button"); scrollByCard(1); }} className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        <div className="relative -mx-3 sm:-mx-6">
          <div ref={trackRef} tabIndex={0} role="list" aria-label="Customer reviews" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { drag.current.dragging = false; const track = trackRef.current; if (track) normalizeScrollIfNeeded(track); }} onScroll={onScroll} className="reviews-track relative flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-3 sm:px-6" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", msOverflowStyle: "none" }}>
            {extended.map((r, idx) => (
              <article key={r.id + "-" + idx} data-review-card role="listitem" aria-labelledby={`review-${r.id}-title`} className="snap-center flex-shrink-0 rounded-2xl p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm" style={{ width: "clamp(260px, 75vw, 360px)", minHeight: 220, transition: "transform 220ms ease, box-shadow 220ms ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 40px rgba(2,6,23,0.16)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                <header className="flex items-start gap-3">
                  <div className="flex items-center justify-center rounded-full text-[var(--color-primary-content)] flex-shrink-0" style={{ width: 54, height: 54, fontWeight: 700, background: "linear-gradient(180deg, rgba(37,99,235,0.12), rgba(37,99,235,0.25))", color: "var(--color-primary)", flexShrink: 0 }}>
                    <span className="text-sm" aria-hidden>{r.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 id={`review-${r.id}-title`} className="text-sm font-semibold text-[var(--color-text)] truncate">{r.name}</h3>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Stars value={r.rating} />
                        <span className="text-xs text-muted truncate">{r.location}</span>
                      </div>

                      {r.highlight && <span className="inline-block text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full whitespace-nowrap">{r.highlight}</span>}
                    </div>
                  </div>
                </header>

                <blockquote className="mt-4 text-sm text-[var(--color-text)]/90 leading-relaxed flex-1 overflow-hidden break-words">“{r.quote}”</blockquote>

                <footer className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-muted">{r.date}</div>

                  <div className="flex items-center gap-2">
                    <Link to="/reviews" className="text-xs font-semibold text-[var(--color-primary)] hover:underline" aria-label={`Read more reviews like ${r.name}`}>Read more</Link>

                    <Link to="/booking" className="ml-1 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-content)] shadow-sm hover:opacity-95 transition" aria-label="Book an estimate">Get Estimate</Link>
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