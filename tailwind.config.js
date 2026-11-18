/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#221A14",
          soft: "#4B3A2B",
          faint: "#8A7461",
        },
        forest: {
          DEFAULT: "#2F6B46",
          dark: "#22503A",
          light: "#4E8F68",
          wash: "#DCEBDF",
        },
        amber: {
          DEFAULT: "#E8A33D",
          dark: "#C07F22",
          light: "#F6D9A2",
        },
        sky: {
          DEFAULT: "#5FA8D3",
          dark: "#3E7FA6",
          light: "#CDE6F3",
        },
        coral: {
          DEFAULT: "#E2604A",
          dark: "#BC4432",
          light: "#F7CFC6",
        },
        plum: {
          DEFAULT: "#8C6BB1",
          dark: "#6B4E8C",
          light: "#E0D4EE",
        },
        teal: {
          DEFAULT: "#3EA79B",
          dark: "#2C7E75",
          light: "#CDEBE6",
        },
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        canvas: "var(--canvas)",
        body: "var(--text)",
        muted: "var(--text-muted)",
        edge: "var(--border)",
      },
      fontFamily: {
        display: ['"Pixelify Sans"', "ui-monospace", "monospace"],
        pixel: ['"Silkscreen"', "ui-monospace", "monospace"],
        body: ['"Nunito"', "ui-rounded", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        pixel: "6px",
      },
      boxShadow: {
        pixel: "4px 4px 0 0 var(--shadow)",
        "pixel-sm": "2px 2px 0 0 var(--shadow)",
        "pixel-lg": "6px 6px 0 0 var(--shadow)",
        "pixel-in": "inset 2px 2px 0 0 rgba(34,26,20,0.18)",
        "pixel-none": "0 0 0 0 var(--shadow)",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        blink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(120%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shine: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "fill-in": {
          "0%": { width: "0%" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
      },
      animation: {
        bob: "bob 2.4s steps(6, end) infinite",
        blink: "blink 4s steps(1, end) infinite",
        pop: "pop 0.22s steps(4, end) both",
        "slide-in": "slide-in 0.28s steps(5, end) both",
        "slide-up": "slide-up 0.24s steps(5, end) both",
        shine: "shine 1.6s steps(8, end) infinite",
        wiggle: "wiggle 0.5s steps(4, end) infinite",
        "float-up": "float-up 0.9s steps(8, end) forwards",
      },
    },
  },
  plugins: [],
};
