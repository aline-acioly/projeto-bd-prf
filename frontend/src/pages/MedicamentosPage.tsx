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
import { medicamentosApi } from "@/services";
import type { Medicamento, MedicamentoEntrada } from "@/types";

const CAMPOS: CampoFormulario[] = [
  { nome: "nome", rotulo: "Nome", tipo: "text", obrigatorio: true, maxLength: 150 },
  {
    nome: "forma_farmaceutica",
    rotulo: "Forma farmacêutica",
    tipo: "text",
    obrigatorio: true,
    maxLength: 50,
    placeholder: "comprimido, cápsula, solução...",
  },
];

const COLUNAS: ColunaTabela<Medicamento>[] = [
  { titulo: "ID", valor: (m) => m.id_medicamento },
  { titulo: "Nome", valor: (m) => m.nome },
  { titulo: "Forma farmacêutica", valor: (m) => m.forma_farmaceutica },
];

// null: formulário fechado; "novo": criando; Medicamento: editando.
type Formulario = null | "novo" | Medicamento;

export function MedicamentosPage() {
  const toast = useToast();
  const lista = useListaPaginada(medicamentosApi.listar);
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [excluindo, setExcluindo] = useState<Medicamento | null>(null);
  const editando = formulario !== null && formulario !== "novo" ? formulario : null;

  async function salvar(valores: ValoresFormulario, alterados: ValoresFormulario) {
    if (editando) {
      if (Object.keys(alterados).length > 0) {
        await medicamentosApi.atualizar(editando.id_medicamento, alterados as Partial<MedicamentoEntrada>);
        toast.sucesso("Medicamento atualizado.");
      }
    } else {
      await medicamentosApi.criar(valores as unknown as MedicamentoEntrada);
      toast.sucesso("Medicamento cadastrado.");
    }
    setFormulario(null);
    lista.recarregar();
  }

  async function excluir() {
    if (!excluindo) return;
    await medicamentosApi.excluir(excluindo.id_medicamento);
    toast.sucesso("Medicamento excluído.");
    setExcluindo(null);
    lista.recarregar();
  }

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicamentos</h1>
        <Button onClick={() => setFormulario("novo")}>Novo medicamento</Button>
      </div>

      <DataTable
        colunas={COLUNAS}
        linhas={lista.linhas}
        chaveLinha={(m) => m.id_medicamento}
        carregando={lista.carregando}
        onEditar={(linha) => setFormulario(linha)}
        onExcluir={(linha) => setExcluindo(linha)}
        pagina={lista.pagina}
        temProxima={lista.temProxima}
        onMudarPagina={lista.setPagina}
      />

      <Modal
        aberto={formulario !== null}
        titulo={editando ? "Editar medicamento" : "Novo medicamento"}
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
        titulo="Excluir medicamento"
        mensagem={`Excluir "${excluindo?.nome} (${excluindo?.forma_farmaceutica})"? Esta ação não pode ser desfeita.`}
        onConfirmar={excluir}
        onCancelar={() => setExcluindo(null)}
      />
    </MainLayout>
  );
}
