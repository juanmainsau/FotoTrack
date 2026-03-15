// apps/web/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// LAYOUTS
import { UserLayout } from "./layouts/UserLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// RUTAS PROTEGIDAS
import { AdminRoute } from "./routes/AdminRoute";

// PÁGINAS DE USUARIO
import LandingPage from "./pages/LandingPage";
import { MainscreenPage } from "./pages/MainscreenPage";
import { ExploreAlbumsPage } from "./pages/ExploreAlbumsPage";
import { AlbumGalleryPage } from "./pages/AlbumGalleryPage";
import MyPhotosPage from "./pages/MyPhotosPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx"; 
import ProfilePage from "./pages/ProfilePage.jsx";         
import MisComprasPage from "./pages/MisComprasPage.jsx";
import { UserFaceConfigPage } from "./pages/UserFaceConfigPage";
import SuccessPage from "./pages/SuccessPage.jsx"; 

// PÁGINAS DE ADMIN
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminAlbumsPage } from "./pages/AdminAlbumsPage";
import { AdminAlbumNewPage } from "./pages/AdminAlbumNewPage";
import { AdminConfigPage } from "./pages/AdminConfigPage";
import { AdminVentasPage } from "./pages/AdminVentasPage";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminAuditPage from "./pages/AdminAuditPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout/success" element={<SuccessPage />} />
      <Route path="/checkout/failure" element={<SuccessPage />} />

      {/* ======================== */}
      {/* ÁREA DE USUARIO          */}
      {/* ======================== */}
      <Route path="/app" element={<UserLayout />}>
        {/* Redirección automática al entrar a /app */}
        <Route index element={<Navigate to="mainscreen" replace />} />
        
        <Route path="mainscreen" element={<MainscreenPage />} />
        <Route path="albums" element={<ExploreAlbumsPage />} />
        <Route path="albums/:idAlbum" element={<AlbumGalleryPage />} />
        <Route path="my-photos" element={<MyPhotosPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        
        {/* PERFIL Y SUB-SECCIONES */}
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="perfil/info" element={<ProfilePage />} />
        <Route path="mis-compras" element={<MisComprasPage />} />
        <Route path="configuracion-facial" element={<UserFaceConfigPage />} />
      </Route>

      {/* ======================== */}
      {/* ÁREA DE ADMIN (ANIDADA)  */}
      {/* ======================== */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* Todas estas rutas se renderizan dentro del <Outlet /> de AdminLayout */}
        <Route index element={<AdminDashboardPage />} />
        <Route path="albums" element={<AdminAlbumsPage />} />
        <Route path="albums/nuevo" element={<AdminAlbumNewPage />} />
        <Route path="ventas" element={<AdminVentasPage />} />
        <Route path="config" element={<AdminConfigPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
      </Route>

      {/* 404 - Manejo de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}