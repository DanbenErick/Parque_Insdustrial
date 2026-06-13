/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#515B3A",
        "secondary-fixed-dim": "#bec6e0",
        "on-tertiary-container": "#fffbff",
        "tertiary": "#825100",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#001f28",
        "surface-container-low": "#f2f4f6",
        "surface-dim": "#191c1e",
        "error": "#ba1a1a",
        "secondary-container": "#dae2fd",
        "tertiary-container": "#a36700",
        "surface": "#ffffff",
        "on-surface-variant": "#3e484d",
        "on-secondary-fixed-variant": "#3f465c",
        "on-primary-fixed-variant": "#004e61",
        "background": "#F3F4F6",
        "surface-variant": "#e0e3e5",
        "outline-variant": "#bdc8ce",
        "surface-container-highest": "#e0e3e5",
        "secondary-fixed": "#dae2fd",
        "inverse-primary": "#6cd3f7",
        "on-primary-container": "#fafdff",
        "outline": "#6e797e",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "inverse-surface": "#2d3133",
        "on-background": "#191c1e",
        "on-secondary": "#ffffff",
        "primary-fixed-dim": "#6cd3f7",
        "primary-container": "#007f9d",
        "tertiary-fixed": "#ffddb8",
        "inverse-on-surface": "#eff1f3",
        "surface-tint": "#006780",
        "on-secondary-fixed": "#131b2e",
        "surface-container-high": "#e6e8ea",
        "surface-bright": "#F3F4F6",
        "primary-fixed": "#b7eaff",
        "on-tertiary-fixed": "#2a1700",
        "on-tertiary-fixed-variant": "#653e00",
        "secondary": "#565e74",
        "on-surface": "#191c1e",
        "error-container": "#ffdad6",
        "tertiary-fixed-dim": "#ffb95f",
        "on-secondary-container": "#5c647a",
        "surface-container": "#eceef0",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "sm": "8px",
        "md": "16px",
        "margin-mobile": "16px",
        "gutter": "16px",
        "lg": "24px",
        "unit": "4px",
        "margin-desktop": "32px",
        "xl": "32px",
        "xs": "4px"
      },
      fontFamily: {
        "headline-md": ["Lexend"],
        "headline-lg": ["Lexend"],
        "body-md": ["Lexend"],
        "headline-sm": ["Lexend"],
        "label-caps": ["Lexend"],
        "body-sm": ["Lexend"],
        "body-lg": ["Lexend"],
        "display": ["Lexend"],
        "data-mono": ["JetBrains Mono"]
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "display": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "data-mono": ["14px", {"lineHeight": "20px", "fontWeight": "500"}]
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        }
      },
      animation: {
        blob: "blob 7s infinite"
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate'),
  ],
}
