import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isLogged = localStorage.getItem("isLogged");

  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
