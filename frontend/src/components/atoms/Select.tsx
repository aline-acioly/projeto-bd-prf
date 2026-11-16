import type { SelectHTMLAttributes } from "react";
import { CLASSES_CAMPO, classesBorda } from "./estilos";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  opcoes: OpcaoSelect[];
  /** Texto da opção vazia, mostrada antes das demais. */
  placeholder?: string;
  invalido?: boolean;
}

export function Select({ opcoes, placeholder = "Selecione...", invalido, className = "", ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalido || undefined}
      className={`${CLASSES_CAMPO} ${classesBorda(invalido)} ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {opcoes.map(({ valor, rotulo }) => (
        <option key={valor} value={valor}>
          {rotulo}
        </option>
      ))}
    </select>
  );
}
