// products.jsx
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../components/opticloud-products.css";

const API_URL = "https://apigateway-opticloud.azure-api.net/catalogo";

/* ------------------ Modal reusable ------------------ */
function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="oc-modal-overlay" onMouseDown={onClose} aria-modal="true">
      <div
        className="oc-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="oc-modal-title"
      >
        <div className="oc-modal-header">
          <h3 id="oc-modal-title">{title}</h3>
          <button className="oc-close-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="oc-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------ Toast simple ------------------ */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose && onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`oc-toast oc-toast-${toast.type}`}>
      <div className="oc-toast-message">{toast.message}</div>
      <button className="oc-toast-close" onClick={() => onClose(toast.id)}>
        ✕
      </button>
    </div>
  );
}

/* ------------------ Main component - Productos ------------------ */
export default function ProductosManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  // Modal de confirmación para eliminar
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "general",
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' o 'desc'

  /* ------------------ Fetch products ------------------ */
  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      const res = await fetch(`${API_URL}/api/v1/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setErrorProducts("Error al cargar los productos.");
    } finally {
      setLoadingProducts(false);
    }
  }

  /* ------------------ Ordenar productos ------------------ */
  function getSortedProducts() {
    const sorted = [...products].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.stock - b.stock;
      } else {
        return b.stock - a.stock;
      }
    });
    return sorted;
  }

  function toggleSortOrder() {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  }

  /* ------------------ Exportar a CSV ------------------ */
  function exportToCSV() {
    const sortedProducts = getSortedProducts();
    
    // Definir las columnas del CSV
    const headers = [
      "Nombre",
      "Categoría",
      "Precio",
      "Stock",
      "Activo",
      "Fecha Creación",
      "Fecha Actualización"
    ];

    // Crear las filas
    const rows = sortedProducts.map(p => [
      p.nombre,
      p.categoria,
      p.precio,
      p.stock,
      p.activo ? "Sí" : "No",
      p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString() : "-",
      p.fechaActualizacion ? new Date(p.fechaActualizacion).toLocaleString() : "-"
    ]);

    // Combinar headers y rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Crear el blob y descargar
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      id: Date.now(),
      type: "success",
      message: "Productos exportados correctamente."
    });
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ------------------ Crear modal ------------------ */
  function openCreateModal() {
    setIsEditMode(false);
    setEditingProductId(null);
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria: "general",
      activo: true,
    });
    setErrors({});
    setIsOpen(true);
  }

  /* ------------------ Edit modal ------------------ */
  function openEditModal(prod) {
    setIsEditMode(true);
    setEditingProductId(prod._id);

    setForm({
      nombre: prod.nombre ?? "",
      descripcion: prod.descripcion ?? "",
      precio: prod.precio !== undefined ? String(prod.precio) : "",
      stock: prod.stock !== undefined ? String(prod.stock) : "",
      categoria: prod.categoria ?? "general",
      activo: prod.activo !== undefined ? !!prod.activo : true,
    });

    setErrors({});
    setIsOpen(true);
  }

  function handleClose() {
    if (isSaving) return;
    setIsOpen(false);
    setIsEditMode(false);
    setEditingProductId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => {
      const c = { ...prev };
      delete c[name];
      return c;
    });
  }

  /* ------------------ Validations ------------------ */
  function validateAll() {
    const errs = {};

    if (!String(form.nombre).trim()) errs.nombre = "Nombre es requerido.";
    else if (form.nombre.trim().length < 2) errs.nombre = "Nombre demasiado corto.";

    const precioStr = String(form.precio).trim();
    if (!precioStr) errs.precio = "Precio es requerido.";
    else if (!/^[-+]?\d+(\.\d+)?$/.test(precioStr)) errs.precio = "Precio debe ser número válido.";
    else if (parseFloat(precioStr) < 0) errs.precio = "Precio no puede ser negativo.";

    const stockStr = String(form.stock).trim();
    if (stockStr === "") errs.stock = "Stock es requerido.";
    else if (!/^\d+$/.test(stockStr)) errs.stock = "Stock debe ser entero.";

    if (!String(form.categoria).trim()) errs.categoria = "Categoría es requerida.";

    const desc = String(form.descripcion).trim();
    if (desc && desc.length < 5) errs.descripcion = "Descripción mínima 5 caracteres.";

    setErrors(errs);
    return errs;
  }

  /* ------------------ Submit ------------------ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    const errs = validateAll();
    if (Object.keys(errs).length) {
      setToast({ id: Date.now(), type: "error", message: "Corrija los errores." });
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || "",
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
      categoria: form.categoria.trim(),
      activo: !!form.activo,
    };

    try {
      setIsSaving(true);
      let res;

      if (isEditMode && editingProductId) {
        payload.fechaActualizacion = new Date().toISOString();

        res = await fetch(`${API_URL}/api/v1/products/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        payload.fechaCreacion = new Date().toISOString();
        payload.fechaActualizacion = new Date().toISOString();

        res = await fetch(`${API_URL}/api/v1/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(await res.text());

      setToast({
        id: Date.now(),
        type: "success",
        message: isEditMode ? "Producto actualizado." : "Producto creado.",
      });

      handleClose();
      fetchProducts();
    } catch (err) {
      console.error("submit error:", err);
      setToast({
        id: Date.now(),
        type: "error",
        message: isEditMode ? "No se pudo actualizar." : "No se pudo crear.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ------------------ DELETE ------------------ */
  function openDeleteModal(product) {
    setDeleteModal({ isOpen: true, product });
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteModal({ isOpen: false, product: null });
  }

  async function handleDelete() {
    if (!deleteModal.product || isDeleting) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`${API_URL}/api/v1/products/${deleteModal.product._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      setToast({
        id: Date.now(),
        type: "success",
        message: "Producto eliminado correctamente.",
      });

      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error("delete error:", err);
      setToast({
        id: Date.now(),
        type: "error",
        message: "No se pudo eliminar el producto.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  /* ------------------ RENDER ------------------ */
  const sortedProducts = getSortedProducts();

  return (
    <div className="oc-page">
      <header className="oc-header">
        <h1>Productos</h1>
        <div className="oc-header-actions">
          <button className="oc-btn-secondary" onClick={toggleSortOrder} title="Ordenar por stock">
            📊 Stock {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <button className="oc-btn-secondary" onClick={exportToCSV} disabled={products.length === 0}>
            📥 Exportar CSV
          </button>
          <button className="oc-btn-primary" onClick={openCreateModal}>
            Crear Producto
          </button>
        </div>
      </header>

      <p className="muted">Haz clic en "Crear Producto" para registrar uno nuevo.</p>

      {loadingProducts ? (
        <p>Cargando productos...</p>
      ) : errorProducts ? (
        <p className="oc-error-text">{errorProducts}</p>
      ) : (
        <div className="oc-table-wrapper">
          <table className="oc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
                <th>Creado</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((p) => (
                <tr
                  key={p._id}
                  className={p.stock < 10 ? "oc-row-low-stock" : ""}
                >
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{Number(p.precio).toLocaleString()}</td>
                  <td>
                    {p.stock < 10 ? (
                      <span className="oc-stock-alert">{p.stock}</span>
                    ) : (
                      <span className="oc-stock-normal">{p.stock}</span>
                    )}
                  </td>
                  <td>{p.activo ? "Sí" : "No"}</td>
                  <td>{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString() : "-"}</td>
                  <td>{p.fechaActualizacion ? new Date(p.fechaActualizacion).toLocaleString() : "-"}</td>
                  <td>
                    <div className="oc-actions-cell">
                      <button className="oc-btn-edit" onClick={() => openEditModal(p)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="oc-btn-delete" onClick={() => openDeleteModal(p)}>
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 18 }}>
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de crear/editar */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? "Editar Producto" : "Crear Producto — Nuevo"}
      >
        <form className="oc-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="oc-row">
            <label className="oc-label">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`oc-input ${errors.nombre ? "oc-input-error" : ""}`}
              placeholder="Ej: Zapatos deportivos"
            />
            {errors.nombre && <div className="oc-field-error">{errors.nombre}</div>}
          </div>

          {/* Descripción */}
          <div className="oc-row">
            <label className="oc-label">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className={`oc-textarea ${errors.descripcion ? "oc-input-error" : ""}`}
              rows={3}
              placeholder="Detalles del producto..."
            />
            {errors.descripcion && <div className="oc-field-error">{errors.descripcion}</div>}
          </div>

          {/* Precio + Stock */}
          <div className="oc-row oc-separator">
            <div className="oc-col">
              <label className="oc-label">Precio</label>
              <input
                name="precio"
                value={form.precio}
                onChange={handleChange}
                className={`oc-input ${errors.precio ? "oc-input-error" : ""}`}
                placeholder="0.00"
              />
              {errors.precio && <div className="oc-field-error">{errors.precio}</div>}
            </div>

            <div className="oc-col">
              <label className="oc-label">Stock</label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={`oc-input ${errors.stock ? "oc-input-error" : ""}`}
                placeholder="0"
              />
              {errors.stock && <div className="oc-field-error">{errors.stock}</div>}
            </div>
          </div>

          {/* Categoría + Activo */}
          <div className="oc-row oc-separator">
            <div className="oc-col">
              <label className="oc-label">Categoría</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className={`oc-select ${errors.categoria ? "oc-input-error" : ""}`}
              >
                <option value="general">General</option>
                <option value="electronica">Electrónica</option>
                <option value="vestuario">Vestuario</option>
                <option value="alimentacion">Alimentación</option>
                <option value="hogar">Hogar</option>
                <option value="otros">Otros</option>
              </select>
              {errors.categoria && <div className="oc-field-error">{errors.categoria}</div>}
            </div>

            <div className="oc-col" style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "block", marginBottom: 8 }} className="oc-label">
                Activo
              </label>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={!!form.activo}
                    onChange={handleChange}
                  />
                  <span style={{ fontSize: 13, color: "#374151" }}>{form.activo ? "Sí" : "No"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="oc-actions">
            <button type="button" className="oc-btn-secondary" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="oc-btn-primary" disabled={isSaving}>
              {isSaving ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirmar Eliminación"
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ marginBottom: 20, color: "#374151" }}>
            ¿Estás seguro de que deseas eliminar el producto{" "}
            <strong>{deleteModal.product?.nombre}</strong>?
          </p>
          <p style={{ marginBottom: 20, color: "#6b7280", fontSize: 14 }}>
            Esta acción no se puede deshacer.
          </p>
          <div className="oc-actions">
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="oc-btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>

      <div className="oc-toast-wrapper" aria-live="polite">
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}