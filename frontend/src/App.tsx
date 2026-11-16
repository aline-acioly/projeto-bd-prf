import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/organisms";
import {
  AvaliacoesPage,
  ConsultasPage,
  EstagiariosPage,
  IntervencoesPage,
  MedicamentosPage,
  NotFound,
  OpcoesNescPage,
  PacienteDetalhePage,
  PacientesPage,
  ProfissionaisPage,
  SuspeitasPage,
} from "./pages";

const App = () => (
  <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/pacientes" replace />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/pacientes/:cpf" element={<PacienteDetalhePage />} />
        <Route path="/profissionais" element={<ProfissionaisPage />} />
        <Route path="/estagiarios" element={<EstagiariosPage />} />
        <Route path="/medicamentos" element={<MedicamentosPage />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
        <Route path="/opcoes-nesc" element={<OpcoesNescPage />} />
        <Route path="/suspeitas" element={<SuspeitasPage />} />
        <Route path="/intervencoes" element={<IntervencoesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ToastProvider>
);

export default App;
