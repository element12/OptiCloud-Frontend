#!/bin/sh
# --- Generar config.js con las variables de entorno de Azure ---
cat <<EOF > /usr/share/nginx/html/config.js
window.env = {
  VITE_API: "${VITE_API}",
};
EOF

echo "✅ Archivo config.js generado con:"
cat /usr/share/nginx/html/config.js

# Iniciar Nginx
exec nginx -g "daemon off;"
