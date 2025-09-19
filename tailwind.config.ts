import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        brand: {
          ink: '#30332E',
          sage: '#A0AD92',
          mid: '#6A7166',
          light: '#DFE5DC',
        }
      },
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
