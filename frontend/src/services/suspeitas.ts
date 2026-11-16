import type { ParametrosLista, Suspeita, SuspeitaEntrada } from "@/types";
import { requisitar, segmento } from "./api";

export const suspeitasApi = {
  listar: (params?: ParametrosLista & { id_avaliacao?: number }) =>
    requisitar<Suspeita[]>("/suspeitas", { params }),
  buscar: (id: number) => requisitar<Suspeita>(`/suspeitas/${segmento(id)}`),
  criar: (dados: SuspeitaEntrada) =>
    requisitar<Suspeita>("/suspeitas", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<SuspeitaEntrada>) =>
    requisitar<Suspeita>(`/suspeitas/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/suspeitas/${segmento(id)}`, { metodo: "DELETE" }),
};
