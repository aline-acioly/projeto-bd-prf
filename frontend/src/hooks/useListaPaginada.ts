import { useCallback, useEffect, useState } from "react";
import type { ParametrosLista } from "@/types";
import { mensagemDeErro } from "@/services";
import { useToast } from "./useToast";

/**
 * Carrega uma lista paginada da API. O backend devolve só a página (sem total),
 * então pede um item a mais para saber se existe a próxima página.
 * `carregar` precisa ser estável (função do services/ ou useCallback).
 */
export function useListaPaginada<T>(
  carregar: (params: ParametrosLista) => Promise<T[]>,
  tamanhoPagina = 10,
) {
  const toast = useToast();
  const [pagina, setPagina] = useState(0);
  const [linhas, setLinhas] = useState<T[]>([]);
  const [temProxima, setTemProxima] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    carregar({ skip: pagina * tamanhoPagina, limit: tamanhoPagina + 1 })
      .then((resultado) => {
        if (!ativo) return;
        // Ao excluir o último item de uma página, volta para a anterior.
        if (resultado.length === 0 && pagina > 0) {
          setPagina(pagina - 1);
          return;
        }
        setTemProxima(resultado.length > tamanhoPagina);
        setLinhas(resultado.slice(0, tamanhoPagina));
      })
      .catch((erro) => ativo && toast.erro(mensagemDeErro(erro)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [carregar, pagina, tamanhoPagina, versao, toast]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { linhas, pagina, setPagina, temProxima, carregando, recarregar, tamanhoPagina };
}
