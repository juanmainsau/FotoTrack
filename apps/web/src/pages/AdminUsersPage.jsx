// src/pages/AdminUsersPage.jsx

import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:4000/api/users/admin/all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "fototrack-token"
            )}`,
          },
        }
      );

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (
    userId,
    currentStatus
  ) => {
    const newStatus =
      currentStatus === "activo"
        ? "inactivo"
        : "activo";

    if (
      !window.confirm(
        `¿Estás seguro de cambiar el estado del usuario?`
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/users/admin/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "fototrack-token"
            )}`,
          },
          body: JSON.stringify({
            estado: newStatus,
          }),
        }
      );

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.idUsuario === userId
              ? {
                  ...u,
                  estado: newStatus,
                }
              : u
          )
        );
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const admins = users.filter(
    (u) =>
      u.rol === "admin" ||
      u.rol === "administrador"
  );

  const clientes = users.filter(
    (u) =>
      u.rol !== "admin" &&
      u.rol !== "administrador"
  );

  if (loading)
    return (
      <div className="p-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        />
        <p className="mt-2 text-muted">
          Cargando gestión de usuarios...
        </p>
      </div>
    );

  return (
    <>
      <PageHeader titulo="Gestión de Usuarios" />

      <div className="container-fluid p-4">

        {/* ADMINISTRADORES */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-header bg-primary text-white fw-bold py-3">
            🛡️ Administradores del Sistema
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Identificación Fiscal</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {admins.map((u) => (
                  <tr key={u.idUsuario}>
                    <td className="ps-4">
                      <div className="fw-bold">
                        {u.nombre}
                      </div>

                      <small className="text-muted">
                        {u.correo}
                      </small>
                    </td>

                    <td>
                      <span className="badge bg-info text-dark">
                        {u.cuit_display ||
                          u.cuit ||
                          "No especificado"}
                      </span>

                      <div
                        style={{
                          fontSize: "0.65rem",
                        }}
                        className="text-primary mt-1 fw-bold text-uppercase"
                      >
                        📍 Dato de Empresa
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill ${
                          u.estado === "activo"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {u.estado === "activo"
                          ? "✅ Activo"
                          : "🚫 Suspendido"}
                      </span>
                    </td>

                    <td className="text-end pe-4">
                      <span className="badge bg-dark opacity-75 px-3 py-2">
                        Cuenta Protegida
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CLIENTES */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-dark text-white fw-bold py-3">
            👥 Clientes Registrados
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((u) => (
                  <tr key={u.idUsuario}>
                    <td className="ps-4">
                      <div className="fw-bold">
                        {u.nombre ||
                          "Usuario Invitado"}
                      </div>

                      <small className="text-muted">
                        {u.correo}
                      </small>
                    </td>

                    <td>
                      <code className="text-dark bg-light px-2 py-1 rounded">
                        {u.cuit ||
                          "No especificado"}
                      </code>
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill ${
                          u.estado === "activo"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {u.estado === "activo"
                          ? "Activo"
                          : "Suspendido"}
                      </span>
                    </td>

                    <td className="text-end pe-4">
                      <button
                        className={`btn btn-sm fw-bold ${
                          u.estado === "activo"
                            ? "btn-outline-warning"
                            : "btn-outline-success"
                        }`}
                        onClick={() =>
                          handleStatusToggle(
                            u.idUsuario,
                            u.estado
                          )
                        }
                      >
                        {u.estado === "activo"
                          ? "Suspender"
                          : "Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}

                {clientes.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-muted small"
                    >
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}