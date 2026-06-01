import React, { useEffect, useRef } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

export const SEARCH_SUGGESTIONS = [
  "a vintage Sony Walkman",
  "a refurbished PS5",
  "a first-edition Harry Potter book",
  "a Lego Millennium Falcon",
  "a vintage Rolex Submariner",
  "a Nintendo 64 with games",
  "a Canon AE-1 film camera",
  "a sealed Pokémon booster box",
  "a vintage Levi's denim jacket",
  "a signed Michael Jordan card",
  "a Bang & Olufsen turntable",
  "a rare Air Jordan 1 OG",
  "an original Game Boy Color",
  "a vintage Polaroid camera",
  "a MacBook Pro M1 refurbished",
  "a Technics SL-1200 turntable",
  "a sealed N64 cartridge",
  "a vintage Apple iMac G4",
];

const LOOPING_SUGGESTIONS = [...SEARCH_SUGGESTIONS, ...SEARCH_SUGGESTIONS];

function SuggestionSet({ setRef, suggestions }) {
  return React.createElement(
    "div",
    { className: "search-ticker-set", ref: setRef, "aria-hidden": setRef ? "false" : "true" },
    suggestions.map((suggestion) =>
      React.createElement(
        React.Fragment,
        { key: suggestion },
        React.createElement("span", { className: "search-ticker-item" }, suggestion),
        React.createElement("span", { className: "search-ticker-dot", "aria-hidden": "true" }, "•"),
      ),
    ),
  );
}

export function SearchTicker() {
  const trackRef = useRef(null);
  const firstSetRef = useRef(null);
  const positionRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    const updateLoopWidth = () => {
      loopWidthRef.current = firstSetRef.current?.scrollWidth ?? 0;
    };

    updateLoopWidth();
    const resizeObserver = new ResizeObserver(updateLoopWidth);
    if (firstSetRef.current) {
      resizeObserver.observe(firstSetRef.current);
    }

    const tick = () => {
      if (!pausedRef.current && trackRef.current && loopWidthRef.current > 0) {
        positionRef.current += 0.6;
        if (positionRef.current >= loopWidthRef.current) {
          positionRef.current = 0;
        }
        trackRef.current.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
  };

  const firstLoop = LOOPING_SUGGESTIONS.slice(0, SEARCH_SUGGESTIONS.length);
  const secondLoop = LOOPING_SUGGESTIONS.slice(SEARCH_SUGGESTIONS.length);

  const scan = () => {
    const builder = document.querySelector("#configure");
    const input = document.querySelector("#queryInput");
    builder?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => input?.focus(), 420);
  };

  return React.createElement(
    "section",
    { className: "search-ticker", "aria-label": "Search suggestion ticker" },
    React.createElement("p", { className: "search-ticker-label" }, "Help me look for..."),
    React.createElement(
      "div",
      {
        className: "search-ticker-bar",
        onMouseEnter: pause,
        onMouseLeave: resume,
      },
      React.createElement(
        "span",
        { className: "search-ticker-icon", "aria-hidden": "true" },
        React.createElement(
          "svg",
          { viewBox: "0 0 24 24", focusable: "false" },
          React.createElement("path", {
            d: "m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
          }),
        ),
      ),
      React.createElement(
        "div",
        { className: "search-ticker-window" },
        React.createElement(
          "div",
          { className: "search-ticker-track", ref: trackRef },
          React.createElement(SuggestionSet, { setRef: firstSetRef, suggestions: firstLoop }),
          React.createElement(SuggestionSet, { suggestions: secondLoop }),
        ),
      ),
      React.createElement("button", { className: "search-ticker-button", type: "button", onClick: scan }, "Scan"),
    ),
  );
}

const rootElement = document.querySelector("#searchTickerRoot");

if (rootElement) {
  createRoot(rootElement).render(React.createElement(SearchTicker));
}
