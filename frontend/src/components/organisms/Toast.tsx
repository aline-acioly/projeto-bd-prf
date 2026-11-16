import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastApi } from "@/hooks";

type TipoToast = "sucesso" | "erro";

interface ItemToast {
  id: number;
  tipo: TipoToast;
  mensagem: string;
}

const DURACAO_MS: Record<TipoToast, number> = { sucesso: 4000, erro: 8000 };

const CLASSES: Record<TipoToast, string> = {
  sucesso: "border-primary-100 bg-primary-50 text-primary-900",
  erro: "border-red-200 bg-red-50 text-red-800",
};

/** Guarda os avisos e os mostra no canto da tela. Use com o hook useToast(). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemToast[]>([]);
  const proximoId = useRef(0);

  const remover = useCallback((id: number) => {
    setItens((atuais) => atuais.filter((item) => item.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = ++proximoId.current;
      setItens((atuais) => [...atuais, { id, tipo, mensagem }]);
      setTimeout(() => remover(id), DURACAO_MS[tipo]);
    },
    [remover],
  );

  // Objeto estável: pode entrar em dependências de useEffect sem recarregar.
  const api = useMemo<ToastApi>(
    () => ({
      sucesso: (mensagem) => mostrar("sucesso", mensagem),
      erro: (mensagem) => mostrar("erro", mensagem),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {itens.map(({ id, tipo, mensagem }) => (
          <div
            key={id}
            role={tipo === "erro" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-md border p-3 text-sm shadow-sm ${CLASSES[tipo]}`}
          >
            <span className="flex-1">{mensagem}</span>
            <button
              type="button"
              onClick={() => remover(id)}
              className="font-bold leading-none opacity-60 hover:opacity-100"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
