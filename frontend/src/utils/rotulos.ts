// Rótulos de exibição dos domínios fechados do banco (CHECKs). Só mudam o que aparece na tela:
// o valor enviado à API (e o value dos <option>) continua sendo o do banco.
import type { OpcaoSelect } from "@/components/atoms";
import type { SubtipoNesc, TipoConsulta, TipoIntervencao } from "@/types";

export const ROTULOS_TIPO_CONSULTA: Record<TipoConsulta, string> = {
  inicial: "Inicial",
  retorno: "Retorno",
};

export const ROTULOS_SUBTIPO_NESC: Record<SubtipoNesc, string> = {
  quantitativo: "Quantitativo",
  qualitativo: "Qualitativo",
  outro: "Outro",
};

export const ROTULOS_TIPO_INTERVENCAO: Record<TipoIntervencao, string> = {
  encaminhamento: "Encaminhamento",
  prescrição: "Prescrição",
  "orientação sobre medicamento": "Orientação sobre medicamento",
  "orientação sobre doença": "Orientação sobre doença",
  "medidas não farmacológicas": "Medidas não farmacológicas",
};

/** Opções de select: value = valor do banco, texto = rótulo. */
export function opcoesComRotulo<T extends string>(valores: readonly T[], rotulos: Record<T, string>): OpcaoSelect[] {
  return valores.map((valor) => ({ valor, rotulo: rotulos[valor] }));
}
