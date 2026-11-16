import type { Intervencao, IntervencaoEntrada, ParametrosLista } from "@/types";
import { requisitar, segmento } from "./api";

export const intervencoesApi = {
  listar: (params?: ParametrosLista & { id_suspeita?: number }) =>
    requisitar<Intervencao[]>("/intervencoes", { params }),
  buscar: (id: number) => requisitar<Intervencao>(`/intervencoes/${segmento(id)}`),
  criar: (dados: IntervencaoEntrada) =>
    requisitar<Intervencao>("/intervencoes", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<IntervencaoEntrada>) =>
    requisitar<Intervencao>(`/intervencoes/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/intervencoes/${segmento(id)}`, { metodo: "DELETE" }),
};
