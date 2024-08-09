import type { Config } from "tailwindcss";
import { animation, keyframes } from "./tw/animations";
import { width as twWidth, height as twHeight } from "./tw/size";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,json}",
    "./preview/**/*.{vue,js,ts,jsx,tsx,json}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        negative: "hsl(var(--negative) / <alpha-value>)",
        positive: "hsl(var(--positive) / <alpha-value>)",
      },
      animation,
      // @ts-expect-error
      keyframes,
      // @ts-expect-error
      height: twHeight,
      // @ts-expect-error
      maxHeight: twHeight,
      // @ts-expect-error
      minHeight: twHeight,
      // @ts-expect-error
      width: twWidth,
      // @ts-expect-error
      minWidth: twWidth,
      // @ts-expect-error
      maxWidth: twWidth,
    },
  },
  plugins: [],
} satisfies Config;
