import { Link } from "react-router-dom";
import { CrudSection, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { pacientesApi, segmento } from "@/services";
import type { Paciente, PacienteEntrada } from "@/types";
import { CAMPOS_PESSOA, colunasPessoa } from "./camposPessoa";

// O nome leva à ficha do paciente (contatos e medicamentos em uso).
const COLUNAS: ColunaTabela<Paciente>[] = colunasPessoa<Paciente>().map((coluna) =>
  coluna.titulo === "Nome"
    ? {
        ...coluna,
        valor: (p) => (
          <Link to={`/pacientes/${segmento(p.cpf)}`} className="font-medium text-primary-700 hover:underline">
            {p.nome}
          </Link>
        ),
      }
    : coluna,
);

export function PacientesPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Pacientes"
        descricao="Pessoas acompanhadas. Clique no nome para ver os contatos de emergência e os medicamentos em uso."
        nomeSingular="paciente"
        colunas={COLUNAS}
        chaveLinha={(p) => p.cpf}
        campos={CAMPOS_PESSOA}
        carregar={pacientesApi.listar}
        criar={(v) => pacientesApi.criar(v as unknown as PacienteEntrada)}
        atualizar={(p, v) => pacientesApi.atualizar(p.cpf, v)}
        excluir={(p) => pacientesApi.excluir(p.cpf)}
        descrever={(p) => `o paciente ${p.nome}, com seus contatos e medicamentos em uso`}
      />
    </MainLayout>
  );
}
