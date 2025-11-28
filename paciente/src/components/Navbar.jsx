import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isLogged");
        navigate("/login", { replace: true });
    };

    return (
        <>
            {/* Barra superior azul oscuro */}
            <div style={styles.topbar}></div>

            <header style={styles.header}>
                <div style={styles.logo}>
                    <h1 style={styles.logoText}>OptiCloud</h1>
                </div>

                <nav>
                    <ul style={styles.navList}>
                        <li><Link to="/" style={styles.link}>Inicio</Link></li>
                        <li><Link to="http://localhost:5174" style={styles.link}>Catálogo</Link></li>
                        <li><Link to="/optometrico" style={styles.link}>Optometría</Link></li>
                        <li><Link to="/usuarios" style={styles.link}>Pacientes</Link></li>
                        <li>
                            <button onClick={handleLogout} style={styles.linkButton}>
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}

const styles = {
    topbar: {
        backgroundColor: "#041733",
        height: "40px",
        width: "100%"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        backgroundColor: "#f8fafc",
        color: "#334155",
        height: "70px",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    },

    logo: {
        backgroundColor: "#0d6efd",
        padding: "6px 20px",
        borderRadius: "8px"
    },

    logoText: {
        color: "#fff",
        margin: 0,
        fontWeight: "700",
        fontSize: "1.6rem",
        fontFamily: "'Poppins', sans-serif"
    },

    navList: {
        listStyle: "none",
        display: "flex",
        gap: "22px",
        margin: 0,
        padding: 0
    },

    link: {
        color: "#334155",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "0.95rem",
        transition: "0.2s ease"
    },

    linkButton: {
        background: "none",
        border: "none",
        color: "#334155",
        fontWeight: "500",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontFamily: "'Poppins', sans-serif"
    }
};

export default Header;
