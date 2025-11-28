// users.jsx
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUserShield, FaKey } from "react-icons/fa";
import "../components/usuarios.css"; 
import { usuariosApi } from "../api/ApiGlobal";

const API_URL = "http://localhost:3001";

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

/* ------------------ Main component - Usuarios ------------------ */
export default function UsuariosManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Modal de confirmación para eliminar
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal para cambiar contraseña
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [passwordForm, setPasswordForm] = useState({ password: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Modal para gestionar roles
  const [rolesModal, setRolesModal] = useState({ isOpen: false, user: null });
  const [availableRoles] = useState([
    { id: 1, name: "Administrador" },
    { id: 2, name: "Paciente" },
    { id: 3, name: "Vendedor" },
    { id: 4, name: "Optometrista" },
  ]);


  const [form, setForm] = useState({
    name: "",
    email: "",
    document: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* ------------------ Fetch users ------------------ */
  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);

      const res = await usuariosApi.get("/users");
      console.log("Usuarios cargados:", res.data);
      
      setUsers(Array.isArray(res.data.usuarios) ? res.data.usuarios : []);
    } catch (err) {
      console.error("❌ Error al obtener usuarios:", err);
      
      if (err.response?.status === 401) {
        setErrorUsers("Token inválido o expirado. Por favor inicia sesión nuevamente.");
      } else {
        setErrorUsers(err.response?.data?.message || "Error al cargar los usuarios.");
      }
    } finally {
      setLoadingUsers(false);
    }
  }

  /* ------------------ Exportar a CSV ------------------ */
  function exportToCSV() {
    const headers = ["Nombre", "Email", "Documento", "Roles"];

    const rows = users.map((u) => [
      u.name,
      u.email,
      u.document,
      Array.isArray(u.roles) ? u.roles.filter(Boolean).join("; ") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `usuarios_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      id: Date.now(),
      type: "success",
      message: "Usuarios exportados correctamente.",
    });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ------------------ Crear modal ------------------ */
  function openCreateModal() {
    setIsEditMode(false);
    setEditingUserId(null);
    setForm({
      name: "",
      email: "",
      document: "",
      password: "",
    });
    setErrors({});
    setIsOpen(true);
  }

  /* ------------------ Edit modal ------------------ */
  function openEditModal(user) {
    setIsEditMode(true);
    setEditingUserId(user.id);

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      document: user.document ?? "",
      password: "",
    });

    setErrors({});
    setIsOpen(true);
  }

  function handleClose() {
    if (isSaving) return;
    setIsOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => {
      const c = { ...prev };
      delete c[name];
      return c;
    });
  }

  /* ------------------ Validations ------------------ */
  function validateAll() {
    const errs = {};

    if (!String(form.name).trim()) errs.name = "Nombre es requerido.";
    else if (form.name.trim().length < 2)
      errs.name = "Nombre demasiado corto.";

    const emailStr = String(form.email).trim();
    if (!emailStr) errs.email = "Email es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr))
      errs.email = "Email inválido.";

    if (!String(form.document).trim())
      errs.document = "Documento es requerido.";

    // La contraseña solo es requerida al crear
    if (!isEditMode) {
      if (!String(form.password).trim())
        errs.password = "Contraseña es requerida.";
      else if (form.password.trim().length < 6)
        errs.password = "Contraseña debe tener al menos 6 caracteres.";
    }

    setErrors(errs);
    return errs;
  }

  /* ------------------ Submit ------------------ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    const errs = validateAll();
    if (Object.keys(errs).length) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Corrija los errores.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      document: form.document.trim(),
    };

    // Solo incluir password si se está creando
    if (!isEditMode) {
      payload.password = form.password.trim();
    }

    try {
      setIsSaving(true);

      if (isEditMode && editingUserId) {
        // Actualizar usuario
        const res = await usuariosApi.put(`/users/${editingUserId}`, payload);
        console.log("✅ Usuario actualizado:", res.data);
      } else {
        // Crear usuario
        const res = await usuariosApi.post("/users/register", payload);
        console.log("✅ Usuario creado:", res.data);
      }

      setToast({
        id: Date.now(),
        type: "success",
        message: isEditMode ? "Usuario actualizado." : "Usuario creado.",
      });

      handleClose();
      fetchUsers();
    } catch (err) {
      console.error("❌ Error al guardar usuario:", err);
      
      const errorMessage = err.response?.data?.message || 
                          (isEditMode ? "No se pudo actualizar." : "No se pudo crear.");
      
      setToast({
        id: Date.now(),
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ------------------ DELETE ------------------ */
  function openDeleteModal(user) {
    setDeleteModal({ isOpen: true, user });
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteModal({ isOpen: false, user: null });
  }

  async function handleDelete() {
    if (!deleteModal.user || isDeleting) return;

    try {
      setIsDeleting(true);

      await usuariosApi.delete(`/users/${deleteModal.user.id}`);
      console.log("✅ Usuario eliminado");

      setToast({
        id: Date.now(),
        type: "success",
        message: "Usuario eliminado correctamente.",
      });

      closeDeleteModal();
      fetchUsers();
    } catch (err) {
      console.error("❌ Error al eliminar usuario:", err);
      
      const errorMessage = err.response?.data?.message || "No se pudo eliminar el usuario.";
      
      setToast({
        id: Date.now(),
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  /* ------------------ CAMBIAR CONTRASEÑA ------------------ */
  function openPasswordModal(user) {
    setPasswordModal({ isOpen: true, user });
    setPasswordForm({ password: "" });
  }

  function closePasswordModal() {
    if (isChangingPassword) return;
    setPasswordModal({ isOpen: false, user: null });
    setPasswordForm({ password: "" });
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!passwordModal.user || isChangingPassword) return;

    if (!passwordForm.password.trim() || passwordForm.password.length < 6) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      const payload = { password: passwordForm.password };
      await usuariosApi.put(`/users/password/${passwordModal.user.id}`, payload);
      console.log("✅ Contraseña actualizada");

      setToast({
        id: Date.now(),
        type: "success",
        message: "Contraseña actualizada correctamente.",
      });

      closePasswordModal();
    } catch (err) {
      console.error("❌ Error al cambiar contraseña:", err);
      
      const errorMessage = err.response?.data?.message || "No se pudo cambiar la contraseña.";
      
      setToast({
        id: Date.now(),
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  /* ------------------ GESTIONAR ROLES ------------------ */
  function openRolesModal(user) {
    setRolesModal({ isOpen: true, user });
  }

  function closeRolesModal() {
    setRolesModal({ isOpen: false, user: null });
  }

  async function handleAssignRole(rolId) {
    if (!rolesModal.user) return;
    try {
      const userId = rolesModal.user.id;
      const payload = { rol: rolId };
      await usuariosApi.post(`/users/admin/role/${userId}`, payload);
      console.log("✅ Rol asignado");

      setToast({
        id: Date.now(),
        type: "success",
        message: "Rol asignado correctamente.",
      });

      fetchUsers();
    } catch (err) {
      console.error("❌ Error al asignar rol:", err);
      
      const errorMessage = err.response?.data?.message || "No se pudo asignar el rol.";
      
      setToast({
        id: Date.now(),
        type: "error",
        message: errorMessage,
      });
    }
  }

  async function handleRemoveRole(rolId) {
    if (!rolesModal.user) return;

    try {
      const payload = { rol: rolId };
      await usuariosApi.delete(`/users/admin/role/${rolesModal.user.id}`, { data: payload });
      console.log("✅ Rol removido");

      setToast({
        id: Date.now(),
        type: "success",
        message: "Rol removido correctamente.",
      });

      fetchUsers();
    } catch (err) {
      console.error("❌ Error al remover rol:", err);
      
      const errorMessage = err.response?.data?.message || "No se pudo remover el rol.";
      
      setToast({
        id: Date.now(),
        type: "error",
        message: errorMessage,
      });
    }
  }

  /* ------------------ RENDER ------------------ */
  return (
    <div className="oc-page">
      <header className="oc-header">
        <h1>Usuarios</h1>
        <div className="oc-header-actions">
          <button
            className="oc-btn-secondary"
            onClick={exportToCSV}
            disabled={users.length === 0}
          >
            📥 Exportar CSV
          </button>
          <button className="oc-btn-primary" onClick={openCreateModal}>
            Crear Usuario
          </button>
        </div>
      </header>

      <p className="muted">
        Gestiona los usuarios del sistema, asigna roles y permisos.
      </p>

      {loadingUsers ? (
        <p>Cargando usuarios...</p>
      ) : errorUsers ? (
        <p className="oc-error-text">{errorUsers}</p>
      ) : (
        <div className="oc-table-wrapper">
          <table className="oc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.document}</td>
                  <td>
                    <div className="oc-roles-badges">
                      {Array.isArray(u.roles) && u.roles.filter(Boolean).length > 0
                        ? u.roles.filter(Boolean).map((role, idx) => (
                            <span key={idx} className="oc-role-badge">
                              {role}
                            </span>
                          ))
                        : <span className="oc-role-badge oc-role-none">Sin roles</span>}
                    </div>
                  </td>
                  <td>
                    <div className="oc-actions-cell">
                      <button
                        className="oc-btn-edit"
                        onClick={() => openEditModal(u)}
                        title="Editar usuario"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="oc-btn-password"
                        onClick={() => openPasswordModal(u)}
                        title="Cambiar contraseña"
                      >
                        <FaKey /> Contraseña
                      </button>
                      <button
                        className="oc-btn-roles"
                        onClick={() => openRolesModal(u)}
                        title="Gestionar roles"
                      >
                        <FaUserShield /> Roles
                      </button>
                      {/* <button
                        className="oc-btn-delete"
                        onClick={() => openDeleteModal(u)}
                        title="Eliminar usuario"
                      >
                        <FaTrash /> Eliminar
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                    No hay usuarios registrados.
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
        title={isEditMode ? "Editar Usuario" : "Crear Usuario — Nuevo"}
      >
        <form className="oc-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="oc-row">
            <label className="oc-label">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`oc-input ${errors.name ? "oc-input-error" : ""}`}
              placeholder="Ej: Juan Pérez"
            />
            {errors.name && (
              <div className="oc-field-error">{errors.name}</div>
            )}
          </div>

          {/* Email */}
          <div className="oc-row">
            <label className="oc-label">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`oc-input ${errors.email ? "oc-input-error" : ""}`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <div className="oc-field-error">{errors.email}</div>
            )}
          </div>

          {/* Documento */}
          <div className="oc-row">
            <label className="oc-label">Documento</label>
            <input
              name="document"
              value={form.document}
              onChange={handleChange}
              className={`oc-input ${
                errors.document ? "oc-input-error" : ""
              }`}
              placeholder="123456789"
            />
            {errors.document && (
              <div className="oc-field-error">{errors.document}</div>
            )}
          </div>

          {/* Contraseña (solo al crear) */}
          {!isEditMode && (
            <div className="oc-row">
              <label className="oc-label">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={`oc-input ${
                  errors.password ? "oc-input-error" : ""
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <div className="oc-field-error">{errors.password}</div>
              )}
            </div>
          )}

          {isEditMode && (
            <p className="oc-info-text">
              💡 Para cambiar la contraseña, usa el botón "Contraseña" en la
              tabla.
            </p>
          )}

          {/* Botones */}
          <div className="oc-actions">
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="oc-btn-primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando..."
                : isEditMode
                ? "Guardar Cambios"
                : "Guardar"}
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
            ¿Estás seguro de que deseas eliminar el usuario{" "}
            <strong>{deleteModal.user?.name}</strong>?
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

      {/* Modal de cambio de contraseña */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={closePasswordModal}
        title={`Cambiar Contraseña - ${passwordModal.user?.name}`}
      >
        <form onSubmit={handleChangePassword} style={{ padding: "10px 0" }}>
          <div className="oc-row">
            <label className="oc-label">Nueva Contraseña</label>
            <input
              type="password"
              value={passwordForm.password}
              onChange={(e) =>
                setPasswordForm({ password: e.target.value })
              }
              className="oc-input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="oc-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={closePasswordModal}
              disabled={isChangingPassword}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="oc-btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de gestión de roles */}
      <Modal
        isOpen={rolesModal.isOpen}
        onClose={closeRolesModal}
        title={`Gestionar Roles - ${rolesModal.user?.name}`}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ marginBottom: 16, color: "#374151" }}>
            Roles actuales:
          </p>
          <div className="oc-roles-list">
            {rolesModal.user &&
            Array.isArray(rolesModal.user.roles) &&
            rolesModal.user.roles.filter(Boolean).length > 0 ? (
              rolesModal.user.roles.filter(Boolean).map((role, idx) => {
                const roleObj = availableRoles.find((r) => r.name === role);
                return (
                  <div key={idx} className="oc-role-item">
                    <span className="oc-role-badge">{role}</span>
                    {roleObj && (
                      <button
                        type="button"
                        className="oc-btn-remove-role"
                        onClick={() => handleRemoveRole(roleObj.id)}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="muted">Sin roles asignados</p>
            )}
          </div>

          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

          <p style={{ marginBottom: 16, color: "#374151" }}>
            Asignar nuevo rol:
          </p>
          <div className="oc-roles-available">
            {availableRoles.map((role) => {
              const hasRole =
                rolesModal.user &&
                Array.isArray(rolesModal.user.roles) &&
                rolesModal.user.roles.includes(role.name);
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`oc-btn-assign-role ${
                    hasRole ? "oc-disabled" : ""
                  }`}
                  onClick={() => handleAssignRole(role.id)}
                  disabled={hasRole}
                >
                  {hasRole ? "✓ " : "+ "}
                  {role.name}
                </button>
              );
            })}
          </div>

          <div className="oc-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={closeRolesModal}
            >
              Cerrar
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