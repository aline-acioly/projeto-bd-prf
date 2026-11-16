// Situação da consulta em três estados:
//   com avaliação                                   → realizada
//   sem avaliação e data_agendada anterior a hoje   → não realizada
//   sem avaliação e data_agendada de hoje em diante → agendada
//
// -- Mesma regra em SQL:
// -- CASE WHEN A.id_avaliacao IS NOT NULL THEN 'Realizada'
// --      WHEN C.data_agendada < CURRENT_DATE THEN 'Não realizada'
// --      ELSE 'Agendada' END
// -- FROM CONSULTA C LEFT JOIN AVALIACAO A ON A.id_consulta = C.id_consulta
export type SituacaoConsulta = "realizada" | "nao_realizada" | "agendada";

export const ROTULOS_SITUACAO_CONSULTA: Record<SituacaoConsulta, string> = {
  realizada: "Realizada",
  nao_realizada: "Não realizada",
  agendada: "Agendada",
};

/** Data de hoje no fuso do navegador, no formato do banco ("2026-11-16"). */
export function hojeIso(): string {
  const agora = new Date();
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/** `dataAgendada` no formato ISO do banco; datas ISO se comparam como texto. */
export function situacaoConsulta(dataAgendada: string, temAvaliacao: boolean, hoje: string = hojeIso()): SituacaoConsulta {
  if (temAvaliacao) return "realizada";
  return dataAgendada < hoje ? "nao_realizada" : "agendada";
}
