import { Routes, Route } from "react-router-dom";
import { StorePage } from "./pages/app/customer/StorePage";
import { TablePage } from "./pages/app/customer/TablePage";
import { ScheduleServicePage } from "./pages/app/customer/ScheduleServicePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { CancellationPage } from "./pages/CancellationPage";
import { ProducerLoginPage } from "./pages/app/producer/ProducerLoginPage";
import { ProducerDashboardPage } from "./pages/app/producer/ProducerDashboardPage";
import { ProducerStorePage } from "./pages/app/producer/ProducerStorePage";
import { ProducerProductsPage } from "./pages/app/producer/ProducerProductsPage";
import { ProducerCategoriesPage } from "./pages/app/producer/ProducerCategoriesPage";
import { ProducerLocationsPage } from "./pages/app/producer/ProducerLocationsPage";
import { ProducerTeamPage } from "./pages/app/producer/ProducerTeamPage";
import { ProducerTablesPage } from "./pages/app/producer/ProducerTablesPage";
import { ProducerAgendaPage } from "./pages/app/producer/ProducerAgendaPage";
import { ProducerProtectedRoute } from "./components/producer/ProducerProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<NotFoundPage />} />
      <Route path="/producer/login" element={<ProducerLoginPage />} />
      <Route path="/producer" element={<ProducerProtectedRoute />}>
        <Route index element={<ProducerDashboardPage />} />
        <Route path="store" element={<ProducerStorePage />} />
        <Route path="products" element={<ProducerProductsPage />} />
        <Route path="categories" element={<ProducerCategoriesPage />} />
        <Route path="locations" element={<ProducerLocationsPage />} />
        <Route path="team" element={<ProducerTeamPage />} />
        <Route path="tables" element={<ProducerTablesPage />} />
        <Route path="agenda" element={<ProducerAgendaPage />} />
      </Route>
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cancel" element={<CancellationPage />} />
      <Route path="/:slug/mesa/:token" element={<TablePage />} />
      <Route path="/:slug/agendar" element={<ScheduleServicePage />} />
      <Route path="/:slug" element={<StorePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
