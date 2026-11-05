import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/pacientes", label: "Pacientes" },
  { to: "/profissionais", label: "Profissionais" },
  { to: "/estagiarios", label: "Estagiários" },
  { to: "/medicamentos", label: "Medicamentos" },
  { to: "/consultas", label: "Consultas" },
  { to: "/avaliacoes", label: "Avaliações" },
  { to: "/opcoes-nesc", label: "Opções NESC" },
  { to: "/suspeitas", label: "Suspeitas" },
  { to: "/intervencoes", label: "Intervenções" },
];

const CLASSES_LINK = "block rounded-md px-3 py-2 text-sm font-medium transition-colors";
const CLASSES_INATIVO = "text-gray-700 hover:bg-gray-100";
const CLASSES_ATIVO = "bg-primary text-white";

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4 text-sm font-bold text-primary">
        Sistema de Avaliação PRF
      </div>
      <nav aria-label="Recursos" className="flex-1 space-y-1 overflow-y-auto p-3">
        {LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${CLASSES_LINK} ${isActive ? CLASSES_ATIVO : CLASSES_INATIVO}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
