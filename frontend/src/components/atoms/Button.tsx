import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "perigo";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const BASE =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-primary text-white hover:bg-blue-800 focus-visible:ring-primary",
  secundario:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
  perigo: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

export function Button({ variante = "primario", type = "button", className = "", ...props }: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTES[variante]} ${className}`} {...props} />;
}
