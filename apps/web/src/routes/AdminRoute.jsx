import { Navigate } from "react-router-dom";

export function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("fototrack-user"));

  if (!user) return <Navigate to="/" />;

  if (user.rol !== "admin") {
    return <Navigate to="/app/mainscreen" />;
  }

  return children;
}
