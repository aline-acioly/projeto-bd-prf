import { useCallback, useEffect, useState } from "react";
import { Select, type OpcaoSelect } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import { RelatorioSection, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { useToast } from "@/hooks";
import { mensagemDeErro, relatoriosApi } from "@/services";
import type {
  AvaliacaoEstagiarioLinha,
  HistoricoPacienteLinha,
  IntervencoesPorTipoLinha,
  MedicamentoMaisSuspeitasLinha,
  PacientePolifarmaciaLinha,
  PacienteSemAvaliacaoLinha,
  RetornoPendenteLinha,
  SuspeitasPorCategoriaLinha,
} from "@/types";
import { formatarCpf, formatarData, formatarTelefone, opcoesPacientes } from "@/utils";

// Nas tabelas de relatório a célula traz só o valor que o SQL devolveu, sem componentes
// (badges etc.) nem rótulos; só data, CPF e telefone são formatados.
const ou = (valor: string | number | null) => (valor === null ? "—" : valor);

const COLUNAS_HISTORICO: ColunaTabela<HistoricoPacienteLinha>[] = [
  { titulo: "Consulta", valor: (l) => `#${l.id_consulta}`, mono: true },
  { titulo: "Data", valor: (l) => formatarData(l.data_agendada) },
    { titulo: "Tipo", valor: (l) => l.tipo },
  { titulo: "Atendente", valor: (l) => l.atendente },
  { titulo: "Avaliação", valor: (l) => (l.id_avaliacao === null ? "—" : `#${l.id_avaliacao} · ${formatarData(l.data_realizacao)}`) },
  { titulo: "Medicamento suspeito", valor: (l) => ou(l.medicamento) },
  { titulo: "Categoria NESC", valor: (l) => ou(l.categoria_nesc) },
  { titulo: "Problema", valor: (l) => ou(l.problema) },
];

const COLUNAS_CATEGORIA: ColunaTabela<SuspeitasPorCategoriaLinha>[] = [
  { titulo: "Categoria NESC", valor: (l) => l.categoria },
  { titulo: "Suspeitas", valor: (l) => l.total, mono: true },
];

const COLUNAS_SEM_AVALIACAO: ColunaTabela<PacienteSemAvaliacaoLinha>[] = [
  { titulo: "Paciente", valor: (l) => l.nome },
  { titulo: "CPF", valor: (l) => formatarCpf(l.cpf), mono: true },
  { titulo: "Telefone", valor: (l) => formatarTelefone(l.telefone), mono: true },
  { titulo: "Consultas agendadas", valor: (l) => l.total_consultas, mono: true },
];

const COLUNAS_RETORNOS: ColunaTabela<RetornoPendenteLinha>[] = [
  { titulo: "Consulta", valor: (l) => `#${l.id_consulta}`, mono: true },
  { titulo: "Data agendada", valor: (l) => formatarData(l.data_agendada) },
  { titulo: "Paciente", valor: (l) => l.paciente },
  { titulo: "Atendente", valor: (l) => l.atendente },
  { titulo: "Avaliação de origem", valor: (l) => `#${l.id_avaliacao_origem}`, mono: true },
];

const COLUNAS_ESTAGIARIOS: ColunaTabela<AvaliacaoEstagiarioLinha>[] = [
  { titulo: "Avaliação", valor: (l) => `#${l.id_avaliacao}`, mono: true },
  { titulo: "Data", valor: (l) => formatarData(l.data_realizacao) },
  { titulo: "Paciente", valor: (l) => l.paciente },
  { titulo: "Estagiário", valor: (l) => l.estagiario },
  { titulo: "Supervisor", valor: (l) => l.supervisor },
];

const COLUNAS_MAIS_SUSPEITAS: ColunaTabela<MedicamentoMaisSuspeitasLinha>[] = [
  { titulo: "Medicamento", valor: (l) => `${l.nome} (${l.forma_farmaceutica})` },
  { titulo: "Suspeitas", valor: (l) => l.total_suspeitas, mono: true },
];

const COLUNAS_POLIFARMACIA: ColunaTabela<PacientePolifarmaciaLinha>[] = [
  { titulo: "Paciente", valor: (l) => l.nome },
  { titulo: "CPF", valor: (l) => formatarCpf(l.cpf), mono: true },
  { titulo: "Medicamentos em uso", valor: (l) => l.total_medicamentos, mono: true },
  { titulo: "Quais", valor: (l) => l.medicamentos },
];

const COLUNAS_INTERVENCOES: ColunaTabela<IntervencoesPorTipoLinha>[] = [
  { titulo: "Tipo", valor: (l) => l.tipo },
  { titulo: "Intervenções", valor: (l) => l.total, mono: true },
];

export function RelatoriosPage() {
  const toast = useToast();
  const [pacientes, setPacientes] = useState<OpcaoSelect[]>([]);
  const [cpf, setCpf] = useState("");

  // Começa com o primeiro paciente escolhido, para o histórico (e o SQL) já aparecerem.
  useEffect(() => {
    opcoesPacientes()
      .then((opcoes) => {
        setPacientes(opcoes);
        setCpf((atual) => atual || opcoes[0]?.valor || "");
      })
      .catch((erro) => toast.erro(mensagemDeErro(erro)));
  }, [toast]);

  const carregarHistorico = useCallback(() => relatoriosApi.historicoPaciente(cpf), [cpf]);

  return (
    <MainLayout>
      <PageHeader
        titulo="Relatórios"
        descricao={'Consultas escritas em SQL puro no backend. Abra "Ver SQL" embaixo de cada tabela para ver o comando executado.'}
      />

      <RelatorioSection
        titulo="Histórico do paciente"
        descricao="Consultas, avaliações e suspeitas do paciente (JOIN e LEFT JOIN: consulta sem avaliação também aparece)."
        colunas={COLUNAS_HISTORICO}
        chaveLinha={(l) => `${l.id_consulta}-${l.id_suspeita ?? "sem"}`}
        carregar={cpf ? carregarHistorico : null}
        aguardando="Escolha um paciente."
        mensagemVazia="Este paciente ainda não tem consultas."
        filtros={
          <div className="w-80">
            <Select
              aria-label="Paciente do histórico"
              opcoes={pacientes}
              placeholder="Escolha um paciente"
              value={cpf}
              onChange={(evento) => setCpf(evento.target.value)}
            />
          </div>
        }
      />
      <RelatorioSection
        titulo="Suspeitas por categoria NESC"
        descricao="Quantas suspeitas há em cada categoria (GROUP BY + COUNT)."
        colunas={COLUNAS_CATEGORIA}
        chaveLinha={(l) => l.categoria}
        carregar={relatoriosApi.suspeitasPorCategoria}
      />
      <RelatorioSection
        titulo="Pacientes sem avaliação"
        descricao="Pacientes que nunca tiveram uma consulta avaliada (NOT EXISTS)."
        colunas={COLUNAS_SEM_AVALIACAO}
        chaveLinha={(l) => l.cpf}
        carregar={relatoriosApi.pacientesSemAvaliacao}
      />
      <RelatorioSection
        titulo="Retornos pendentes"
        descricao="Consultas de retorno que ainda não têm avaliação (NOT EXISTS)."
        colunas={COLUNAS_RETORNOS}
        chaveLinha={(l) => l.id_consulta}
        carregar={relatoriosApi.retornosPendentes}
      />
      <RelatorioSection
        titulo="Avaliações feitas por estagiários"
        descricao="Estagiário e supervisor de cada avaliação (PESSOA aparece com um alias para cada papel)."
        colunas={COLUNAS_ESTAGIARIOS}
        chaveLinha={(l) => l.id_avaliacao}
        carregar={relatoriosApi.avaliacoesEstagiarios}
      />
      <RelatorioSection
        titulo="Medicamentos com mais suspeitas"
        descricao="O(s) medicamento(s) com o maior número de suspeitas; empates aparecem todos (HAVING + >= ALL)."
        colunas={COLUNAS_MAIS_SUSPEITAS}
        chaveLinha={(l) => l.id_medicamento}
        carregar={relatoriosApi.medicamentosMaisSuspeitas}
      />
      <RelatorioSection
        titulo="Pacientes em polifarmácia"
        descricao="Pacientes com mais de um medicamento em uso (GROUP BY + HAVING)."
        colunas={COLUNAS_POLIFARMACIA}
        chaveLinha={(l) => l.cpf}
        carregar={relatoriosApi.pacientesPolifarmacia}
      />
      <RelatorioSection
        titulo="Intervenções por tipo"
        descricao="Quantas intervenções de cada tipo, da mais comum para a menos (GROUP BY + ORDER BY)."
        colunas={COLUNAS_INTERVENCOES}
        chaveLinha={(l) => l.tipo}
        carregar={relatoriosApi.intervencoesPorTipo}
      />
    </MainLayout>
  );
}
