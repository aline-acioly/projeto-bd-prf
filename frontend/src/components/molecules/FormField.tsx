import type { ReactNode } from "react";
import { Label, Tooltip } from "@/components/atoms";

interface FormFieldProps {
  /** id do Input/Select filho, para o label e a mensagem de erro apontarem para ele. */
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  /** Explicação da regra do campo, mostrada num tooltip ao lado do rótulo. */
  ajuda?: string;
  children: ReactNode;
}

export function FormField({ id, rotulo, obrigatorio, erro, ajuda, children }: FormFieldProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Label htmlFor={id} obrigatorio={obrigatorio}>
          {rotulo}
        </Label>
        {ajuda && <Tooltip content={ajuda} label={`Regra do campo ${rotulo}`} />}
      </div>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-xs text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}
