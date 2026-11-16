import type { ReactNode } from "react";
import { Button } from "@/components/atoms";

const CLASSES_TH = "px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500";

export interface ColunaTabela<T> {
  titulo: string;
  valor: (linha: T) => ReactNode;
  /** Fonte mono e números alinhados: CPF, ids e valores numéricos. */
  mono?: boolean;
}

interface DataTableProps<T> {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  chaveLinha: (linha: T) => string | number;
  carregando?: boolean;
  onEditar?: (linha: T) => void;
  onExcluir?: (linha: T) => void;
  /** Página atual, começando em 0. Sem onMudarPagina, a tabela não mostra a paginação. */
  pagina?: number;
  /** Itens por página, para o "Mostrando início–fim". */
  tamanhoPagina?: number;
  temProxima?: boolean;
  onMudarPagina?: (pagina: number) => void;
  mensagemVazia?: string;
}

export function DataTable<T>({
  colunas,
  linhas,
  chaveLinha,
  carregando,
  onEditar,
  onExcluir,
  pagina = 0,
  tamanhoPagina = 10,
  temProxima = false,
  onMudarPagina,
  mensagemVazia = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  const temAcoes = Boolean(onEditar || onExcluir);
  const totalColunas = colunas.length + (temAcoes ? 1 : 0);
  const inicio = pagina * tamanhoPagina + 1;
  const fim = pagina * tamanhoPagina + linhas.length;
  const umaPaginaSo = pagina === 0 && !temProxima;

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            <tr>
              {colunas.map(({ titulo }) => (
                <th key={titulo} scope="col" className={CLASSES_TH}>
                  {titulo}
                </th>
              ))}
              {temAcoes && (
                <th scope="col" className={`${CLASSES_TH} text-right`}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {carregando ? (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-8 text-center text-stone-500">
                  Carregando...
                </td>
              </tr>
            ) : linhas.length === 0 ? (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-8 text-center text-stone-500">
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              linhas.map((linha) => (
                <tr key={chaveLinha(linha)} className="hover:bg-stone-50">
                  {colunas.map(({ titulo, valor, mono }) => (
                    <td
                      key={titulo}
                      className={`px-4 py-2.5 text-stone-800 ${mono ? "font-mono tabular-nums" : ""}`}
                    >
                      {valor(linha)}
                    </td>
                  ))}
                  {temAcoes && (
                    <td className="whitespace-nowrap px-4 py-1.5 text-right">
                      <div className="inline-flex gap-1">
                        {onEditar && (
                          <Button variante="texto" onClick={() => onEditar(linha)}>
                            Editar
                          </Button>
                        )}
                        {onExcluir && (
                          <Button variante="textoPerigo" onClick={() => onExcluir(linha)}>
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onMudarPagina && (
        <div className="flex min-h-[3rem] items-center justify-between border-t border-stone-200 px-4 py-2 text-sm">
          <span className="text-stone-600">
            {linhas.length > 0 && (
              <>
                Mostrando{" "}
                <span className="font-mono tabular-nums">
                  {inicio}–{fim}
                </span>
              </>
            )}
          </span>
          {/* Com uma página só, Anterior/Próxima não têm o que fazer. */}
          {!umaPaginaSo && (
            <div className="flex gap-2">
              <Button
                variante="secundario"
                className="px-3 py-1"
                disabled={carregando || pagina === 0}
                onClick={() => onMudarPagina(pagina - 1)}
              >
                Anterior
              </Button>
              <Button
                variante="secundario"
                className="px-3 py-1"
                disabled={carregando || !temProxima}
                onClick={() => onMudarPagina(pagina + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
