interface SqlBlockProps {
  sql: string;
  rotulo?: string;
}

/** Bloco recolhível com o SQL que gerou um resultado. */
export function SqlBlock({ sql, rotulo = "Ver SQL" }: SqlBlockProps) {
  return (
    <details className="mt-2 rounded-md border border-gray-200 bg-white text-sm">
      <summary className="cursor-pointer select-none px-4 py-2 font-medium text-primary hover:bg-gray-50">
        {rotulo}
      </summary>
      <pre className="overflow-x-auto border-t border-gray-200 bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
        <code>{sql}</code>
      </pre>
    </details>
  );
}
