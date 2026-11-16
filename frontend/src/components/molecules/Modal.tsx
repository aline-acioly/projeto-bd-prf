import { useEffect, type ReactNode } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Diálogo sobre a página. Fecha com Esc ou clicando fora. Fechado, desmonta o conteúdo. */
export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => evento.key === "Escape" && onFechar();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(evento) => evento.target === evento.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="modal-titulo" className="mb-4 text-lg font-semibold">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
