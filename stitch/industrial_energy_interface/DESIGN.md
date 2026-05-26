---
name: Industrial Energy Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e484d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006780'
  primary: '#00647c'
  on-primary: '#ffffff'
  primary-container: '#007f9d'
  on-primary-container: '#fafdff'
  inverse-primary: '#6cd3f7'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-stakes industrial environments where data density and clarity are paramount. It targets energy sector professionals, engineers, and plant operators who require immediate, glanceable insights into complex systems. 

The aesthetic is **Corporate Modern with a Technical bias**, prioritizing functional precision over decorative elements. It utilizes a structured, high-density information architecture that evokes a sense of control, reliability, and systemic efficiency. The interface avoids pure black to reduce ocular fatigue, opting for deep navy tones to maintain high contrast while providing a more sophisticated, "instrument-panel" feel.

## Colors

The palette is anchored in technical precision. 
- **Primary (Cyan/Teal):** Used for interactive elements, active states, and primary data visualizations. It provides a modern, "clean energy" feel.
- **Secondary (Navy):** Applied to typography, iconography, and structural headers to ensure grounding and professional authority.
- **Accent (Amber):** Reserved strictly for warnings, critical data points, and state changes that require immediate operator attention.
- **Surface & Background:** A subtle distinction between #FFFFFF (cards/containers) and #F8FAFC (workspace background) creates a clear visual hierarchy without the need for heavy borders.

## Typography

The typography system uses **Hanken Grotesk** for its exceptional legibility and modern, geometric structure. For specific data readouts and telemetry values, a secondary monospaced font (**JetBrains Mono**) is introduced to ensure that numerical values align perfectly in tables and dashboard widgets, facilitating rapid comparison.

- Use **Headline-sm** for card titles to maintain high density.
- Use **Label-caps** for metadata and overlines to provide clear categorization.
- Use **Data-mono** for all real-time numerical units and sensor readings.

## Layout & Spacing

The design system employs a **Fixed-Fluid hybrid grid**. The sidebar navigation remains fixed at 240px, while the main dashboard area utilizes a 12-column fluid grid to maximize screen real estate on wide-format industrial monitors.

- **Density:** High. Padding within cards is strictly capped at `md` (16px) to allow more data clusters per viewport.
- **Breakpoints:** 
  - Mobile (< 768px): Single column, 16px margins.
  - Tablet (768px - 1280px): 6-column grid, 24px margins.
  - Desktop (> 1280px): 12-column grid, 32px margins.

## Elevation & Depth

To maintain a technical and "flat" professional feel, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Level 0 (Background):** #F8FAFC. The canvas.
- **Level 1 (Cards):** #FFFFFF surface with a 1px border of #E2E8F0. 
- **Interactive Shadow:** Only applied on hover for clickable cards—a very soft, 4px blur with 5% opacity using the Secondary color (#0F172A).
- **Overlays:** Modals use a semi-transparent Navy backdrop (20% opacity) to maintain context while focusing the operator's task.

## Shapes

The shape language is **Soft (0.25rem)**. In an industrial context, sharp corners (0px) can feel overly aggressive, while fully rounded corners (Pill) feel too consumer-oriented. The 4px radius (Soft) strikes the balance of a modern professional tool—precise yet refined.

- **Small Components:** Buttons and inputs use 4px (Soft).
- **Containers:** Large dashboard cards use 8px (Large) for clearer containment.
- **Indicators:** Status pips and small tags use a 2px radius for a sharper, "LED" indicator aesthetic.

## Components

### Buttons
- **Primary:** Solid #0891B2 with white text. High-contrast, used for "Run", "Activate", or "Save".
- **Secondary:** Transparent background with #0F172A border and text. Used for "Cancel" or "Settings".
- **Ghost:** No border, Navy text. Used for low-priority toolbar actions.

### Data Inputs
- **Fields:** 1px #E2E8F0 border, white background. On focus, the border transitions to Primary #0891B2 with a subtle 2px glow.
- **Status Chips:** Small, condensed labels with light tinted backgrounds (e.g., Amber background at 10% opacity for warning states).

### Data Visualizations
- **Charts:** Use a 2px stroke width for line graphs. Grid lines should be #F1F5F9 (extremely subtle).
- **Telemetry Cards:** Feature a large "Data-mono" value with a small trend indicator (up/down arrow) in the bottom right corner.

### Lists & Tables
- **High-Density Tables:** Row height capped at 40px. Zebra striping using #F8FAFC on even rows to aid horizontal tracking across wide data sets.