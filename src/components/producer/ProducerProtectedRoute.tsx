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

  return <Outlet />;
}
