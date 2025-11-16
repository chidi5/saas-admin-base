import { useState, useEffect } from "react";

/**
 * Tracks whether a CSS media query currently matches and updates when its match state changes.
 *
 * @param query - A CSS media query string to evaluate (e.g., "(min-width: 600px)").
 * @returns `true` if the media query matches, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    const updateMatches = () => setMatches(media.matches);
    updateMatches();

    media.addEventListener("change", updateMatches);

    return () => media.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}