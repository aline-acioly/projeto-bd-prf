import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgePapel, BadgeStatusConsulta, BadgeTipoConsulta } from "@/components/atoms";
import { PageHeader, StatCard } from "@/components/molecules";
import { DataTable, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { useToast } from "@/hooks";
import { mensagemDeErro, relatoriosApi } from "@/services";
import type { ProximoAtendimentoLinha, ResumoLinha } from "@/types";
import { formatarData } from "@/utils";

const COLUNAS: ColunaTabela<ProximoAtendimentoLinha>[] = [
  { titulo: "Data", valor: (l) => formatarData(l.data_agendada) },
  { titulo: "Paciente", valor: (l) => l.paciente },
  {
    titulo: "Atendente",
    valor: (l) => (
      <span className="inline-flex items-center gap-2">
        {l.atendente}
        <BadgePapel papel={l.papel_atendente} />
      </span>
    ),
  },
  { titulo: "Tipo", valor: (l) => <BadgeTipoConsulta tipo={l.tipo} /> },
  { titulo: "Situação", valor: () => <BadgeStatusConsulta realizada={false} /> },
];

export function InicioPage() {
  const toast = useToast();
  const [resumo, setResumo] = useState<ResumoLinha | null>(null);
  const [proximos, setProximos] = useState<ProximoAtendimentoLinha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    Promise.all([relatoriosApi.resumo(), relatoriosApi.proximosAtendimentos()])
      .then(([r, p]) => {
        if (!ativo) return;
        setResumo(r.linhas[0] ?? null);
        setProximos(p.linhas);
      })
      .catch((erro) => ativo && toast.erro(mensagemDeErro(erro)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [toast]);

  return (
    <MainLayout>
      <PageHeader
        titulo="Início"
        descricao="Visão geral do acompanhamento: quantos pacientes, o que ainda falta avaliar e as suspeitas registradas."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          rotulo="Pacientes"
          valor={resumo?.pacientes ?? null}
          descricao="Pessoas em acompanhamento."
        />
        <StatCard
          rotulo="Consultas sem avaliação"
          valor={resumo?.consultas_sem_avaliacao ?? null}
          descricao="Agendadas e ainda não realizadas."
          variante="acento"
        />
        <StatCard
          rotulo="Retornos pendentes"
          valor={resumo?.retornos_pendentes ?? null}
          descricao="Retornos que ainda aguardam avaliação."
          variante="acento"
        />
        <StatCard
          rotulo="Suspeitas registradas"
          valor={resumo?.suspeitas ?? null}
          descricao="Problemas com medicamentos levantados nas avaliações."
          variante="neutro"
        />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg">Próximos atendimentos</h2>
            <p className="text-sm text-stone-600">Consultas ainda sem avaliação, da mais antiga para a mais nova.</p>
          </div>
          <Link to="/consultas" className="text-sm font-medium text-primary-700 underline">
            Ver todas as consultas
          </Link>
        </div>
        <DataTable
          colunas={COLUNAS}
          linhas={proximos}
          chaveLinha={(l) => l.id_consulta}
          carregando={carregando}
          mensagemVazia="Nenhuma consulta aguardando avaliação."
        />
      </section>
    </MainLayout>
  );
}
