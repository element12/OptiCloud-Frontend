import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const isLogged = localStorage.getItem("isLogged");
  const token = localStorage.getItem("token");

  if (!isLogged || !token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // roles del token (ej: ["Paciente"])
    const userRoles = decoded.roles || [];

    // Validar roles permitidos
    if (allowedRoles && !userRoles.some(role => allowedRoles.includes(role))) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;

  } catch (error) {
    console.error("Token inválido:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
