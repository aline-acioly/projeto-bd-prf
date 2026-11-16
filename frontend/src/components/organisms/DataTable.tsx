import type { ReactNode } from "react";
import { Button } from "@/components/atoms";

export interface ColunaTabela<T> {
  titulo: string;
  valor: (linha: T) => ReactNode;
}

interface DataTableProps<T> {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  chaveLinha: (linha: T) => string | number;
  carregando?: boolean;
  onEditar?: (linha: T) => void;
  onExcluir?: (linha: T) => void;
  /** Página atual, começando em 0. */
  pagina: number;
  temProxima: boolean;
  onMudarPagina: (pagina: number) => void;
  mensagemVazia?: string;
}

export function DataTable<T>({
  colunas,
  linhas,
  chaveLinha,
  carregando,
  onEditar,
  onExcluir,
  pagina,
  temProxima,
  onMudarPagina,
  mensagemVazia = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  const temAcoes = Boolean(onEditar || onExcluir);
  const totalColunas = colunas.length + (temAcoes ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {colunas.map(({ titulo }) => (
                <th key={titulo} scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">
                  {titulo}
                </th>
              ))}
              {temAcoes && (
                <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carregando ? (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-8 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : linhas.length === 0 ? (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-8 text-center text-gray-500">
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              linhas.map((linha) => (
                <tr key={chaveLinha(linha)} className="hover:bg-gray-50">
                  {colunas.map(({ titulo, valor }) => (
                    <td key={titulo} className="px-4 py-3 text-gray-800">
                      {valor(linha)}
                    </td>
                  ))}
                  {temAcoes && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {onEditar && (
                          <Button variante="secundario" className="px-3 py-1" onClick={() => onEditar(linha)}>
                            Editar
                          </Button>
                        )}
                        {onExcluir && (
                          <Button variante="perigo" className="px-3 py-1" onClick={() => onExcluir(linha)}>
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
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
        <span className="text-gray-600">Página {pagina + 1}</span>
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
      </div>
    </div>
  );
}
