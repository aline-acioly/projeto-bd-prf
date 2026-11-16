import type { ReactNode } from "react";
import { Label } from "@/components/atoms";

interface FormFieldProps {
  /** id do Input/Select filho, para o label e a mensagem de erro apontarem para ele. */
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  children: ReactNode;
}

export function FormField({ id, rotulo, obrigatorio, erro, children }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id} obrigatorio={obrigatorio}>
        {rotulo}
      </Label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
