import type { InputHTMLAttributes } from "react";
import { CLASSES_CAMPO, classesBorda } from "./estilos";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalido?: boolean;
}

export function Input({ invalido, className = "", ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalido || undefined}
      className={`${CLASSES_CAMPO} ${classesBorda(invalido)} ${className}`}
      {...props}
    />
  );
}
