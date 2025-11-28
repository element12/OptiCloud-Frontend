import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "react-toastify/ReactToastify.css";
import "./index.css";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "./store.js";


function loadConfigAndRender() {
  const script = document.createElement('script');
  script.src = '/config.js';
  script.onload = () => {
    const apiUrl = window.config?.VITE_API || import.meta.env.VITE_API;
    console.log("API URL:", apiUrl);

    createRoot(document.getElementById("root")).render(
      <>
        <Provider store={store}>
          <App />
          <ToastContainer position="top-center" />
        </Provider>
      </>
    );
  };
  script.onerror = () => {
    console.error("No se pudo cargar config.js");
    // Opcional: render con un fallback
    createRoot(document.getElementById("root")).render(
      <>
        <Provider store={store}>
          <App />
          <ToastContainer position="top-center" />
        </Provider>
      </>
    );

  };

  document.head.appendChild(script);
}

loadConfigAndRender();
