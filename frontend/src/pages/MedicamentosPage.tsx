import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { medicamentosApi } from "@/services";
import type { Medicamento, MedicamentoEntrada } from "@/types";
import { capitalizar } from "@/utils";

const CAMPOS: CampoFormulario[] = [
  { nome: "nome", rotulo: "Nome", tipo: "text", obrigatorio: true, maxLength: 150 },
  {
    nome: "forma_farmaceutica",
    rotulo: "Forma farmacêutica",
    tipo: "text",
    obrigatorio: true,
    maxLength: 50,
    placeholder: "comprimido, cápsula, solução...",
  },
];

const COLUNAS: ColunaTabela<Medicamento>[] = [
  { titulo: "ID", valor: (m) => m.id_medicamento, mono: true },
  { titulo: "Nome", valor: (m) => m.nome },
  { titulo: "Forma farmacêutica", valor: (m) => capitalizar(m.forma_farmaceutica) },
];

export function MedicamentosPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Medicamentos"
        descricao="Catálogo de medicamentos. A dose, a via e a frequência ficam no uso de cada paciente."
        nomeSingular="medicamento"
        colunas={COLUNAS}
        chaveLinha={(m) => m.id_medicamento}
        campos={CAMPOS}
        carregar={medicamentosApi.listar}
        criar={(v) => medicamentosApi.criar(v as unknown as MedicamentoEntrada)}
        atualizar={(m, v) => medicamentosApi.atualizar(m.id_medicamento, v as Partial<MedicamentoEntrada>)}
        excluir={(m) => medicamentosApi.excluir(m.id_medicamento)}
        descrever={(m) => `"${m.nome} (${capitalizar(m.forma_farmaceutica)})"`}
      />
    </MainLayout>
  );
}
