import { Link } from "react-router-dom";
import { MainLayout } from "@/components/templates";

const NotFound = () => (
  <MainLayout>
    <div className="py-20 text-center">
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-4 text-lg text-gray-500">Página não encontrada</p>
      <Link to="/" className="text-primary underline">
        Voltar ao início
      </Link>
    </div>
  </MainLayout>
);

export default NotFound;
