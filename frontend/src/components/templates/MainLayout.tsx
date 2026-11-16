import { ReactNode } from "react";
import { Sidebar } from "@/components/organisms";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-8 py-8">
        {/* Conteúdo centralizado com largura máxima (ideia do Layout do GFD). */}
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
