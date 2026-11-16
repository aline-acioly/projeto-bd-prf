import type { ErroApi } from "@/types";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

/** Erro devolvido pela API, com a mensagem em português do backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string | null;

  constructor(mensagem: string, status: number, codigo: string | null) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
  }
}

type Metodo = "GET" | "POST" | "PATCH" | "DELETE";
type Parametros = Record<string, string | number | null | undefined>;

interface OpcoesRequisicao {
  metodo?: Metodo;
  corpo?: unknown;
  params?: object;
}

/** Codifica um pedaço da URL: CPF, id ou nome com espaço e acento ("Pedro Lima"). */
export const segmento = (valor: string | number) => encodeURIComponent(String(valor));

function montarQuery(params?: object): string {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries((params ?? {}) as Parametros)) {
    if (valor !== undefined && valor !== null && valor !== "") busca.set(chave, String(valor));
  }
  const texto = busca.toString();
  return texto ? `?${texto}` : "";
}

export async function requisitar<T>(
  caminho: string,
  { metodo = "GET", corpo, params }: OpcoesRequisicao = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}${montarQuery(params)}`, {
      method: metodo,
      headers: corpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API. Confira se o backend está rodando.", 0, null);
  }

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = dados as Partial<ErroApi> | null;
    throw new ApiError(
      erro?.erro ?? `Erro ${resposta.status} na API`,
      resposta.status,
      erro?.codigo ?? null,
    );
  }
  return dados as T;
}

/** Mensagem para mostrar ao usuário a partir de qualquer erro capturado. */
export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro inesperado";
}
