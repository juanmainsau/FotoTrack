// apps/web/src/App.jsx
import { Routes, Route } from "react-router-dom";

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
import MisComprasPage from "./pages/MisComprasPage.jsx";
import { UserFaceConfigPage } from "./pages/UserFaceConfigPage";
import SuccessPage from "./pages/SuccessPage.jsx"; // 👈 NUEVO: Importación de página de éxito

// PÁGINAS DE ADMIN
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminAlbumsPage } from "./pages/AdminAlbumsPage";
import { AdminAlbumNewPage } from "./pages/AdminAlbumNewPage";
import { AdminConfigPage } from "./pages/AdminConfigPage";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminAuditPage from "./pages/AdminAuditPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* ================================================= */}
      {/* 💳 RETORNO DE MERCADO PAGO (Rutas Raíz)          */}
      {/* Estas rutas coinciden con las configuradas en el Backend */}
      {/* ================================================= */}
      <Route path="/checkout/success" element={<SuccessPage />} />
      <Route path="/checkout/failure" element={<SuccessPage />} />


      {/* ======================== */}
      {/* ÁREA DE USUARIO      */}
      {/* ======================== */}
      <Route path="/app" element={<UserLayout />}>
        <Route path="mainscreen" element={<MainscreenPage />} />

        {/* EXPLORAR Y VER ALBÚMENES */}
        <Route path="albums" element={<ExploreAlbumsPage />} />
        <Route path="albums/:idAlbum" element={<AlbumGalleryPage />} />

        {/* RECONOCIMIENTO/CARPETA PERSONAL */}
        <Route path="my-photos" element={<MyPhotosPage />} />

        {/* CHECKOUT SOLO DESDE CARRITO */}
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />

        {/* PERFIL + MIS COMPRAS + CONFIG FACIAL */}
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="mis-compras" element={<MisComprasPage />} />
        <Route path="configuracion-facial" element={<UserFaceConfigPage />} />
      </Route>

      {/* ======================== */}
      {/* ADMIN          */}
      {/* ======================== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/albums"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAlbumsPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/albums/nuevo"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAlbumNewPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/config"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminConfigPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminReportsPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/audit"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAuditPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}