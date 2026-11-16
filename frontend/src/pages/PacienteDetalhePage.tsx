import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { useToast } from "@/hooks";
import { contatosApi, mensagemDeErro, pacientesApi, usoMedicamentosApi } from "@/services";
import type {
  ContatoEmergencia,
  ContatoEmergenciaEntrada,
  Paciente,
  ParametrosLista,
  UsoMedicamento,
  UsoMedicamentoEntrada,
} from "@/types";
import { formatarCpf, formatarData, opcoesMedicamentos } from "@/utils";

const CAMPOS_CONTATO: CampoFormulario[] = [
  // O nome é parte da chave (entidade fraca): não muda na edição.
  { nome: "nome", rotulo: "Nome", tipo: "text", obrigatorio: true, fixoNaEdicao: true, maxLength: 150 },
  { nome: "telefone", rotulo: "Telefone", tipo: "text", obrigatorio: true, maxLength: 20 },
  { nome: "relacao", rotulo: "Relação", tipo: "text", obrigatorio: true, maxLength: 50, placeholder: "Filho, Esposa..." },
];

const COLUNAS_CONTATO: ColunaTabela<ContatoEmergencia>[] = [
  { titulo: "Nome", valor: (c) => c.nome },
  { titulo: "Telefone", valor: (c) => c.telefone },
  { titulo: "Relação", valor: (c) => c.relacao },
];

const CAMPOS_USO: CampoFormulario[] = [
  {
    nome: "id_medicamento",
    rotulo: "Medicamento",
    tipo: "select",
    obrigatorio: true,
    numerico: true,
    fixoNaEdicao: true,
    carregarOpcoes: opcoesMedicamentos,
  },
  { nome: "dose", rotulo: "Dose", tipo: "text", obrigatorio: true, maxLength: 50, placeholder: "50 mg" },
  { nome: "via_administracao", rotulo: "Via de administração", tipo: "text", obrigatorio: true, maxLength: 50, placeholder: "oral" },
  { nome: "frequencia_uso", rotulo: "Frequência", tipo: "text", obrigatorio: true, maxLength: 50, placeholder: "1x ao dia" },
];

const COLUNAS_USO: ColunaTabela<UsoMedicamento>[] = [
  { titulo: "Medicamento", valor: (u) => `${u.medicamento.nome} (${u.medicamento.forma_farmaceutica})` },
  { titulo: "Dose", valor: (u) => u.dose },
  { titulo: "Via", valor: (u) => u.via_administracao },
  { titulo: "Frequência", valor: (u) => u.frequencia_uso },
];

export function PacienteDetalhePage() {
  const { cpf = "" } = useParams();
  const toast = useToast();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setPaciente(null);
    setErro(null);
    pacientesApi
      .buscar(cpf)
      .then((dados) => ativo && setPaciente(dados))
      .catch((e) => {
        if (!ativo) return;
        setErro(mensagemDeErro(e));
        toast.erro(mensagemDeErro(e));
      });
    return () => {
      ativo = false;
    };
  }, [cpf, toast]);

  const carregarContatos = useCallback((params: ParametrosLista) => contatosApi.listar(cpf, params), [cpf]);
  const carregarUsos = useCallback((params: ParametrosLista) => usoMedicamentosApi.listar(cpf, params), [cpf]);

  return (
    <MainLayout>
      <Link to="/pacientes" className="text-sm text-primary underline">
        ← Voltar para pacientes
      </Link>

      {erro ? (
        <p className="py-20 text-center text-gray-500">{erro}</p>
      ) : !paciente ? (
        <p className="py-20 text-center text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="mb-2 mt-4">
            <h1 className="text-2xl font-bold">{paciente.nome}</h1>
            <p className="mt-1 text-sm text-gray-600">
              CPF {formatarCpf(paciente.cpf)} · nascimento {formatarData(paciente.data_nasc)} · sexo {paciente.sexo} ·
              telefone {paciente.telefone}
            </p>
          </div>

          <CrudSection
            secao
            titulo="Contatos de emergência"
            nomeSingular="contato"
            colunas={COLUNAS_CONTATO}
            chaveLinha={(c) => c.nome}
            campos={CAMPOS_CONTATO}
            carregar={carregarContatos}
            criar={(v) => contatosApi.criar(cpf, v as unknown as ContatoEmergenciaEntrada)}
            atualizar={(c, v) => contatosApi.atualizar(cpf, c.nome, v)}
            excluir={(c) => contatosApi.excluir(cpf, c.nome)}
            descrever={(c) => `o contato ${c.nome}`}
          />

          <CrudSection
            secao
            titulo="Medicamentos em uso"
            nomeSingular="medicamento em uso"
            colunas={COLUNAS_USO}
            chaveLinha={(u) => u.id_medicamento}
            campos={CAMPOS_USO}
            carregar={carregarUsos}
            criar={(v) => usoMedicamentosApi.criar(cpf, v as unknown as UsoMedicamentoEntrada)}
            atualizar={(u, v) => usoMedicamentosApi.atualizar(cpf, u.id_medicamento, v)}
            excluir={(u) => usoMedicamentosApi.excluir(cpf, u.id_medicamento)}
            descrever={(u) => `o uso de ${u.medicamento.nome}`}
          />
        </>
      )}
    </MainLayout>
  );
}
