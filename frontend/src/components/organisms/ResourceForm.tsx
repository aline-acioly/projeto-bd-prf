import { useEffect, useState, type FormEvent } from "react";
import { Button, Input, Select, type OpcaoSelect } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { useToast } from "@/hooks";
import { ApiError, mensagemDeErro } from "@/services";

export type TipoCampo = "text" | "date" | "select" | "number";
export type ValorCampo = string | number | null;
export type ValoresFormulario = Record<string, ValorCampo>;
/** Valores como estão nos inputs (texto), para visivel() e carregarOpcoes(). */
export type TextosFormulario = Record<string, string>;
export type ModoFormulario = "criar" | "editar";

export interface CampoFormulario {
  /** Nome da coluna, igual ao do JSON da API. */
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio?: boolean;
  /** Opções fixas de um select. */
  opcoes?: OpcaoSelect[];
  /**
   * Opções de um select carregadas da API. Recarrega quando muda algum campo de `dependeDe`
   * (e esse campo volta para vazio). Precisa ser uma função estável (fora do componente).
   */
  carregarOpcoes?: (valores: TextosFormulario) => Promise<OpcaoSelect[]>;
  dependeDe?: string[];
  /** Select cujo valor é um id numérico: vai para a API como número. */
  numerico?: boolean;
  somenteLeitura?: boolean;
  /** Chave que só pode ser preenchida na criação (CPF, nome do contato...). */
  fixoNaEdicao?: boolean;
  /** Campo condicional. Escondido, não é obrigatório e vai como null. */
  visivel?: (valores: TextosFormulario) => boolean;
  maxLength?: number;
  min?: number;
  /** No select, é o texto da opção vazia. */
  placeholder?: string;
}

interface ResourceFormProps {
  campos: CampoFormulario[];
  modo?: ModoFormulario;
  /** Objeto com os valores atuais (o próprio registro, na edição). Campos ausentes começam vazios. */
  valoresIniciais?: object;
  textoSalvar?: string;
  /**
   * `valores` traz todos os campos (para o POST) e `alterados` só os que mudaram (para o PATCH).
   * Texto vazio vira null e campo numérico vira número.
   * Se lançar erro, o formulário mostra a mensagem no toast e continua aberto.
   */
  onSalvar: (valores: ValoresFormulario, alterados: ValoresFormulario) => Promise<void>;
  onCancelar: () => void;
}

const paraTexto = (valor: unknown) => (valor === null || valor === undefined ? "" : String(valor));

function converter(campo: CampoFormulario, texto: string): ValorCampo {
  const limpo = campo.tipo === "text" ? texto.trim() : texto;
  if (limpo === "") return null;
  return campo.tipo === "number" || campo.numerico ? Number(limpo) : limpo;
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

interface SelectDoCampoProps {
  campo: CampoFormulario;
  textos: TextosFormulario;
  rotulosDependencias: string;
  id: string;
  value: string;
  disabled: boolean;
  invalido: boolean;
  "aria-describedby"?: string;
  onChange: (texto: string) => void;
}

function SelectDoCampo({ campo, textos, rotulosDependencias, onChange, ...props }: SelectDoCampoProps) {
  const toast = useToast();
  const { carregarOpcoes, dependeDe } = campo;
  // Só os valores das dependências entram na chave: mudar outro campo não recarrega.
  const chaveDependencias = JSON.stringify((dependeDe ?? []).map((nome) => textos[nome] ?? ""));
  const faltaDependencia = (dependeDe ?? []).some((nome) => !textos[nome]);
  const [carregadas, setCarregadas] = useState<OpcaoSelect[] | null>(null);

  useEffect(() => {
    if (!carregarOpcoes) return;
    const valoresDependencias = JSON.parse(chaveDependencias) as string[];
    if (valoresDependencias.some((valor) => !valor)) {
      setCarregadas([]);
      return;
    }
    let ativo = true;
    setCarregadas(null);
    const valores = Object.fromEntries((dependeDe ?? []).map((nome, i) => [nome, valoresDependencias[i]]));
    carregarOpcoes(valores)
      .then((opcoes) => ativo && setCarregadas(opcoes))
      .catch((erro) => {
        if (!ativo) return;
        setCarregadas([]);
        toast.erro(mensagemDeErro(erro));
      });
    return () => {
      ativo = false;
    };
  }, [carregarOpcoes, dependeDe, chaveDependencias, toast]);

  const carregando = Boolean(carregarOpcoes) && carregadas === null;
  const placeholder = faltaDependencia
    ? `Escolha ${rotulosDependencias} primeiro`
    : carregando
      ? "Carregando..."
      : (campo.placeholder ?? "Selecione...");

  return (
    <Select
      {...props}
      name={campo.nome}
      opcoes={campo.opcoes ?? carregadas ?? []}
      placeholder={placeholder}
      disabled={props.disabled || faltaDependencia}
      onChange={(evento) => onChange(evento.target.value)}
    />
  );
}

export function ResourceForm({
  campos,
  modo = "criar",
  valoresIniciais = {},
  textoSalvar = "Salvar",
  onSalvar,
  onCancelar,
}: ResourceFormProps) {
  const toast = useToast();
  const iniciais = valoresIniciais as Record<string, unknown>;
  const [textos, setTextos] = useState<TextosFormulario>(() =>
    Object.fromEntries(campos.map((campo) => [campo.nome, paraTexto(iniciais[campo.nome])])),
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const bloqueado = (campo: CampoFormulario) =>
    Boolean(campo.somenteLeitura || (modo === "editar" && campo.fixoNaEdicao));
  const estaVisivel = (campo: CampoFormulario) => !campo.visivel || campo.visivel(textos);

  function alterar(nome: string, texto: string) {
    setTextos((atuais) => {
      const novos = { ...atuais, [nome]: texto };
      // Quem depende deste campo volta para vazio (ex.: medicamento ao trocar de avaliação).
      for (const campo of campos) if (campo.dependeDe?.includes(nome)) novos[campo.nome] = "";
      return novos;
    });
    setErros(({ [nome]: _removido, ...resto }) => resto);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const valores: ValoresFormulario = {};
    const alterados: ValoresFormulario = {};
    const faltando: Record<string, string> = {};

    for (const campo of campos) {
      const visivel = estaVisivel(campo);
      const valor = visivel ? converter(campo, textos[campo.nome]) : null;
      if (visivel && campo.obrigatorio && valor === null) faltando[campo.nome] = "Campo obrigatório";
      valores[campo.nome] = valor;
      const inicial = converter(campo, paraTexto(iniciais[campo.nome]));
      if (!bloqueado(campo) && valor !== inicial) alterados[campo.nome] = valor;
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

  const rotuloDe = (nome: string) =>
    campos.find((campo) => campo.nome === nome)?.rotulo.toLowerCase() ?? nome;

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      {campos.filter(estaVisivel).map((campo) => {
        const id = `campo-${campo.nome}`;
        const comum = {
          id,
          value: textos[campo.nome],
          disabled: bloqueado(campo) || salvando,
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
              <SelectDoCampo
                {...comum}
                campo={campo}
                textos={textos}
                rotulosDependencias={(campo.dependeDe ?? []).map(rotuloDe).join(" e ")}
                onChange={(texto) => alterar(campo.nome, texto)}
              />
            ) : (
              <Input
                {...comum}
                name={campo.nome}
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
