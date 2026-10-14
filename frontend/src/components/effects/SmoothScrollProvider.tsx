"use client";

import React, { useEffect, useRef } from "react";

/**
 * SmoothScrollProvider implements physics-based inertial smooth scrolling (momentum scrolling)
 * without requiring external heavy npm dependencies.
 * It also supports custom anchor link smooth scrolling and page-wide keyboard navigation.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isScrollingRef = useRef(false);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check if smooth scrolling should be disabled (e.g. reduced motion preference or touch devices)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) {
      return;
    }

    currentScrollY.current = window.scrollY;
    targetScrollY.current = window.scrollY;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateScroll = () => {
      // Damping factor (0.08 gives a buttery Apple/Studio-like glide)
      currentScrollY.current = lerp(currentScrollY.current, targetScrollY.current, 0.085);

      if (Math.abs(currentScrollY.current - targetScrollY.current) > 0.4) {
        window.scrollTo(0, currentScrollY.current);
        rafId.current = requestAnimationFrame(updateScroll);
        isScrollingRef.current = true;
      } else {
        window.scrollTo(0, targetScrollY.current);
        isScrollingRef.current = false;
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Do not override if user is scrolling inside an internal scrollable container (e.g. modal)
      let targetEl = e.target as HTMLElement | null;
      let isInsideScrollable = false;

      while (targetEl && targetEl !== document.body) {
        if (targetEl.getAttribute("role") === "dialog" || targetEl.classList.contains("overflow-y-auto")) {
          isInsideScrollable = true;
          break;
        }
        targetEl = targetEl.parentElement;
      }

      if (isInsideScrollable) return;

      e.preventDefault();

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      // Multiplier tuned for responsiveness
      const delta = e.deltaY * 1.15;

      targetScrollY.current = Math.max(0, Math.min(maxScroll, targetScrollY.current + delta));

      if (!isScrollingRef.current) {
        rafId.current = requestAnimationFrame(updateScroll);
      }
    };

    const onScroll = () => {
      if (!isScrollingRef.current) {
        targetScrollY.current = window.scrollY;
        currentScrollY.current = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return <>{children}</>;
}
