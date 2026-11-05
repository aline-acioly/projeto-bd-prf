import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { EmConstrucaoPage, NotFound } from "./pages";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/pacientes" replace />} />
      <Route path="/pacientes" element={<EmConstrucaoPage titulo="Pacientes" />} />
      <Route path="/profissionais" element={<EmConstrucaoPage titulo="Profissionais" />} />
      <Route path="/estagiarios" element={<EmConstrucaoPage titulo="Estagiários" />} />
      <Route path="/medicamentos" element={<EmConstrucaoPage titulo="Medicamentos" />} />
      <Route path="/consultas" element={<EmConstrucaoPage titulo="Consultas" />} />
      <Route path="/avaliacoes" element={<EmConstrucaoPage titulo="Avaliações" />} />
      <Route path="/opcoes-nesc" element={<EmConstrucaoPage titulo="Opções NESC" />} />
      <Route path="/suspeitas" element={<EmConstrucaoPage titulo="Suspeitas" />} />
      <Route path="/intervencoes" element={<EmConstrucaoPage titulo="Intervenções" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
