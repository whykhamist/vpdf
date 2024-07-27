import type { Config } from "tailwindcss";
import { animation, keyframes } from "./tw/animations";
import { width as twWidth, height as twHeight } from "./tw/size";

export default {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx,json}"],
  theme: {
    extend: {
      animation,
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
