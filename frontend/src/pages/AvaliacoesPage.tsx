import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { avaliacoesApi } from "@/services";
import type { Avaliacao, AvaliacaoEntrada } from "@/types";
import { formatarCpf, formatarData, opcoesConsultas, opcoesSupervisores } from "@/utils";

const CAMPOS: CampoFormulario[] = [
  {
    nome: "id_consulta",
    rotulo: "Consulta",
    tipo: "select",
    obrigatorio: true,
    numerico: true,
    fixoNaEdicao: true,
    carregarOpcoes: opcoesConsultas,
  },
  { nome: "data_realizacao", rotulo: "Data de realização", tipo: "date", obrigatorio: true },
  {
    // Trigger R3: obrigatório se o atendente é estagiário, proibido se é profissional.
    nome: "cpf_supervisor",
    rotulo: "Supervisor (só quando o atendente é estagiário)",
    tipo: "select",
    carregarOpcoes: opcoesSupervisores,
    placeholder: "Sem supervisor",
  },
];

const COLUNAS: ColunaTabela<Avaliacao>[] = [
  { titulo: "ID", valor: (a) => a.id_avaliacao },
  { titulo: "Realizada em", valor: (a) => formatarData(a.data_realizacao) },
  {
    titulo: "Consulta",
    valor: (a) => `#${a.id_consulta} · ${formatarData(a.consulta.data_agendada)} (${a.consulta.tipo})`,
  },
  { titulo: "Paciente", valor: (a) => a.consulta.paciente.nome },
  { titulo: "Atendente", valor: (a) => a.consulta.atendente.nome },
  { titulo: "Supervisor (CPF)", valor: (a) => formatarCpf(a.cpf_supervisor) },
];

export function AvaliacoesPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Avaliações"
        nomeSingular="avaliação"
        feminino
        colunas={COLUNAS}
        chaveLinha={(a) => a.id_avaliacao}
        campos={CAMPOS}
        carregar={avaliacoesApi.listar}
        criar={(v) => avaliacoesApi.criar(v as unknown as AvaliacaoEntrada)}
        atualizar={(a, v) => avaliacoesApi.atualizar(a.id_avaliacao, v as Partial<AvaliacaoEntrada>)}
        excluir={(a) => avaliacoesApi.excluir(a.id_avaliacao)}
        descrever={(a) => `a avaliação #${a.id_avaliacao} de ${a.consulta.paciente.nome} (as suspeitas e intervenções vão junto)`}
      />
    </MainLayout>
  );
}
