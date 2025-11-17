import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import { MainscreenPage } from "./pages/MainscreenPage.jsx";
import { ExploreAlbumsPage } from "./pages/ExploreAlbumsPage.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { AdminAlbumsPage } from "./pages/AdminAlbumsPage.jsx";
import { AdminAlbumNewPage } from "./pages/AdminAlbumNewPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Usuario general */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/app/mainscreen" element={<MainscreenPage />} />
      <Route path="/app/albums" element={<ExploreAlbumsPage />} />

      {/* Administrador */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/albums" element={<AdminAlbumsPage />} />
      <Route path="/admin/albums/nuevo" element={<AdminAlbumNewPage />} />
    </Routes>
  );
}
