import { BadgePapel, BadgeTipoConsulta } from "@/components/atoms";
import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { avaliacoesApi } from "@/services";
import type { Avaliacao, AvaliacaoEntrada } from "@/types";
import { formatarData, opcoesConsultas, opcoesSupervisores } from "@/utils";

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
    rotulo: "Supervisor",
    tipo: "select",
    ajuda: "Obrigatório se o atendente for estagiário; profissional não tem supervisor — regra R3.",
    carregarOpcoes: opcoesSupervisores,
    placeholder: "Sem supervisor",
  },
];

const COLUNAS: ColunaTabela<Avaliacao>[] = [
  { titulo: "ID", valor: (a) => a.id_avaliacao, mono: true },
  { titulo: "Realizada em", valor: (a) => formatarData(a.data_realizacao) },
  {
    titulo: "Consulta",
    valor: (a) => (
      <span className="inline-flex items-center gap-2">
        <span className="font-mono">#{a.id_consulta}</span>
        {formatarData(a.consulta.data_agendada)}
        <BadgeTipoConsulta tipo={a.consulta.tipo} />
      </span>
    ),
  },
  { titulo: "Paciente", valor: (a) => a.consulta.paciente.nome },
  {
    // "Estagiário · supervisão de <nome>" quando há supervisor (R3).
    titulo: "Atendente",
    valor: (a) => (
      <div>
        <div>{a.consulta.atendente.nome}</div>
        <div className="mt-1 text-xs leading-relaxed text-stone-600">
          <BadgePapel papel={a.consulta.atendente.papel} />
          {a.supervisor && <> · supervisão de {a.supervisor.nome}</>}
        </div>
      </div>
    ),
  },
];

export function AvaliacoesPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Avaliações"
        descricao="O registro de cada consulta realizada; as suspeitas de problemas com medicamentos partem daqui."
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
