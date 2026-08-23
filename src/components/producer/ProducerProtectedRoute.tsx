import { Navigate, Outlet } from "react-router-dom";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { useProducerAuth } from "@/contexts/producerAuth";

export function ProducerProtectedRoute() {
  const auth = useProducerAuth();

  if (auth.isBootstrapping) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <LogoSpinner label="Carregando acesso..." />
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/producer/login" replace />;
  }

  if (!auth.store) {
    // Conta autenticada mas ainda sem loja (ex.: cadastro em duas etapas
    // interrompido, ou conta criada só pelo app Cliente) - as páginas do
    // painel assumem uma loja existente, então volta pro fluxo de criação
    // em vez de deixá-las tentar carregar dados que não existem.
    return <Navigate to="/producer/login" replace />;
  }

  return <Outlet />;
}
