import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>403</h1>
      <h2>No autorizado</h2>

      <p style={styles.text}>
        No tienes permisos para acceder a esta página.
      </p>

      <Link to="/login" style={styles.button}>
        Volver al inicio
      </Link>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f9",
    textAlign: "center",
    padding: 20
  },
  title: {
    fontSize: "120px",
    margin: 0,
    color: "#dc3545"
  },
  text: {
    marginBottom: "30px",
    fontSize: "18px"
  },
  button: {
    padding: "10px 20px",
    background: "#0d6efd",
    color: "white",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold"
  }
};

export default Unauthorized;
