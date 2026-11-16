import type { ContatoEmergencia, ContatoEmergenciaEntrada, ParametrosLista } from "@/types";
import { requisitar, segmento } from "./api";

// Entidade fraca: a chave é cpf do paciente + nome (codificado na URL).
const base = (cpf: string) => `/pacientes/${segmento(cpf)}/contatos`;

export const contatosApi = {
  listar: (cpf: string, params?: ParametrosLista) =>
    requisitar<ContatoEmergencia[]>(base(cpf), { params }),
  buscar: (cpf: string, nome: string) =>
    requisitar<ContatoEmergencia>(`${base(cpf)}/${segmento(nome)}`),
  criar: (cpf: string, dados: ContatoEmergenciaEntrada) =>
    requisitar<ContatoEmergencia>(base(cpf), { metodo: "POST", corpo: dados }),
  atualizar: (cpf: string, nome: string, dados: Partial<Omit<ContatoEmergenciaEntrada, "nome">>) =>
    requisitar<ContatoEmergencia>(`${base(cpf)}/${segmento(nome)}`, {
      metodo: "PATCH",
      corpo: dados,
    }),
  excluir: (cpf: string, nome: string) =>
    requisitar<void>(`${base(cpf)}/${segmento(nome)}`, { metodo: "DELETE" }),
};
