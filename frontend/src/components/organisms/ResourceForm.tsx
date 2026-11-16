import { useState, type FormEvent } from "react";
import { Button, Input, Select, type OpcaoSelect } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { useToast } from "@/hooks";
import { ApiError, mensagemDeErro } from "@/services";

export type TipoCampo = "text" | "date" | "select" | "number";
export type ValorCampo = string | number | null;
export type ValoresFormulario = Record<string, ValorCampo>;

export interface CampoFormulario {
  /** Nome da coluna, igual ao do JSON da API. */
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio?: boolean;
  /** Para tipo "select". */
  opcoes?: OpcaoSelect[];
  /** Chave que não muda na edição (CPF, nome do contato...). */
  somenteLeitura?: boolean;
  maxLength?: number;
  min?: number;
  placeholder?: string;
}

interface ResourceFormProps {
  campos: CampoFormulario[];
  /** Objeto com os valores atuais (o próprio registro, na edição). Campos ausentes começam vazios. */
  valoresIniciais?: object;
  textoSalvar?: string;
  /**
   * `valores` traz todos os campos (para o POST) e `alterados` só os que mudaram (para o PATCH).
   * Texto vazio vira null e campo "number" vira número.
   * Se lançar erro, o formulário mostra a mensagem no toast e continua aberto.
   */
  onSalvar: (valores: ValoresFormulario, alterados: ValoresFormulario) => Promise<void>;
  onCancelar: () => void;
}

const paraTexto = (valor: ValorCampo | undefined) => (valor === null || valor === undefined ? "" : String(valor));

function converter(campo: CampoFormulario, texto: string): ValorCampo {
  const limpo = campo.tipo === "text" ? texto.trim() : texto;
  if (limpo === "") return null;
  return campo.tipo === "number" ? Number(limpo) : limpo;
}

/** O 422 do backend vem como "campo: mensagem; outro: mensagem". */
function errosPorCampo(mensagem: string, campos: CampoFormulario[]): Record<string, string> {
  const nomes = new Set(campos.map((campo) => campo.nome));
  const erros: Record<string, string> = {};
  for (const parte of mensagem.split("; ")) {
    const separador = parte.indexOf(": ");
    const nome = parte.slice(0, separador);
    if (separador > 0 && nomes.has(nome)) erros[nome] = parte.slice(separador + 2);
  }
  return erros;
}

export function ResourceForm({
  campos,
  valoresIniciais = {},
  textoSalvar = "Salvar",
  onSalvar,
  onCancelar,
}: ResourceFormProps) {
  const toast = useToast();
  const iniciais = valoresIniciais as Partial<ValoresFormulario>;
  const [textos, setTextos] = useState<Record<string, string>>(() =>
    Object.fromEntries(campos.map((campo) => [campo.nome, paraTexto(iniciais[campo.nome])])),
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  function alterar(nome: string, texto: string) {
    setTextos((atuais) => ({ ...atuais, [nome]: texto }));
    setErros(({ [nome]: _removido, ...resto }) => resto);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const valores: ValoresFormulario = {};
    const alterados: ValoresFormulario = {};
    const faltando: Record<string, string> = {};

    for (const campo of campos) {
      const valor = converter(campo, textos[campo.nome]);
      if (campo.obrigatorio && valor === null) faltando[campo.nome] = "Campo obrigatório";
      valores[campo.nome] = valor;
      const inicial = converter(campo, paraTexto(iniciais[campo.nome]));
      if (!campo.somenteLeitura && valor !== inicial) alterados[campo.nome] = valor;
    }
    if (Object.keys(faltando).length > 0) {
      setErros(faltando);
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(valores, alterados);
    } catch (erro) {
      if (erro instanceof ApiError && erro.codigo === "validacao") {
        setErros(errosPorCampo(erro.message, campos));
      }
      toast.erro(mensagemDeErro(erro));
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      {campos.map((campo) => {
        const id = `campo-${campo.nome}`;
        const comum = {
          id,
          name: campo.nome,
          value: textos[campo.nome],
          disabled: campo.somenteLeitura || salvando,
          invalido: Boolean(erros[campo.nome]),
          "aria-describedby": erros[campo.nome] ? `${id}-erro` : undefined,
        };
        return (
          <FormField
            key={campo.nome}
            id={id}
            rotulo={campo.rotulo}
            obrigatorio={campo.obrigatorio}
            erro={erros[campo.nome]}
          >
            {campo.tipo === "select" ? (
              <Select
                {...comum}
                opcoes={campo.opcoes ?? []}
                onChange={(evento) => alterar(campo.nome, evento.target.value)}
              />
            ) : (
              <Input
                {...comum}
                type={campo.tipo}
                maxLength={campo.maxLength}
                min={campo.min}
                placeholder={campo.placeholder}
                onChange={(evento) => alterar(campo.nome, evento.target.value)}
              />
            )}
          </FormField>
        );
      })}
      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : textoSalvar}
        </Button>
      </div>
    </form>
  );
}
