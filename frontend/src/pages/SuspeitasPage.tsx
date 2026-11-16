import { BadgeCategoriaNesc } from "@/components/atoms";
import { CrudSection, type CampoFormulario, type ColunaTabela, type TextosFormulario, type ValoresFormulario } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { avaliacoesApi, suspeitasApi } from "@/services";
import type { Suspeita, SuspeitaEntrada } from "@/types";
import { ROTULOS_SUBTIPO_NESC, capitalizar, formatarCpf, formatarData, opcoesAvaliacoes, opcoesNesc, opcoesUsosDoPaciente } from "@/utils";

/** O paciente da suspeita é o da consulta avaliada (trigger R4). */
async function pacienteDaAvaliacao(idAvaliacao: number | string): Promise<string> {
  const avaliacao = await avaliacoesApi.buscar(Number(idAvaliacao));
  return avaliacao.consulta.cpf_paciente;
}

const usosDoPacienteDaAvaliacao = async (v: TextosFormulario) =>
  opcoesUsosDoPaciente(await pacienteDaAvaliacao(v.id_avaliacao));

const CAMPOS: CampoFormulario[] = [
  {
    nome: "id_avaliacao",
    rotulo: "Avaliação",
    tipo: "select",
    obrigatorio: true,
    numerico: true,
    carregarOpcoes: () => opcoesAvaliacoes(),
  },
  {
    // Só os medicamentos que o paciente da avaliação usa (FK composta para USO_MEDICAMENTO).
    nome: "id_medicamento",
    rotulo: "Medicamento em uso",
    tipo: "select",
    ajuda: "Só os medicamentos que o paciente da avaliação usa — regra R4.",
    obrigatorio: true,
    numerico: true,
    dependeDe: ["id_avaliacao"],
    carregarOpcoes: usosDoPacienteDaAvaliacao,
  },
  { nome: "id_opcao_nesc", rotulo: "Problema (NESC)", tipo: "select", obrigatorio: true, numerico: true, carregarOpcoes: opcoesNesc },
  { nome: "data_registro", rotulo: "Data de registro", tipo: "date", obrigatorio: true },
];

const COLUNAS: ColunaTabela<Suspeita>[] = [
  { titulo: "ID", valor: (s) => s.id_suspeita, mono: true },
  { titulo: "Registro", valor: (s) => formatarData(s.data_registro) },
  { titulo: "Avaliação", valor: (s) => `#${s.id_avaliacao}`, mono: true },
  { titulo: "Paciente (CPF)", valor: (s) => formatarCpf(s.cpf_paciente), mono: true },
  { titulo: "Medicamento", valor: (s) => `${s.medicamento.nome} (${capitalizar(s.medicamento.forma_farmaceutica)})` },
  {
    titulo: "Problema (NESC)",
    valor: (s) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        <BadgeCategoriaNesc categoria={s.opcao_nesc.categoria} />
        <span>
          {ROTULOS_SUBTIPO_NESC[s.opcao_nesc.subtipo]}: {s.opcao_nesc.descricao}
        </span>
      </span>
    ),
  },
];

async function criar(v: ValoresFormulario) {
  const cpf_paciente = await pacienteDaAvaliacao(v.id_avaliacao as number);
  return suspeitasApi.criar({ ...(v as unknown as SuspeitaEntrada), cpf_paciente });
}

async function atualizar(s: Suspeita, v: ValoresFormulario) {
  const dados = { ...v } as Partial<SuspeitaEntrada>;
  // Trocou de avaliação: o paciente acompanha.
  if (dados.id_avaliacao !== undefined) dados.cpf_paciente = await pacienteDaAvaliacao(dados.id_avaliacao);
  return suspeitasApi.atualizar(s.id_suspeita, dados);
}

export function SuspeitasPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Suspeitas"
        descricao="Suspeitas de problema com um medicamento que o paciente usa, registradas numa avaliação."
        nomeSingular="suspeita"
        feminino
        colunas={COLUNAS}
        chaveLinha={(s) => s.id_suspeita}
        campos={CAMPOS}
        carregar={suspeitasApi.listar}
        criar={criar}
        atualizar={atualizar}
        excluir={(s) => suspeitasApi.excluir(s.id_suspeita)}
        descrever={(s) => `a suspeita #${s.id_suspeita} sobre ${s.medicamento.nome} (as intervenções vão junto)`}
      />
    </MainLayout>
  );
}
