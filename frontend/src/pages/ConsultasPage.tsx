import { useCallback, useState } from "react";
import { BadgePapel, BadgeStatusConsulta, BadgeTipoConsulta, Select } from "@/components/atoms";
import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { consultasApi } from "@/services";
import { TIPOS_CONSULTA, type Consulta, type ConsultaEntrada, type ParametrosLista, type TipoConsulta } from "@/types";
import { formatarData, opcoesAtendentes, opcoesAvaliacoes, opcoesPacientes, paraOpcoes } from "@/utils";

const CAMPOS: CampoFormulario[] = [
  { nome: "data_agendada", rotulo: "Data agendada", tipo: "date", obrigatorio: true },
  { nome: "tipo", rotulo: "Tipo", tipo: "select", obrigatorio: true, opcoes: paraOpcoes(TIPOS_CONSULTA) },
  { nome: "cpf_paciente", rotulo: "Paciente", tipo: "select", obrigatorio: true, carregarOpcoes: opcoesPacientes },
  {
    nome: "cpf_atendente",
    rotulo: "Atendente",
    tipo: "select",
    obrigatorio: true,
    carregarOpcoes: opcoesAtendentes,
  },
  {
    // Só no retorno (CHECK ck_consulta_origem). Lista as avaliações do paciente escolhido.
    nome: "id_avaliacao_origem",
    rotulo: "Avaliação de origem",
    tipo: "select",
    ajuda: "Só para retorno; precisa ser do mesmo paciente — regra R2.",
    obrigatorio: true,
    numerico: true,
    visivel: (v) => v.tipo === "retorno",
    dependeDe: ["cpf_paciente"],
    carregarOpcoes: (v) => opcoesAvaliacoes(v.cpf_paciente),
  },
];

const COLUNAS: ColunaTabela<Consulta>[] = [
  { titulo: "ID", valor: (c) => c.id_consulta, mono: true },
  { titulo: "Data", valor: (c) => formatarData(c.data_agendada) },
  {
    titulo: "Tipo",
    valor: (c) => (
      <span className="inline-flex items-center gap-2">
        <BadgeTipoConsulta tipo={c.tipo} />
        {c.tipo === "retorno" && (
          <span className="whitespace-nowrap text-xs text-stone-500">
            da avaliação <span className="font-mono">#{c.id_avaliacao_origem}</span>
          </span>
        )}
      </span>
    ),
  },
  { titulo: "Situação", valor: (c) => <BadgeStatusConsulta realizada={c.avaliacao !== null} /> },
  { titulo: "Paciente", valor: (c) => c.paciente.nome },
  {
    titulo: "Atendente",
    valor: (c) => (
      <span className="inline-flex items-center gap-2">
        {c.atendente.nome}
        <BadgePapel papel={c.atendente.papel} />
      </span>
    ),
  },
];

export function ConsultasPage() {
  const [tipo, setTipo] = useState<TipoConsulta | "">("");
  const carregar = useCallback(
    (params: ParametrosLista) => consultasApi.listar({ ...params, tipo: tipo || undefined }),
    [tipo],
  );

  return (
    <MainLayout>
      <CrudSection
        // Trocar o filtro recria a seção e volta para a página 1.
        key={tipo}
        titulo="Consultas"
        descricao="Atendimentos agendados e realizados. Uma consulta é realizada quando recebe a avaliação."
        nomeSingular="consulta"
        feminino
        colunas={COLUNAS}
        chaveLinha={(c) => c.id_consulta}
        campos={CAMPOS}
        carregar={carregar}
        valoresNovos={{ tipo: "inicial" }}
        criar={(v) => consultasApi.criar(v as unknown as ConsultaEntrada)}
        atualizar={(c, v) => consultasApi.atualizar(c.id_consulta, v as Partial<ConsultaEntrada>)}
        excluir={(c) => consultasApi.excluir(c.id_consulta)}
        descrever={(c) => `a consulta #${c.id_consulta} de ${c.paciente.nome} (a avaliação dela vai junto)`}
        filtros={
          <div className="w-44">
            <Select
              aria-label="Filtrar por tipo"
              opcoes={paraOpcoes(TIPOS_CONSULTA)}
              placeholder="Todos os tipos"
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value as TipoConsulta | "")}
            />
          </div>
        }
      />
    </MainLayout>
  );
}
