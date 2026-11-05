import { MainLayout } from "@/components/templates";

interface EmConstrucaoPageProps {
  titulo: string;
}

export function EmConstrucaoPage({ titulo }: EmConstrucaoPageProps) {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="py-20 text-center text-gray-500">Em construção</p>
    </MainLayout>
  );
}
