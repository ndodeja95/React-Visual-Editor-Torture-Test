/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#fcfbf8",
      "foreground": "#1e2639",
      "border": "#c3c8d5",
      "card": "#fcfbf8",
      "cardForeground": "#1e2639",
      "popover": "#fcfbf8",
      "popoverForeground": "#1e2639",
      "primary": "#f2642c",
      "primaryForeground": "#fcfbf8",
      "secondary": "#39937b",
      "secondaryForeground": "#151b28",
      "muted": "#d5d9e2",
      "mutedForeground": "#58637e",
      "accent": "#f9cd48",
      "accentForeground": "#1e2639",
      "destructive": "#dd382c",
      "destructiveForeground": "#fcfbf8",
      "input": "#c3c8d5",
      "ring": "#f2642c",
      "chart1": "#f2642c",
      "chart2": "#39937b",
      "chart3": "#1e2639",
      "chart4": "#f9cd48",
      "chart5": "#dd382c",
      "sidebar": "#161d2d",
      "sidebarForeground": "#f9f7f1",
      "sidebarBorder": "#2a3246",
      "sidebarPrimary": "#f2642c",
      "sidebarPrimaryForeground": "#151b28",
      "sidebarAccent": "#242b3d",
      "sidebarAccentForeground": "#f9f7f1",
      "sidebarRing": "#f2642c"
    },
    "dark": {
      "background": "#151b28",
      "foreground": "#f9f7f1",
      "border": "#3f475a",
      "card": "#1e2533",
      "cardForeground": "#f9f7f1",
      "popover": "#1e2533",
      "popoverForeground": "#f9f7f1",
      "primary": "#f3723f",
      "primaryForeground": "#151b28",
      "secondary": "#39937b",
      "secondaryForeground": "#f9f7f1",
      "muted": "#323948",
      "mutedForeground": "#d3c392",
      "accent": "#f8c220",
      "accentForeground": "#151b28",
      "destructive": "#af261d",
      "destructiveForeground": "#f9f7f1",
      "input": "#3f475a",
      "ring": "#f3723f",
      "chart1": "#f3723f",
      "chart2": "#39937b",
      "chart3": "#f9cd48",
      "chart4": "#4f6596",
      "chart5": "#dd382c",
      "sidebar": "#0f141f",
      "sidebarForeground": "#f9f7f1",
      "sidebarBorder": "#2a3246",
      "sidebarPrimary": "#f3723f",
      "sidebarPrimaryForeground": "#151b28",
      "sidebarAccent": "#242b3d",
      "sidebarAccentForeground": "#f9f7f1",
      "sidebarRing": "#f3723f"
    }
  },
  "fontFamily": {
    "sans": [
      "Space Grotesk",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "IBM Plex Mono",
      "monospace"
    ]
  },
  "radius": "0.5rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
