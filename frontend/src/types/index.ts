// Espelham os schemas de resposta do backend (backend/app/schemas/*_schema.py).
// Datas chegam como texto ISO ("2026-09-01").

export interface ParametrosLista {
  skip?: number;
  limit?: number;
}

export interface ErroApi {
  erro: string;
  codigo: string | null;
}

// Pessoas -----------------------------------------------------------------

export const SEXOS = ["M", "F"] as const;
export type Sexo = (typeof SEXOS)[number];

export interface Pessoa {
  cpf: string;
  nome: string;
  data_nasc: string;
  sexo: Sexo;
  telefone: string;
}

export type Paciente = Pessoa;

export interface ProfissionalSaude extends Pessoa {
  conselho: string;
  numero_registro: string;
  especialidade: string;
}

export interface Estagiario extends Pessoa {
  instituicao_ensino: string;
  curso: string;
}

/** CPF e nome, nas respostas que citam uma pessoa (paciente, atendente). */
export interface PessoaResumo {
  cpf: string;
  nome: string;
}

export interface ContatoEmergencia {
  cpf_paciente: string;
  nome: string;
  telefone: string;
  relacao: string;
}

// Medicamentos ------------------------------------------------------------

export interface Medicamento {
  id_medicamento: number;
  nome: string;
  forma_farmaceutica: string;
}

export interface UsoMedicamento {
  cpf_paciente: string;
  id_medicamento: number;
  dose: string;
  via_administracao: string;
  frequencia_uso: string;
  medicamento: Medicamento;
}

// Opções NESC -------------------------------------------------------------

export const CATEGORIAS_NESC = ["Necessidade", "Efetividade", "Segurança", "Cumprimento"] as const;
export type CategoriaNesc = (typeof CATEGORIAS_NESC)[number];

export const SUBTIPOS_NESC = ["quantitativo", "qualitativo", "outro"] as const;
export type SubtipoNesc = (typeof SUBTIPOS_NESC)[number];

export interface OpcaoNesc {
  id_opcao_nesc: number;
  categoria: CategoriaNesc;
  subtipo: SubtipoNesc;
  descricao: string;
}

// Consultas e avaliações --------------------------------------------------

export const TIPOS_CONSULTA = ["inicial", "retorno"] as const;
export type TipoConsulta = (typeof TIPOS_CONSULTA)[number];

/** Subclasse de PESSOA do atendente (trigger R2: profissional ou estagiário). */
export type PapelAtendente = "profissional" | "estagiario";

export interface AtendenteResumo extends PessoaResumo {
  papel: PapelAtendente | null;
}

/** Consulta como aparece dentro de uma avaliação (sem a avaliação de volta). */
export interface ConsultaBase {
  id_consulta: number;
  data_agendada: string;
  tipo: TipoConsulta;
  cpf_paciente: string;
  cpf_atendente: string;
  id_avaliacao_origem: number | null;
  paciente: PessoaResumo;
  atendente: AtendenteResumo;
}

export interface Consulta extends ConsultaBase {
  /** null: ainda não realizada (agendada). */
  avaliacao: { id_avaliacao: number; data_realizacao: string } | null;
}

export interface Avaliacao {
  id_avaliacao: number;
  id_consulta: number;
  data_realizacao: string;
  cpf_supervisor: string | null;
  consulta: ConsultaBase;
  supervisor: PessoaResumo | null;
}

// Suspeitas e intervenções ------------------------------------------------

export interface Suspeita {
  id_suspeita: number;
  data_registro: string;
  id_avaliacao: number;
  cpf_paciente: string;
  id_medicamento: number;
  id_opcao_nesc: number;
  medicamento: Medicamento;
  opcao_nesc: OpcaoNesc;
}

export const TIPOS_INTERVENCAO = [
  "encaminhamento",
  "prescrição",
  "orientação sobre medicamento",
  "orientação sobre doença",
  "medidas não farmacológicas",
] as const;
export type TipoIntervencao = (typeof TIPOS_INTERVENCAO)[number];

export interface Intervencao {
  id_intervencao: number;
  tipo: TipoIntervencao;
  descricao: string;
  id_suspeita: number;
}

// Corpos de POST: a resposta sem o id gerado e sem os dados aninhados.
// Os de PATCH são Partial<...> destes, sem os campos da chave.

export type MedicamentoEntrada = Omit<Medicamento, "id_medicamento">;
export type OpcaoNescEntrada = Omit<OpcaoNesc, "id_opcao_nesc">;
export type PacienteEntrada = Paciente;
export type ProfissionalSaudeEntrada = ProfissionalSaude;
export type EstagiarioEntrada = Estagiario;
export type ContatoEmergenciaEntrada = Omit<ContatoEmergencia, "cpf_paciente">;
export type UsoMedicamentoEntrada = Omit<UsoMedicamento, "cpf_paciente" | "medicamento">;
export type ConsultaEntrada = Omit<ConsultaBase, "id_consulta" | "paciente" | "atendente">;
export type AvaliacaoEntrada = Omit<Avaliacao, "id_avaliacao" | "consulta" | "supervisor">;
export type SuspeitaEntrada = Omit<Suspeita, "id_suspeita" | "medicamento" | "opcao_nesc">;
export type IntervencaoEntrada = Omit<Intervencao, "id_intervencao">;

// Relatórios ---------------------------------------------------------------

/** Resposta de /relatorios/*: o SQL que rodou no banco e as linhas do resultado. */
export interface Relatorio<Linha> {
  sql: string;
  linhas: Linha[];
}

export interface HistoricoPacienteLinha {
  id_consulta: number;
  data_agendada: string;
  tipo: TipoConsulta;
  atendente: string;
  id_avaliacao: number | null;
  data_realizacao: string | null;
  id_suspeita: number | null;
  medicamento: string | null;
  categoria_nesc: CategoriaNesc | null;
  problema: string | null;
}

export interface SuspeitasPorCategoriaLinha {
  categoria: CategoriaNesc;
  total: number;
}

export interface PacienteSemAvaliacaoLinha {
  cpf: string;
  nome: string;
  telefone: string;
  total_consultas: number;
}

export interface RetornoPendenteLinha {
  id_consulta: number;
  data_agendada: string;
  paciente: string;
  atendente: string;
  id_avaliacao_origem: number;
}

export interface AvaliacaoEstagiarioLinha {
  id_avaliacao: number;
  data_realizacao: string;
  paciente: string;
  estagiario: string;
  supervisor: string;
}

export interface MedicamentoMaisSuspeitasLinha {
  id_medicamento: number;
  nome: string;
  forma_farmaceutica: string;
  total_suspeitas: number;
}

export interface PacientePolifarmaciaLinha {
  cpf: string;
  nome: string;
  total_medicamentos: number;
  medicamentos: string;
}

export interface IntervencoesPorTipoLinha {
  tipo: TipoIntervencao;
  total: number;
}

export interface ResumoLinha {
  pacientes: number;
  consultas_sem_avaliacao: number;
  retornos_pendentes: number;
  suspeitas: number;
}

export interface ProximoAtendimentoLinha {
  id_consulta: number;
  data_agendada: string;
  tipo: TipoConsulta;
  paciente: string;
  atendente: string;
  papel_atendente: PapelAtendente;
}
