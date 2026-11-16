import { useNavigate } from "react-router-dom";
import { CrudSection } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { pacientesApi, segmento } from "@/services";
import type { Paciente, PacienteEntrada } from "@/types";
import { CAMPOS_PESSOA, colunasPessoa } from "./camposPessoa";

const COLUNAS = colunasPessoa<Paciente>();

export function PacientesPage() {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <CrudSection
        titulo="Pacientes"
        nomeSingular="paciente"
        colunas={COLUNAS}
        chaveLinha={(p) => p.cpf}
        campos={CAMPOS_PESSOA}
        carregar={pacientesApi.listar}
        criar={(v) => pacientesApi.criar(v as unknown as PacienteEntrada)}
        atualizar={(p, v) => pacientesApi.atualizar(p.cpf, v)}
        excluir={(p) => pacientesApi.excluir(p.cpf)}
        descrever={(p) => `o paciente ${p.nome}, com seus contatos e medicamentos em uso`}
        acoesExtras={[{ rotulo: "Abrir", onClick: (p) => navigate(`/pacientes/${segmento(p.cpf)}`) }]}
      />
    </MainLayout>
  );
}
