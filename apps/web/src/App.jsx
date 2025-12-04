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

// NUEVAS PANTALLAS DEL USUARIO
import MyPhotosPage from "./pages/MyPhotosPage.jsx";
import PurchasesPage from "./pages/PurchasesPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";

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

      {/* ===================================== */}
      {/*               PÚBLICO                 */}
      {/* ===================================== */}
      <Route path="/" element={<LandingPage />} />

      {/* ===================================== */}
      {/*           ÁREA DE USUARIO             */}
      {/* ===================================== */}

      <Route
        path="/app/mainscreen"
        element={
          <UserLayout>
            <MainscreenPage />
          </UserLayout>
        }
      />

      <Route
        path="/app/albums"
        element={
          <UserLayout>
            <ExploreAlbumsPage />
          </UserLayout>
        }
      />

      <Route
        path="/app/album/:idAlbum"
        element={
          <UserLayout>
            <AlbumGalleryPage />
          </UserLayout>
        }
      />

      {/* NUEVAS RUTAS DE USUARIO */}

      <Route
        path="/app/my-photos"
        element={
          <UserLayout>
            <MyPhotosPage />
          </UserLayout>
        }
      />

      <Route
        path="/app/purchases"
        element={
          <UserLayout>
            <PurchasesPage />
          </UserLayout>
        }
      />

      <Route
        path="/app/cart"
        element={
          <UserLayout>
            <CartPage />
          </UserLayout>
        }
      />

      <Route
        path="/app/profile"
        element={
          <UserLayout>
            <UserProfilePage />
          </UserLayout>
        }
      />

      {/* ===================================== */}
      {/*                 ADMIN                 */}
      {/* ===================================== */}

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
