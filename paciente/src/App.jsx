import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./dashboard/Dashboard";
import HistorialOpt from "./historial/historico";
import Patients from "./pacientes/paciente";
import HomeLayout from "./dashboard/HomeLayout";
import ProtectedRoute from "./ProtectedRoute";
import Usuarios from "./historial/usuarios";
import NoIngreso from "./components/NoIngreso";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<NoIngreso />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute allowedRoles={["Administrador","Optometrista"]}  />}>
          <Route element={<HomeLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="optometrico" element={<HistorialOpt />} />
            <Route path="pacientes" element={<Patients />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Administrador"]}  />}>
          <Route element={<HomeLayout />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

