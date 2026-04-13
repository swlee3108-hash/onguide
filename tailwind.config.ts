import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["'Pretendard Variable'", "Pretendard", "-apple-system", "system-ui", "sans-serif"] },
      colors: {
        page: "#F9F6F0", surface: "#FFFFFF", muted: "#F0EBE3", subtle: "#E8E3DC",
        "t-primary": "#2D2A26", "t-body": "#4A4540", "t-secondary": "#6A6560", "t-muted": "#8A7E72", "t-hint": "#B0A89E",
        "a-russet": "#7B3B2B", "a-copper": "#A0623A", "a-caramel": "#C08B5C", "a-amber": "#D4A030", "a-pumpkin": "#E87A00",
        cta: "#E87A00", "cta-hover": "#D06E00", caution: "#C05030",
      },
      borderRadius: { xs: "4px", sm: "6px", md: "10px", lg: "14px", xl: "20px" },
      boxShadow: {
        sm: "0 1px 2px rgba(45,42,38,0.06)", md: "0 2px 8px rgba(45,42,38,0.08)",
        lg: "0 4px 16px rgba(45,42,38,0.10)", xl: "0 8px 32px rgba(45,42,38,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
