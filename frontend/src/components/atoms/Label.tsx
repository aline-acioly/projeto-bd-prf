import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  obrigatorio?: boolean;
}

export function Label({ obrigatorio, className = "", children, ...props }: LabelProps) {
  return (
    <label className={`mb-1 block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
      {obrigatorio && (
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
