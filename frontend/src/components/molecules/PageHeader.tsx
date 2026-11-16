import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  /** Uma linha dizendo para que a página serve. */
  descricao?: ReactNode;
  /** Botões e filtros à direita. */
  children?: ReactNode;
}

export function PageHeader({ titulo, descricao, children }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
      <div>
        <h1 className="text-2xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-stone-600">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}
