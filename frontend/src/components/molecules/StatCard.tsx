// Card de indicador. Estrutura do BoxSquare do GFD (variante tipada + mapa de configuração),
// sem imagem: rótulo, número grande e uma linha de descrição.
export type VarianteStatCard = "primario" | "acento" | "neutro";

interface StatCardProps {
  rotulo: string;
  /** null enquanto carrega. */
  valor: number | null;
  descricao: string;
  variante?: VarianteStatCard;
  className?: string;
}

const VARIANTES: Record<VarianteStatCard, { borda: string; numero: string }> = {
  primario: { borda: "border-t-primary", numero: "text-primary-700" },
  acento: { borda: "border-t-accent", numero: "text-accent-700" },
  neutro: { borda: "border-t-stone-400", numero: "text-stone-800" },
};

export function StatCard({ rotulo, valor, descricao, variante = "primario", className = "" }: StatCardProps) {
  const { borda, numero } = VARIANTES[variante];
  return (
    <div className={`rounded-lg border border-t-4 border-stone-200 bg-white p-5 ${borda} ${className}`}>
      <p className="text-sm font-medium text-stone-600">{rotulo}</p>
      <p className={`mt-2 font-mono text-4xl font-medium tabular-nums ${numero}`}>{valor ?? "—"}</p>
      <p className="mt-2 text-sm text-stone-500">{descricao}</p>
    </div>
  );
}
