import { CrudSection, type CampoFormulario } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { profissionaisApi } from "@/services";
import type { ProfissionalSaude, ProfissionalSaudeEntrada } from "@/types";
import { CAMPOS_PESSOA, colunasPessoa } from "./camposPessoa";

const CAMPOS: CampoFormulario[] = [
  ...CAMPOS_PESSOA,
  { nome: "conselho", rotulo: "Conselho", tipo: "text", obrigatorio: true, maxLength: 10, placeholder: "CRF, CRM..." },
  { nome: "numero_registro", rotulo: "Número de registro", tipo: "text", obrigatorio: true, maxLength: 20 },
  { nome: "especialidade", rotulo: "Especialidade", tipo: "text", obrigatorio: true, maxLength: 100 },
];

const COLUNAS = [
  ...colunasPessoa<ProfissionalSaude>(),
  { titulo: "Registro", valor: (p: ProfissionalSaude) => `${p.conselho} ${p.numero_registro}`, mono: true },
  { titulo: "Especialidade", valor: (p: ProfissionalSaude) => p.especialidade },
];

export function ProfissionaisPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Profissionais de saúde"
        descricao="Profissionais de saúde: atendem consultas e supervisionam as avaliações feitas por estagiários."
        nomeSingular="profissional"
        colunas={COLUNAS}
        chaveLinha={(p) => p.cpf}
        campos={CAMPOS}
        carregar={profissionaisApi.listar}
        criar={(v) => profissionaisApi.criar(v as unknown as ProfissionalSaudeEntrada)}
        atualizar={(p, v) => profissionaisApi.atualizar(p.cpf, v)}
        excluir={(p) => profissionaisApi.excluir(p.cpf)}
        descrever={(p) => `o profissional ${p.nome}`}
      />
    </MainLayout>
  );
}
