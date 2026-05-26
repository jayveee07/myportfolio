import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Array of URLs coming from Firestore; if empty, component falls back to initials/gradient */
  urls?: string[];
  /** Optional: duration per image in ms */
  intervalMs?: number;
  /** Optional: fallback initials text (used when no images) */
  initials?: string;
  /** Classnames for the outer container */
  className?: string;
};

const normalizeUrls = (urls: unknown): string[] => {
  if (!urls) return [];
  if (Array.isArray(urls)) {
    return urls
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter(Boolean);
  }
  return [];
};

export function ModernAboutImageRotator({
  urls,
  intervalMs = 2500,
  initials = "JV",
  className = "",
}: Props) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const safeUrls = useMemo(() => normalizeUrls(urls), [urls]);

  // Auto-rotate
  useEffect(() => {
    if (safeUrls.length <= 1) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % safeUrls.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [safeUrls.length, intervalMs]);

  // Hover behavior: immediately show next image while hovered, then resume auto-rotation.
  useEffect(() => {
    if (!hovered) return;
    if (safeUrls.length <= 1) return;

    setActive((i) => (i + 1) % safeUrls.length);

    // If user keeps hovering, keep nudging a bit slower to feel intentional.
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHovered(false);
    }, 1800);

    return () => {
      if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    };
  }, [hovered, safeUrls.length]);

  const src = safeUrls[active];

  return (
    <div
      className={`relative w-full aspect-square overflow-hidden rounded-3xl rotate-3 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main gradient box */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-violet-500 to-rose-500 opacity-80" />

      {/* Image layer */}
      {src ? (
        <img
          key={src}
          src={src}
          alt="Professional"
          className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          draggable={false}
          loading="eager"
        />
      ) : (
        // Fallback: no images yet
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl font-display font-bold text-primary mb-2">
              {initials}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider">Professional</div>
          </div>
        </div>
      )}

      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}

