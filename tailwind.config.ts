import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15803D",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        dark: "#166534",
        light: "#DCFCE7",
        bg: "#F8FAFC",
        danger: "#DC2626",
        warning: "#F59E0B",
        navy: "#1E3A5F",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(21,128,61,0.15), 0 1px 4px rgba(0,0,0,0.08)",
        sidebar: "4px 0 24px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0f4c25 0%, #15803D 50%, #166534 100%)",
        "card-gradient": "linear-gradient(135deg, #15803D 0%, #166534 100%)",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        pulse2: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
