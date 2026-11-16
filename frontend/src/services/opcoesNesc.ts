import type { CategoriaNesc, OpcaoNesc, OpcaoNescEntrada, ParametrosLista } from "@/types";
import { requisitar, segmento } from "./api";

export const opcoesNescApi = {
  listar: (params?: ParametrosLista & { categoria?: CategoriaNesc }) =>
    requisitar<OpcaoNesc[]>("/opcoes-nesc", { params }),
  buscar: (id: number) => requisitar<OpcaoNesc>(`/opcoes-nesc/${segmento(id)}`),
  criar: (dados: OpcaoNescEntrada) =>
    requisitar<OpcaoNesc>("/opcoes-nesc", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<OpcaoNescEntrada>) =>
    requisitar<OpcaoNesc>(`/opcoes-nesc/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/opcoes-nesc/${segmento(id)}`, { metodo: "DELETE" }),
};
