import { type Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            color: "inherit",
            maxWidth: "100%",
            h1: {
              color: "inherit",
            },
            h2: {
              color: "inherit",
            },
            h3: {
              color: "inherit",
            },
            h4: {
              color: "inherit",
            },
            h5: {
              color: "inherit",
            },
            h6: {
              color: "inherit",
            },
            pre: {
              backgroundColor: "#000",
              padding: 0,
              margin: 0,
            },
            "p:first-of-type": {
              marginTop: 0,
            },
            code: {
              color: "inherit",
            },
            th: {
              color: "inherit",
            },
            table: false,
            ul: {
              color: "inherit",
            },
            ol: {
              color: "inherit",
            },
            li: {
              color: "inherit",
            },
            a: {
              color: "inherit",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
