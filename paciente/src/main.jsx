import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css";
function loadConfigAndRender() {
  const script = document.createElement('script');
  script.src = '/config.js';
  script.onload = () => {
    const apiUrl = window.config?.VITE_API || import.meta.env.VITE_API;
    console.log("API URL:", apiUrl);

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App apiUrl={apiUrl} />
      </StrictMode>
    );
  };
  script.onerror = () => {
    console.error("No se pudo cargar config.js");
    // Opcional: render con un fallback
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App apiUrl={import.meta.env.VITE_API} />
      </StrictMode>
    );
  };

  document.head.appendChild(script);
}

loadConfigAndRender();
