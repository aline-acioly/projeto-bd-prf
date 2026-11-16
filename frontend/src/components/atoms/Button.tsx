import type { ButtonHTMLAttributes } from "react";

// "texto" e "textoPerigo": botões de texto compactos (ações da tabela), sem fundo nem borda.
type Variante = "primario" | "secundario" | "perigo" | "texto" | "textoPerigo";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const BASE =
  "inline-flex items-center justify-center rounded-md text-sm font-medium " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primario: "px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-900 focus-visible:ring-primary-500",
  secundario:
    "px-4 py-2 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400",
  perigo: "px-4 py-2 bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
  texto: "px-2 py-1 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500",
  textoPerigo: "px-2 py-1 text-red-700 hover:bg-red-50 focus-visible:ring-red-600",
};

export function Button({ variante = "primario", type = "button", className = "", ...props }: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTES[variante]} ${className}`} {...props} />;
}
