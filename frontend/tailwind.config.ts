import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

// Tokens do PRF. As cores só existem aqui: os componentes usam os nomes (primary-700, accent...),
// nunca hex direto nas classes. Neutros: paleta stone do Tailwind.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Verde-petróleo, base #0F4C5C.
        primary: {
          DEFAULT: "#0F4C5C",
          50: "#EEF6F7",
          100: "#D4E8EC",
          500: "#2C7385",
          700: "#0F4C5C",
          900: "#082F39",
          foreground: "#FFFFFF",
        },
        // Âmbar, para avisos e consultas agendadas.
        accent: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
          100: "#FEF3C7",
          700: "#B45309",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", ...defaultTheme.fontFamily.sans],
        // CPF, ids, números das tabelas e SQL.
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;
