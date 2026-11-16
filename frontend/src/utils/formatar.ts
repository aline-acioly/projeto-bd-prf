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

/** "81990000001" → "(81) 99000-0001"; fixo com 10 dígitos → "(81) 9000-0001". Outro formato fica como veio. */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return "—";
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 11) return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (digitos.length === 10) return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return telefone;
}

export const formatarSexo = (sexo: string) => (sexo === "F" ? "Feminino" : sexo === "M" ? "Masculino" : sexo);

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
