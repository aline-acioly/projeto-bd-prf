import { useState } from "react";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import {
  ConfirmDialog,
  DataTable,
  ResourceForm,
  type CampoFormulario,
  type ColunaTabela,
  type ValoresFormulario,
} from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { useListaPaginada, useToast } from "@/hooks";
import { opcoesNescApi } from "@/services";
import { CATEGORIAS_NESC, SUBTIPOS_NESC, type OpcaoNesc, type OpcaoNescEntrada } from "@/types";

const paraOpcoes = (valores: readonly string[]) => valores.map((valor) => ({ valor, rotulo: valor }));

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

// null: formulário fechado; "novo": criando; OpcaoNesc: editando.
type Formulario = null | "novo" | OpcaoNesc;

export function OpcoesNescPage() {
  const toast = useToast();
  const lista = useListaPaginada(opcoesNescApi.listar);
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [excluindo, setExcluindo] = useState<OpcaoNesc | null>(null);
  const editando = formulario !== null && formulario !== "novo" ? formulario : null;

  async function salvar(valores: ValoresFormulario, alterados: ValoresFormulario) {
    if (editando) {
      if (Object.keys(alterados).length > 0) {
        await opcoesNescApi.atualizar(editando.id_opcao_nesc, alterados as Partial<OpcaoNescEntrada>);
        toast.sucesso("Opção NESC atualizada.");
      }
    } else {
      await opcoesNescApi.criar(valores as unknown as OpcaoNescEntrada);
      toast.sucesso("Opção NESC cadastrada.");
    }
    setFormulario(null);
    lista.recarregar();
  }

  async function excluir() {
    if (!excluindo) return;
    await opcoesNescApi.excluir(excluindo.id_opcao_nesc);
    toast.sucesso("Opção NESC excluída.");
    setExcluindo(null);
    lista.recarregar();
  }

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opções NESC</h1>
        <Button onClick={() => setFormulario("novo")}>Nova opção</Button>
      </div>

      <DataTable
        colunas={COLUNAS}
        linhas={lista.linhas}
        chaveLinha={(o) => o.id_opcao_nesc}
        carregando={lista.carregando}
        onEditar={(linha) => setFormulario(linha)}
        onExcluir={(linha) => setExcluindo(linha)}
        pagina={lista.pagina}
        temProxima={lista.temProxima}
        onMudarPagina={lista.setPagina}
      />

      <Modal
        aberto={formulario !== null}
        titulo={editando ? "Editar opção NESC" : "Nova opção NESC"}
        onFechar={() => setFormulario(null)}
      >
        <ResourceForm
          campos={CAMPOS}
          valoresIniciais={editando ?? {}}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      </Modal>

      <ConfirmDialog
        aberto={excluindo !== null}
        titulo="Excluir opção NESC"
        mensagem={`Excluir a opção "${excluindo?.descricao}"? Esta ação não pode ser desfeita.`}
        onConfirmar={excluir}
        onCancelar={() => setExcluindo(null)}
      />
    </MainLayout>
  );
}
