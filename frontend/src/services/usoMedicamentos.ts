import type { ParametrosLista, UsoMedicamento, UsoMedicamentoEntrada } from "@/types";
import { requisitar, segmento } from "./api";

// Relacionamento USA: a chave é cpf do paciente + id_medicamento.
const base = (cpf: string) => `/pacientes/${segmento(cpf)}/medicamentos`;

export const usoMedicamentosApi = {
  listar: (cpf: string, params?: ParametrosLista) =>
    requisitar<UsoMedicamento[]>(base(cpf), { params }),
  buscar: (cpf: string, idMedicamento: number) =>
    requisitar<UsoMedicamento>(`${base(cpf)}/${segmento(idMedicamento)}`),
  criar: (cpf: string, dados: UsoMedicamentoEntrada) =>
    requisitar<UsoMedicamento>(base(cpf), { metodo: "POST", corpo: dados }),
  atualizar: (
    cpf: string,
    idMedicamento: number,
    dados: Partial<Omit<UsoMedicamentoEntrada, "id_medicamento">>,
  ) =>
    requisitar<UsoMedicamento>(`${base(cpf)}/${segmento(idMedicamento)}`, {
      metodo: "PATCH",
      corpo: dados,
    }),
  excluir: (cpf: string, idMedicamento: number) =>
    requisitar<void>(`${base(cpf)}/${segmento(idMedicamento)}`, { metodo: "DELETE" }),
};
