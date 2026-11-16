import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  obrigatorio?: boolean;
}

export function Label({ obrigatorio, className = "", children, ...props }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`} {...props}>
      {children}
      {obrigatorio && (
        <span className="ml-0.5 text-red-700" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
