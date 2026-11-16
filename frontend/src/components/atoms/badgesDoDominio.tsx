// Atalhos de Badge para os valores do domínio (padrão do GFD: um wrapper por variante).
import type { CategoriaNesc, PapelAtendente, TipoConsulta } from "@/types";
import { ROTULOS_TIPO_CONSULTA } from "@/utils/rotulos";
import { Badge } from "./Badge";

export function BadgeTipoConsulta({ tipo }: { tipo: TipoConsulta }) {
  return <Badge variante={tipo === "retorno" ? "contorno" : "neutro"}>{ROTULOS_TIPO_CONSULTA[tipo]}</Badge>;
}

/** Realizada: a consulta já tem avaliação. Agendada: ainda não. */
export function BadgeStatusConsulta({ realizada }: { realizada: boolean }) {
  return realizada ? <Badge variante="primario">Realizada</Badge> : <Badge variante="acento">Agendada</Badge>;
}

export function BadgePapel({ papel }: { papel: PapelAtendente | null }) {
  if (papel === "estagiario") return <Badge>Estagiário</Badge>;
  if (papel === "profissional") return <Badge variante="primario">Profissional</Badge>;
  return null;
}

export function BadgeCategoriaNesc({ categoria }: { categoria: CategoriaNesc }) {
  return <Badge>{categoria}</Badge>;
}
