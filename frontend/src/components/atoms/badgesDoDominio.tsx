// Atalhos de Badge para os valores do domínio (padrão do GFD: um wrapper por variante).
import type { CategoriaNesc, PapelAtendente, TipoConsulta } from "@/types";
import { ROTULOS_TIPO_CONSULTA } from "@/utils/rotulos";
import { ROTULOS_SITUACAO_CONSULTA, type SituacaoConsulta } from "@/utils/situacao";
import type { VarianteBadge } from "./Badge";
import { Badge } from "./Badge";

export function BadgeTipoConsulta({ tipo }: { tipo: TipoConsulta }) {
  return <Badge variante={tipo === "retorno" ? "contorno" : "neutro"}>{ROTULOS_TIPO_CONSULTA[tipo]}</Badge>;
}

const VARIANTE_SITUACAO: Record<SituacaoConsulta, VarianteBadge> = {
  realizada: "primario",
  nao_realizada: "perigo",
  agendada: "acento",
};

/** Situação calculada por situacaoConsulta() (utils/situacao.ts). */
export function BadgeSituacaoConsulta({ situacao }: { situacao: SituacaoConsulta }) {
  return <Badge variante={VARIANTE_SITUACAO[situacao]}>{ROTULOS_SITUACAO_CONSULTA[situacao]}</Badge>;
}

export function BadgePapel({ papel }: { papel: PapelAtendente | null }) {
  if (papel === "estagiario") return <Badge>Estagiário</Badge>;
  if (papel === "profissional") return <Badge variante="primario">Profissional</Badge>;
  return null;
}

export function BadgeCategoriaNesc({ categoria }: { categoria: CategoriaNesc }) {
  return <Badge>{categoria}</Badge>;
}
