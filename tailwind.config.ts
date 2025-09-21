import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { colors, typography, spacing, borderRadius, shadows, breakpoints, zIndex, durations, easings } from "./src/lib/design-tokens";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Typography
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      
      // Colors - Evergreen Brand System
      colors: {
        // Primary Evergreen Colors
        primary: colors.primary,
        // Secondary Sage/Neutral Colors
        secondary: colors.secondary,
        // Accent Colors
        accent: colors.accent,
        // Neutral Colors
        neutral: colors.neutral,
        // Semantic Colors
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        // Legacy brand colors for backward compatibility
        brand: {
          ink: colors.secondary[900],    // #30332E
          sage: colors.secondary[400],   // #A0AD92
          mid: colors.secondary[500],    // #6A7166
          light: colors.primary[50],     // #f0fdf4
        }
      },
      
      // Spacing
      spacing: spacing,
      
      // Border Radius
      borderRadius: borderRadius,
      
      // Shadows
      boxShadow: shadows,
      
      // Breakpoints
      screens: breakpoints,
      
      // Z-Index
      zIndex: zIndex,
      
      // Animation Durations
      transitionDuration: durations,
      
      // Animation Easing
      transitionTimingFunction: easings,
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%': { opacity: '0.15', transform: 'scale(0.96) translateZ(0)' },
          '60%': { opacity: '0.35', transform: 'scale(1.05) translateZ(0)' },
          '100%': { opacity: '0', transform: 'scale(1.12) translateZ(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
