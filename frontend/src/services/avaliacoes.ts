import type { Avaliacao, AvaliacaoEntrada, ParametrosLista } from "@/types";
import { requisitar, segmento } from "./api";

export const avaliacoesApi = {
  listar: (params?: ParametrosLista & { cpf_paciente?: string }) =>
    requisitar<Avaliacao[]>("/avaliacoes", { params }),
  buscar: (id: number) => requisitar<Avaliacao>(`/avaliacoes/${segmento(id)}`),
  criar: (dados: AvaliacaoEntrada) =>
    requisitar<Avaliacao>("/avaliacoes", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<AvaliacaoEntrada>) =>
    requisitar<Avaliacao>(`/avaliacoes/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/avaliacoes/${segmento(id)}`, { metodo: "DELETE" }),
};
