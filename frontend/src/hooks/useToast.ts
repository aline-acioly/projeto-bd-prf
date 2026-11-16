import { createContext, useContext } from "react";

export interface ToastApi {
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
}

// O ToastProvider (components/organisms/Toast.tsx) fornece este contexto.
export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return contexto;
}
