import { useCallback, useState } from "react";
import { Select } from "@/components/atoms";
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
    obrigatorio: true,
    numerico: true,
    visivel: (v) => v.tipo === "retorno",
    dependeDe: ["cpf_paciente"],
    carregarOpcoes: (v) => opcoesAvaliacoes(v.cpf_paciente),
  },
];

const COLUNAS: ColunaTabela<Consulta>[] = [
  { titulo: "ID", valor: (c) => c.id_consulta },
  { titulo: "Data", valor: (c) => formatarData(c.data_agendada) },
  {
    titulo: "Tipo",
    valor: (c) => (c.tipo === "retorno" ? `retorno (da avaliação #${c.id_avaliacao_origem})` : c.tipo),
  },
  { titulo: "Paciente", valor: (c) => c.paciente.nome },
  { titulo: "Atendente", valor: (c) => c.atendente.nome },
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
          <Select
            aria-label="Filtrar por tipo"
            className="w-44"
            opcoes={paraOpcoes(TIPOS_CONSULTA)}
            placeholder="Todos os tipos"
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value as TipoConsulta | "")}
          />
        }
      />
    </MainLayout>
  );
}
