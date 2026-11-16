import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { opcoesNescApi } from "@/services";
import { CATEGORIAS_NESC, SUBTIPOS_NESC, type OpcaoNesc, type OpcaoNescEntrada } from "@/types";
import { paraOpcoes } from "@/utils";

const CAMPOS: CampoFormulario[] = [
  { nome: "categoria", rotulo: "Categoria", tipo: "select", obrigatorio: true, opcoes: paraOpcoes(CATEGORIAS_NESC) },
  { nome: "subtipo", rotulo: "Subtipo", tipo: "select", obrigatorio: true, opcoes: paraOpcoes(SUBTIPOS_NESC) },
  { nome: "descricao", rotulo: "Descrição", tipo: "text", obrigatorio: true },
];

const COLUNAS: ColunaTabela<OpcaoNesc>[] = [
  { titulo: "ID", valor: (o) => o.id_opcao_nesc },
  { titulo: "Categoria", valor: (o) => o.categoria },
  { titulo: "Subtipo", valor: (o) => o.subtipo },
  { titulo: "Descrição", valor: (o) => o.descricao },
];

export function OpcoesNescPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Opções NESC"
        nomeSingular="opção NESC"
        feminino
        colunas={COLUNAS}
        chaveLinha={(o) => o.id_opcao_nesc}
        campos={CAMPOS}
        carregar={opcoesNescApi.listar}
        criar={(v) => opcoesNescApi.criar(v as unknown as OpcaoNescEntrada)}
        atualizar={(o, v) => opcoesNescApi.atualizar(o.id_opcao_nesc, v as Partial<OpcaoNescEntrada>)}
        excluir={(o) => opcoesNescApi.excluir(o.id_opcao_nesc)}
        descrever={(o) => `a opção "${o.descricao}"`}
      />
    </MainLayout>
  );
}
