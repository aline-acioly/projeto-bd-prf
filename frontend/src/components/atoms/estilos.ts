// Classes compartilhadas por Input e Select.
export const CLASSES_CAMPO =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:outline-none focus:ring-2 disabled:bg-stone-100 disabled:text-stone-500";

export const classesBorda = (invalido?: boolean) =>
  invalido
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "border-stone-300 focus:border-primary-500 focus:ring-primary-100";
