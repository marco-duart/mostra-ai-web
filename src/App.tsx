import { Routes, Route } from "react-router-dom";
import { StorePage } from "./pages/app/customer/StorePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { CancellationPage } from "./pages/CancellationPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<NotFoundPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cancel" element={<CancellationPage />} />
      <Route path="/:slug" element={<StorePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}