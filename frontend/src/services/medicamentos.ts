import type { Medicamento, MedicamentoEntrada, ParametrosLista } from "@/types";
import { requisitar, segmento } from "./api";

export const medicamentosApi = {
  listar: (params?: ParametrosLista & { nome?: string }) =>
    requisitar<Medicamento[]>("/medicamentos", { params }),
  buscar: (id: number) => requisitar<Medicamento>(`/medicamentos/${segmento(id)}`),
  criar: (dados: MedicamentoEntrada) =>
    requisitar<Medicamento>("/medicamentos", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<MedicamentoEntrada>) =>
    requisitar<Medicamento>(`/medicamentos/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/medicamentos/${segmento(id)}`, { metodo: "DELETE" }),
};
