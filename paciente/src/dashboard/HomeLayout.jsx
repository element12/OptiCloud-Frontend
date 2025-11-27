import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Contenido dinámico */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* Footer opcional */}
      <footer className="bg-gray-800 text-white text-center p-4">
        © 2025 Mi App
      </footer>
    </div>
  );
};

export default HomeLayout;
