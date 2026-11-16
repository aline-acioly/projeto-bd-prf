import { CrudSection, type CampoFormulario, type ColunaTabela } from "@/components/organisms";
import { MainLayout } from "@/components/templates";
import { intervencoesApi } from "@/services";
import { TIPOS_INTERVENCAO, type Intervencao, type IntervencaoEntrada } from "@/types";
import { ROTULOS_TIPO_INTERVENCAO, opcoesComRotulo, opcoesSuspeitas } from "@/utils";

const CAMPOS: CampoFormulario[] = [
  { nome: "id_suspeita", rotulo: "Suspeita", tipo: "select", obrigatorio: true, numerico: true, carregarOpcoes: opcoesSuspeitas },
  { nome: "tipo", rotulo: "Tipo", tipo: "select", obrigatorio: true, opcoes: opcoesComRotulo(TIPOS_INTERVENCAO, ROTULOS_TIPO_INTERVENCAO) },
  { nome: "descricao", rotulo: "Descrição", tipo: "text", obrigatorio: true },
];

const COLUNAS: ColunaTabela<Intervencao>[] = [
  { titulo: "ID", valor: (i) => i.id_intervencao, mono: true },
  { titulo: "Suspeita", valor: (i) => `#${i.id_suspeita}`, mono: true },
  { titulo: "Tipo", valor: (i) => ROTULOS_TIPO_INTERVENCAO[i.tipo] },
  { titulo: "Descrição", valor: (i) => i.descricao },
];

export function IntervencoesPage() {
  return (
    <MainLayout>
      <CrudSection
        titulo="Intervenções"
        descricao="Ações tomadas sobre cada suspeita: encaminhamento, prescrição, orientação ou medidas não farmacológicas."
        nomeSingular="intervenção"
        feminino
        colunas={COLUNAS}
        chaveLinha={(i) => i.id_intervencao}
        campos={CAMPOS}
        carregar={intervencoesApi.listar}
        criar={(v) => intervencoesApi.criar(v as unknown as IntervencaoEntrada)}
        atualizar={(i, v) => intervencoesApi.atualizar(i.id_intervencao, v as Partial<IntervencaoEntrada>)}
        excluir={(i) => intervencoesApi.excluir(i.id_intervencao)}
        descrever={(i) => `a intervenção #${i.id_intervencao} (${ROTULOS_TIPO_INTERVENCAO[i.tipo].toLowerCase()})`}
      />
    </MainLayout>
  );
}
