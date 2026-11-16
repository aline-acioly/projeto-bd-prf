import { CrudSection, type CampoFormulario } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { estagiariosApi } from "@/services";
import type { Estagiario, EstagiarioEntrada } from "@/types";
import { CAMPOS_PESSOA, colunasPessoa } from "./camposPessoa";

const CAMPOS: CampoFormulario[] = [
  ...CAMPOS_PESSOA,
  { nome: "instituicao_ensino", rotulo: "Instituição de ensino", tipo: "text", obrigatorio: true, maxLength: 150 },
  { nome: "curso", rotulo: "Curso", tipo: "text", obrigatorio: true, maxLength: 100 },
];

const COLUNAS = [
  ...colunasPessoa<Estagiario>(),
  { titulo: "Instituição", valor: (e: Estagiario) => e.instituicao_ensino },
  { titulo: "Curso", valor: (e: Estagiario) => e.curso },
];

export function EstagiariosPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Estagiários"
        nomeSingular="estagiário"
        colunas={COLUNAS}
        chaveLinha={(e) => e.cpf}
        campos={CAMPOS}
        carregar={estagiariosApi.listar}
        criar={(v) => estagiariosApi.criar(v as unknown as EstagiarioEntrada)}
        atualizar={(e, v) => estagiariosApi.atualizar(e.cpf, v)}
        excluir={(e) => estagiariosApi.excluir(e.cpf)}
        descrever={(e) => `o estagiário ${e.nome}`}
      />
    </MainLayout>
  );
}
