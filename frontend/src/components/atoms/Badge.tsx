import type { ReactNode } from "react";

// Mesmo padrão de variante do GFD: união de strings + Record de configuração.
export type VarianteBadge = "primario" | "acento" | "contorno" | "neutro";

interface BadgeProps {
  variante?: VarianteBadge;
  children: ReactNode;
  className?: string;
}

const VARIANTES: Record<VarianteBadge, string> = {
  primario: "border-primary-100 bg-primary-50 text-primary-700",
  acento: "border-accent-100 bg-accent-50 text-accent-700",
  contorno: "border-primary-500 bg-transparent text-primary-700",
  neutro: "border-stone-200 bg-stone-100 text-stone-700",
};

export function Badge({ variante = "neutro", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </span>
  );
}
