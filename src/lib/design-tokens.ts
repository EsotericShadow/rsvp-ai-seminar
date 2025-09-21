/**
 * Evergreen Web Solutions Design System
 * Unified design tokens for consistent branding across the application
 */

// Brand Colors - Evergreen Theme
export const colors = {
  // Primary Evergreen Colors
  primary: {
    50: '#f0fdf4',   // Light green background
    100: '#dcfce7',  // Very light green
    200: '#bbf7d0',  // Light green
    300: '#86efac',  // Medium light green
    400: '#4ade80',  // Medium green
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Dark green
    700: '#15803d',  // Darker green
    800: '#166534',  // Very dark green
    900: '#14532d',  // Darkest green
    950: '#052e16',  // Ultra dark green
  },
  
  // Secondary Colors (Sage/Neutral)
  secondary: {
    50: '#f8faf9',   // Light sage
    100: '#f1f5f0',  // Very light sage
    200: '#e3e9e0',  // Light sage
    300: '#d1dbcd',  // Medium light sage
    400: '#a0ad92',  // Primary sage
    500: '#6a7166',  // Medium sage
    600: '#5a6156',  // Dark sage
    700: '#4a5047',  // Darker sage
    800: '#3d433b',  // Very dark sage
    900: '#30332e',  // Darkest sage (brand ink)
    950: '#1a1d18',  // Ultra dark sage
  },
  
  // Accent Colors
  accent: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
};

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'] as string[],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'] as string[],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }] as [string, { lineHeight: string }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }] as [string, { lineHeight: string }],
    base: ['1rem', { lineHeight: '1.5rem' }] as [string, { lineHeight: string }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }] as [string, { lineHeight: string }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as [string, { lineHeight: string }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as [string, { lineHeight: string }],
    '5xl': ['3rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
    '6xl': ['3.75rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
    '7xl': ['4.5rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
    '8xl': ['6rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
    '9xl': ['8rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',   // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
};

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Glass Effect
export const glassEffect = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdrop: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index Scale
export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800',
};

// Animation Durations
export const durations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
};

// Easing Functions
export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Component Variants
export const componentVariants = {
  button: {
    sizes: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
    variants: {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
      accent: 'bg-accent-blue-600 hover:bg-accent-blue-700 text-white',
      outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
      ghost: 'text-primary-600 hover:bg-primary-50',
      destructive: 'bg-error-600 hover:bg-error-700 text-white',
    },
  },
  
  input: {
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    variants: {
      default: 'border border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
      error: 'border border-error-500 focus:border-error-500 focus:ring-error-500',
      success: 'border border-success-500 focus:border-success-500 focus:ring-success-500',
    },
  },
  
  card: {
    variants: {
      default: 'bg-white border border-neutral-200 shadow-sm',
      elevated: 'bg-white border border-neutral-200 shadow-md',
      glass: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-white/10',
      dark: 'bg-neutral-900 border border-neutral-800 shadow-lg',
    },
  },
};

// Brand Assets
export const brand = {
  name: 'Evergreen Web Solutions',
  tagline: 'AI Solutions for Northern BC',
  location: 'Terrace, BC',
  colors: {
    primary: '#22c55e',    // Evergreen green
    secondary: '#a0ad92',  // Sage green
    accent: '#3b82f6',     // Blue accent
    ink: '#30332e',        // Dark text
    light: '#f0fdf4',      // Light background
  },
  logo: {
    icon: '🌲',
    text: 'Evergreen',
  },
};
