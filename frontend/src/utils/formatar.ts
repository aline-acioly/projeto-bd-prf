/** "2026-09-01" → "01/09/2026". */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "10000000001" → "100.000.000-01". */
export function formatarCpf(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
