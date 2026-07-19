import { Routes, Route } from "react-router-dom";
import { StorePage } from "./pages/app/customer/StorePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { CancellationPage } from "./pages/CancellationPage";
import { ProducerLoginPage } from "./pages/app/producer/ProducerLoginPage";
import { ProducerDashboardPage } from "./pages/app/producer/ProducerDashboardPage";
import { ProducerStorePage } from "./pages/app/producer/ProducerStorePage";
import { ProducerProductsPage } from "./pages/app/producer/ProducerProductsPage";
import { ProducerCategoriesPage } from "./pages/app/producer/ProducerCategoriesPage";
import { ProducerLocationsPage } from "./pages/app/producer/ProducerLocationsPage";
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
      </Route>
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cancel" element={<CancellationPage />} />
      <Route path="/:slug" element={<StorePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}