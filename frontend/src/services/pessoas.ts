import type {
  Estagiario,
  EstagiarioEntrada,
  Paciente,
  PacienteEntrada,
  ParametrosLista,
  ProfissionalSaude,
  ProfissionalSaudeEntrada,
} from "@/types";
import { requisitar, segmento } from "./api";

// /pacientes, /profissionais e /estagiarios têm as mesmas rotas, com chave cpf.
// O cpf não muda no PATCH.
function apiDePessoa<T, E extends { cpf: string }>(base: string) {
  return {
    listar: (params?: ParametrosLista & { nome?: string }) => requisitar<T[]>(base, { params }),
    buscar: (cpf: string) => requisitar<T>(`${base}/${segmento(cpf)}`),
    criar: (dados: E) => requisitar<T>(base, { metodo: "POST", corpo: dados }),
    atualizar: (cpf: string, dados: Partial<Omit<E, "cpf">>) =>
      requisitar<T>(`${base}/${segmento(cpf)}`, { metodo: "PATCH", corpo: dados }),
    excluir: (cpf: string) => requisitar<void>(`${base}/${segmento(cpf)}`, { metodo: "DELETE" }),
  };
}

export const pacientesApi = apiDePessoa<Paciente, PacienteEntrada>("/pacientes");
export const profissionaisApi = apiDePessoa<ProfissionalSaude, ProfissionalSaudeEntrada>(
  "/profissionais",
);
export const estagiariosApi = apiDePessoa<Estagiario, EstagiarioEntrada>("/estagiarios");
