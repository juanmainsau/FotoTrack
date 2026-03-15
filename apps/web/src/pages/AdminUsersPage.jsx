// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Carga de datos
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/users/admin/all", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` }
      });
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

  // 2. Acciones: Cambiar Rol
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/admin/${userId}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` 
        },
        body: JSON.stringify({ rol: newRole })
      });
      if (res.ok) fetchUsers(); // Recargamos para que se mueva de tabla si es necesario
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  // 3. Acciones: Cambiar Estado
  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    if (!window.confirm(`¿Estás seguro de cambiar el estado?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/admin/${userId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` 
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.idUsuario === userId ? { ...u, estado: newStatus } : u));
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  // 4. Acciones: Eliminar
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`⚠️ ¿Eliminar permanentemente a ${userEmail}?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/admin/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.idUsuario !== userId));
        alert("Usuario eliminado.");
      }
    } catch (error) {
      alert("Error al intentar eliminar.");
    }
  };

  // 🧠 Lógica de filtrado para las dos tablas
  const admins = users.filter(u => u.rol === 'admin' || u.rol === 'administrador');
  const clientes = users.filter(u => u.rol !== 'admin' && u.rol !== 'administrador');

  if (loading) return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted">Cargando gestión de cuentas...</p>
    </div>
  );

  return (
    <>
      <PageHeader titulo="Gestión de Cuentas" />

      <div className="container-fluid p-4">
        
        {/* 🛡️ TABLA 1: ADMINISTRADORES (Resolana) */}
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
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(u => (
                  <tr key={u.idUsuario}>
                    <td className="ps-4">
                      <div className="fw-bold">{u.nombre}</div>
                      <small className="text-muted">{u.correo}</small>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {u.cuit_display || u.cuit || 'Configurar en Sistema'}
                      </span>
                      <div style={{fontSize: '0.65rem'}} className="text-primary mt-1 fw-bold text-uppercase">📍 Dato de Empresa</div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${u.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                        {u.estado === 'activo' ? '✅ Activo' : '🚫 Suspendido'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button 
                        className="btn btn-sm btn-outline-warning fw-bold"
                        onClick={() => handleStatusToggle(u.idUsuario, u.estado)}
                      >
                        {u.estado === 'activo' ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 👤 TABLA 2: CLIENTES Y USUARIOS */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-dark text-white fw-bold py-3">
            👥 Usuarios y Clientes
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Documento</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(u => (
                  <tr key={u.idUsuario}>
                    <td className="ps-4">
                      <div className="fw-bold">{u.nombre || "Usuario Invitado"}</div>
                      <small className="text-muted">{u.correo}</small>
                    </td>
                    <td>
                      <code className="text-dark bg-light px-2 py-1 rounded">
                        {u.cuit || 'No especificado'}
                      </code>
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm w-auto border-0 bg-light fw-bold"
                        value={u.rol}
                        onChange={(e) => handleRoleChange(u.idUsuario, e.target.value)}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="fotografo">Fotógrafo</option>
                        {/* <option value="admin">Promover a Admin</option> */} //Para nuevo rol fotografo en un futuro.
                      </select>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${u.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                        {u.estado === 'activo' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-sm btn-light text-warning fw-bold"
                          onClick={() => handleStatusToggle(u.idUsuario, u.estado)}
                        >
                          {u.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(u.idUsuario, u.correo)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted small">No hay clientes registrados.</td>
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