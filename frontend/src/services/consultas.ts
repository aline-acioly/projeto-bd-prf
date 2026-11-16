import type { Consulta, ConsultaEntrada, ParametrosLista, TipoConsulta } from "@/types";
import { requisitar, segmento } from "./api";

export const consultasApi = {
  listar: (params?: ParametrosLista & { tipo?: TipoConsulta; cpf_paciente?: string }) =>
    requisitar<Consulta[]>("/consultas", { params }),
  buscar: (id: number) => requisitar<Consulta>(`/consultas/${segmento(id)}`),
  criar: (dados: ConsultaEntrada) =>
    requisitar<Consulta>("/consultas", { metodo: "POST", corpo: dados }),
  atualizar: (id: number, dados: Partial<ConsultaEntrada>) =>
    requisitar<Consulta>(`/consultas/${segmento(id)}`, { metodo: "PATCH", corpo: dados }),
  excluir: (id: number) => requisitar<void>(`/consultas/${segmento(id)}`, { metodo: "DELETE" }),
};
