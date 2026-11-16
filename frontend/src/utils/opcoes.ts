// Opções dos selects, carregadas da API, para o usuário escolher em vez de digitar chaves.
// O backend aceita no máximo 200 itens por página.
import type { OpcaoSelect } from "@/components/atoms";
import {
  avaliacoesApi,
  consultasApi,
  estagiariosApi,
  medicamentosApi,
  opcoesNescApi,
  pacientesApi,
  profissionaisApi,
  suspeitasApi,
  usoMedicamentosApi,
} from "@/services";
import { formatarCpf, formatarData } from "./formatar";

const TODOS = { limit: 200 };

export const paraOpcoes = (valores: readonly string[]): OpcaoSelect[] =>
  valores.map((valor) => ({ valor, rotulo: valor }));

export async function opcoesPacientes(): Promise<OpcaoSelect[]> {
  const pacientes = await pacientesApi.listar(TODOS);
  return pacientes.map((p) => ({ valor: p.cpf, rotulo: `${p.nome} (${formatarCpf(p.cpf)})` }));
}

/** Atendente: profissional de saúde ou estagiário (trigger R2). */
export async function opcoesAtendentes(): Promise<OpcaoSelect[]> {
  const [profissionais, estagiarios] = await Promise.all([
    profissionaisApi.listar(TODOS),
    estagiariosApi.listar(TODOS),
  ]);
  return [
    ...profissionais.map((p) => ({ valor: p.cpf, rotulo: `${p.nome} — profissional` })),
    ...estagiarios.map((e) => ({ valor: e.cpf, rotulo: `${e.nome} — estagiário` })),
  ];
}

/** Supervisor: só profissionais de saúde (FK para PROFISSIONAL_SAUDE). */
export async function opcoesSupervisores(): Promise<OpcaoSelect[]> {
  const profissionais = await profissionaisApi.listar(TODOS);
  return profissionais.map((p) => ({ valor: p.cpf, rotulo: `${p.nome} (${p.conselho} ${p.numero_registro})` }));
}

export async function opcoesMedicamentos(): Promise<OpcaoSelect[]> {
  const medicamentos = await medicamentosApi.listar(TODOS);
  return medicamentos.map((m) => ({
    valor: String(m.id_medicamento),
    rotulo: `${m.nome} (${m.forma_farmaceutica})`,
  }));
}

export async function opcoesNesc(): Promise<OpcaoSelect[]> {
  const opcoes = await opcoesNescApi.listar(TODOS);
  return opcoes.map((o) => ({
    valor: String(o.id_opcao_nesc),
    rotulo: `${o.categoria} / ${o.subtipo} — ${o.descricao}`,
  }));
}

/** Consultas, marcando as que já têm avaliação (a 2ª avaliação daria 409 pelo UNIQUE). */
export async function opcoesConsultas(): Promise<OpcaoSelect[]> {
  const [consultas, avaliacoes] = await Promise.all([consultasApi.listar(TODOS), avaliacoesApi.listar(TODOS)]);
  const avaliadas = new Set(avaliacoes.map((a) => a.id_consulta));
  return consultas.map((c) => ({
    valor: String(c.id_consulta),
    rotulo:
      `#${c.id_consulta} · ${formatarData(c.data_agendada)} · ${c.paciente.nome} · ${c.tipo} · ` +
      `${c.atendente.nome}${avaliadas.has(c.id_consulta) ? " (já avaliada)" : ""}`,
  }));
}

export async function opcoesAvaliacoes(cpfPaciente?: string): Promise<OpcaoSelect[]> {
  const avaliacoes = await avaliacoesApi.listar({ ...TODOS, cpf_paciente: cpfPaciente });
  return avaliacoes.map((a) => ({
    valor: String(a.id_avaliacao),
    rotulo: `#${a.id_avaliacao} · ${formatarData(a.data_realizacao)} · ${a.consulta.paciente.nome}`,
  }));
}

/** Medicamentos que o paciente usa (a suspeita tem FK composta para USO_MEDICAMENTO). */
export async function opcoesUsosDoPaciente(cpf: string): Promise<OpcaoSelect[]> {
  const usos = await usoMedicamentosApi.listar(cpf, TODOS);
  return usos.map((u) => ({
    valor: String(u.id_medicamento),
    rotulo: `${u.medicamento.nome} (${u.medicamento.forma_farmaceutica}) — ${u.dose}, ${u.frequencia_uso}`,
  }));
}

export async function opcoesSuspeitas(): Promise<OpcaoSelect[]> {
  const suspeitas = await suspeitasApi.listar(TODOS);
  return suspeitas.map((s) => ({
    valor: String(s.id_suspeita),
    rotulo: `#${s.id_suspeita} · ${s.medicamento.nome} · ${s.opcao_nesc.categoria}: ${s.opcao_nesc.descricao} (avaliação #${s.id_avaliacao})`,
  }));
}
