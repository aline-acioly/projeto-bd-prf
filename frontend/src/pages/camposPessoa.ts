// Campos e colunas de PESSOA, comuns a pacientes, profissionais e estagiários.
import type { CampoFormulario, ColunaTabela } from "@/components/organisms";
import type { Pessoa } from "@/types";
import { formatarCpf, formatarData } from "@/utils";

export const CAMPOS_PESSOA: CampoFormulario[] = [
  { nome: "cpf", rotulo: "CPF", tipo: "text", obrigatorio: true, fixoNaEdicao: true, maxLength: 11, placeholder: "Só os 11 números" },
  { nome: "nome", rotulo: "Nome", tipo: "text", obrigatorio: true, maxLength: 150 },
  { nome: "data_nasc", rotulo: "Data de nascimento", tipo: "date", obrigatorio: true },
  {
    nome: "sexo",
    rotulo: "Sexo",
    tipo: "select",
    obrigatorio: true,
    opcoes: [
      { valor: "F", rotulo: "Feminino" },
      { valor: "M", rotulo: "Masculino" },
    ],
  },
  { nome: "telefone", rotulo: "Telefone", tipo: "text", obrigatorio: true, maxLength: 20 },
];

export function colunasPessoa<T extends Pessoa>(): ColunaTabela<T>[] {
  return [
    { titulo: "Nome", valor: (p) => p.nome },
    { titulo: "CPF", valor: (p) => formatarCpf(p.cpf) },
    { titulo: "Nascimento", valor: (p) => formatarData(p.data_nasc) },
    { titulo: "Sexo", valor: (p) => p.sexo },
    { titulo: "Telefone", valor: (p) => p.telefone },
  ];
}
