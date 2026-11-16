import type {
  AvaliacaoEstagiarioLinha,
  HistoricoPacienteLinha,
  IntervencoesPorTipoLinha,
  MedicamentoMaisSuspeitasLinha,
  PacientePolifarmaciaLinha,
  PacienteSemAvaliacaoLinha,
  Relatorio,
  RetornoPendenteLinha,
  SuspeitasPorCategoriaLinha,
} from "@/types";
import { requisitar, segmento } from "./api";

const base = "/relatorios";

export const relatoriosApi = {
  historicoPaciente: (cpf: string) =>
    requisitar<Relatorio<HistoricoPacienteLinha>>(`${base}/historico-paciente/${segmento(cpf)}`),
  suspeitasPorCategoria: () => requisitar<Relatorio<SuspeitasPorCategoriaLinha>>(`${base}/suspeitas-por-categoria`),
  pacientesSemAvaliacao: () => requisitar<Relatorio<PacienteSemAvaliacaoLinha>>(`${base}/pacientes-sem-avaliacao`),
  retornosPendentes: () => requisitar<Relatorio<RetornoPendenteLinha>>(`${base}/retornos-pendentes`),
  avaliacoesEstagiarios: () => requisitar<Relatorio<AvaliacaoEstagiarioLinha>>(`${base}/avaliacoes-estagiarios`),
  medicamentosMaisSuspeitas: () =>
    requisitar<Relatorio<MedicamentoMaisSuspeitasLinha>>(`${base}/medicamentos-mais-suspeitas`),
  pacientesPolifarmacia: () => requisitar<Relatorio<PacientePolifarmaciaLinha>>(`${base}/pacientes-polifarmacia`),
  intervencoesPorTipo: () => requisitar<Relatorio<IntervencoesPorTipoLinha>>(`${base}/intervencoes-por-tipo`),
};
