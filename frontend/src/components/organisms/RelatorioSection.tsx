import { useEffect, useState, type ReactNode } from "react";
import { SqlBlock } from "@/components/molecules";
import { useToast } from "@/hooks";
import { mensagemDeErro } from "@/services";
import type { Relatorio } from "@/types";
import { DataTable, type ColunaTabela } from "./DataTable";

interface RelatorioSectionProps<T> {
  titulo: string;
  /** O que o relatório mostra e qual recurso de SQL ele usa. */
  descricao: string;
  colunas: ColunaTabela<T>[];
  chaveLinha: (linha: T) => string | number;
  /** Precisa ser estável. null: falta escolher um parâmetro (ex.: o paciente). */
  carregar: (() => Promise<Relatorio<T>>) | null;
  aguardando?: string;
  /** Controles ao lado do título (ex.: select de paciente). */
  filtros?: ReactNode;
  mensagemVazia?: string;
}

/** Um relatório: título, tabela com o resultado e o SQL usado num bloco recolhível. */
export function RelatorioSection<T>({
  titulo,
  descricao,
  colunas,
  chaveLinha,
  carregar,
  aguardando = "Escolha um parâmetro.",
  filtros,
  mensagemVazia = "Nenhuma linha no resultado.",
}: RelatorioSectionProps<T>) {
  const toast = useToast();
  const [relatorio, setRelatorio] = useState<Relatorio<T> | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setRelatorio(null);
    if (!carregar) return;
    let ativo = true;
    setCarregando(true);
    carregar()
      .then((resultado) => ativo && setRelatorio(resultado))
      .catch((erro) => ativo && toast.erro(mensagemDeErro(erro)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [carregar, toast]);

  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <p className="text-sm text-gray-600">{descricao}</p>
        </div>
        {filtros}
      </div>
      {!carregar ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
          {aguardando}
        </p>
      ) : (
        <>
          <DataTable
            colunas={colunas}
            linhas={relatorio?.linhas ?? []}
            chaveLinha={chaveLinha}
            carregando={carregando}
            mensagemVazia={mensagemVazia}
          />
          {relatorio && <SqlBlock sql={relatorio.sql} />}
        </>
      )}
    </section>
  );
}
