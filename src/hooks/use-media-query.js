import { useState, useEffect } from "react";

/**
 * Custom hook to evaluate a CSS media query and return a boolean.
 * @param {string} query - A valid CSS media query string,  e.g. "(max-width: 768px)"
 * @returns {boolean} - Whether the media query currently matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQueryList = window.matchMedia(query);
        const listener = (event) => setMatches(event.matches);

        // Modern API
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener("change", listener);
        } else {
            // Fallback for older browsers
            mediaQueryList.addListener(listener);
        }

        setMatches(mediaQueryList.matches);

        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener("change", listener);
            } else {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}
