import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms";
import { Modal, PageHeader } from "@/components/molecules";
import { useListaPaginada, useToast } from "@/hooks";
import type { ParametrosLista } from "@/types";
import { capitalizar } from "@/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import { DataTable, type ColunaTabela } from "./DataTable";
import { ResourceForm, type CampoFormulario, type ValoresFormulario } from "./ResourceForm";

interface CrudSectionProps<T> {
  titulo: string;
  /** Uma linha dizendo para que a página/seção serve. */
  descricao?: string;
  /** Em minúsculas: "medicamento", "opção NESC". Monta os textos de botões e avisos. */
  nomeSingular: string;
  feminino?: boolean;
  /** true: título h2, para seções dentro de uma página (ex.: contatos do paciente). */
  secao?: boolean;
  colunas: ColunaTabela<T>[];
  chaveLinha: (linha: T) => string | number;
  campos: CampoFormulario[];
  /** Precisa ser estável (função do services/ ou useCallback). */
  carregar: (params: ParametrosLista) => Promise<T[]>;
  /** Valores iniciais do formulário de criação (ex.: tipo "inicial"). */
  valoresNovos?: object;
  criar: (valores: ValoresFormulario) => Promise<unknown>;
  atualizar: (linha: T, alterados: ValoresFormulario) => Promise<unknown>;
  excluir: (linha: T) => Promise<unknown>;
  /** Como a linha aparece na confirmação de exclusão. */
  descrever: (linha: T) => string;
  /** Filtros mostrados ao lado do botão "Novo". */
  filtros?: ReactNode;
}

type EstadoFormulario<T> = null | { modo: "criar" } | { modo: "editar"; linha: T };

/** Lista paginada + formulário de criar/editar num modal + confirmação de exclusão. */
export function CrudSection<T>({
  titulo,
  descricao,
  nomeSingular,
  feminino,
  secao,
  colunas,
  chaveLinha,
  campos,
  carregar,
  valoresNovos,
  criar,
  atualizar,
  excluir,
  descrever,
  filtros,
}: CrudSectionProps<T>) {
  const toast = useToast();
  const lista = useListaPaginada(carregar);
  const [formulario, setFormulario] = useState<EstadoFormulario<T>>(null);
  const [excluindo, setExcluindo] = useState<{ linha: T } | null>(null);

  const novo = `${feminino ? "Nova" : "Novo"} ${nomeSingular}`;
  const botaoNovo = <Button onClick={() => setFormulario({ modo: "criar" })}>{capitalizar(novo)}</Button>;
  const finalizar = (verbo: string) => `${capitalizar(nomeSingular)} ${verbo}${feminino ? "a" : "o"}.`;

  async function salvar(valores: ValoresFormulario, alterados: ValoresFormulario) {
    if (formulario?.modo === "editar") {
      if (Object.keys(alterados).length > 0) {
        await atualizar(formulario.linha, alterados);
        toast.sucesso(finalizar("atualizad"));
      }
    } else {
      await criar(valores);
      toast.sucesso(finalizar("cadastrad"));
    }
    setFormulario(null);
    lista.recarregar();
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    await excluir(excluindo.linha);
    toast.sucesso(finalizar("excluíd"));
    setExcluindo(null);
    lista.recarregar();
  }

  return (
    <section className={secao ? "mt-8" : undefined}>
      {secao ? (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg">{titulo}</h2>
            {descricao && <p className="text-sm text-stone-600">{descricao}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {filtros}
            {botaoNovo}
          </div>
        </div>
      ) : (
        <PageHeader titulo={titulo} descricao={descricao}>
          {filtros}
          {botaoNovo}
        </PageHeader>
      )}

      <DataTable
        colunas={colunas}
        linhas={lista.linhas}
        chaveLinha={chaveLinha}
        carregando={lista.carregando}
        onEditar={(linha) => setFormulario({ modo: "editar", linha })}
        onExcluir={(linha) => setExcluindo({ linha })}
        pagina={lista.pagina}
        temProxima={lista.temProxima}
        tamanhoPagina={lista.tamanhoPagina}
        onMudarPagina={lista.setPagina}
      />

      <Modal
        aberto={formulario !== null}
        titulo={formulario?.modo === "editar" ? `Editar ${nomeSingular}` : capitalizar(novo)}
        onFechar={() => setFormulario(null)}
      >
        <ResourceForm
          campos={campos}
          modo={formulario?.modo}
          valoresIniciais={formulario?.modo === "editar" ? (formulario.linha as object) : (valoresNovos ?? {})}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      </Modal>

      <ConfirmDialog
        aberto={excluindo !== null}
        titulo={`Excluir ${nomeSingular}`}
        mensagem={excluindo ? `Excluir ${descrever(excluindo.linha)}? Esta ação não pode ser desfeita.` : ""}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </section>
  );
}
