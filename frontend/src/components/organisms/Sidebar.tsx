import { NavLink } from "react-router-dom";

interface ItemMenu {
  to: string;
  label: string;
}

interface GrupoMenu {
  /** Sem título: o item aparece solto (Início, Relatórios). */
  titulo?: string;
  itens: ItemMenu[];
}

const GRUPOS: GrupoMenu[] = [
  { itens: [{ to: "/", label: "Início" }] },
  {
    titulo: "Cadastros",
    itens: [
      { to: "/pacientes", label: "Pacientes" },
      { to: "/profissionais", label: "Profissionais" },
      { to: "/estagiarios", label: "Estagiários" },
    ],
  },
  {
    titulo: "Atendimento",
    itens: [
      { to: "/consultas", label: "Consultas" },
      { to: "/avaliacoes", label: "Avaliações" },
      { to: "/suspeitas", label: "Suspeitas" },
      { to: "/intervencoes", label: "Intervenções" },
    ],
  },
  {
    titulo: "Catálogos",
    itens: [
      { to: "/medicamentos", label: "Medicamentos" },
      { to: "/opcoes-nesc", label: "Opções NESC" },
    ],
  },
  { itens: [{ to: "/relatorios", label: "Relatórios" }] },
];

// Item ativo: barra lateral na cor primária, sem fundo chapado.
const CLASSES_LINK = "block border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors";
const CLASSES_INATIVO = "border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900";
const CLASSES_ATIVO = "border-primary font-semibold text-primary-700";

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-5 py-4">
        <p className="text-xl font-bold tracking-tight text-primary-700">PRF</p>
        <p className="whitespace-nowrap text-xs text-stone-500">Acompanhamento Farmacoterapêutico</p>
      </div>
      <nav aria-label="Menu principal" className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {GRUPOS.map(({ titulo, itens }, i) => (
          <div key={titulo ?? i}>
            {titulo && (
              <p className="mb-1.5 pl-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{titulo}</p>
            )}
            <ul className="space-y-0.5">
              {itens.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) => `${CLASSES_LINK} ${isActive ? CLASSES_ATIVO : CLASSES_INATIVO}`}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
