import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import "../components/opticloud.css"; // ajústala si tu CSS está en otra ruta

// 🌍 VARIABLE GLOBAL DE API
const API_URL = "http://localhost:3003";

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
    const t = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`oc-toast oc-toast-${toast.type}`}>
      <div className="oc-toast-message">{toast.message}</div>
      <button className="oc-toast-close" onClick={() => onClose(toast.id)}>✕</button>
    </div>
  );
}

/* ------------------ Main screen component (unificado) ------------------ */
export default function OpticloudCrearExamen() {
  // modal state (open for create or edit)
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);

  // patients (for create mode)
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);

  // form state (used for both create and edit)
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    od_sphere: "",
    od_cylinder: "",
    od_axis: "",
    oi_sphere: "",
    oi_cylinder: "",
    oi_axis: "",
    observations: "",
    edit_reason: "", // motivo para edición (se enviará como `modification`)
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // exams table
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [errorExams, setErrorExams] = useState(null);

  /* ------------------ Fetch exams (tabla) ------------------ */
  async function fetchExams() {
    try {
      setLoadingExams(true);
      setErrorExams(null);
      const res = await fetch(`${API_URL}/optometrico/v1/exams`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExams(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("fetchExams error:", err);
      setErrorExams("Error al cargar los exámenes.");
    } finally {
      setLoadingExams(false);
    }
  }

  useEffect(() => {
    fetchExams();
  }, []);

  /* ------------------ Fetch patients when opening modal (create or edit) ------------------ */
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    async function fetchPatients() {
      setPatientsLoading(true);
      setPatientsError(null);
      try {
        const res = await fetch(`${API_URL}/optometrico/v1/patients`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setPatients(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("fetchPatients error:", err);
        if (mounted) setPatientsError("No se pudieron cargar los pacientes.");
      } finally {
        if (mounted) setPatientsLoading(false);
      }
    }
    fetchPatients();
    return () => (mounted = false);
  }, [isOpen]);

  /* ------------------ Auto-fill patient info when selectedPatientId changes ------------------ */
  useEffect(() => {
    const p = patients.find((x) => String(x.id) === String(selectedPatientId));
    setSelectedPatient(p || null);
    setErrors((prev) => {
      const c = { ...prev };
      delete c.patient_id;
      return c;
    });
  }, [selectedPatientId, patients]);

  /* ------------------ Open create modal ------------------ */
  function openCreateModal() {
    setIsEditMode(false);
    setEditingExamId(null);
    setIsOpen(true);
    setForm({
      od_sphere: "",
      od_cylinder: "",
      od_axis: "",
      oi_sphere: "",
      oi_cylinder: "",
      oi_axis: "",
      observations: "",
      edit_reason: "", // inicializo para evitar residuos
    });
    setSelectedPatientId("");
    setSelectedPatient(null);
    setErrors({});
  }

  /* ------------------ Open edit modal with exam data ------------------ */
  async function openEditModal(exam) {
    // exam is the object from table
    setIsEditMode(true);
    setEditingExamId(exam.id);
    // patient must be readonly in edit mode, set selectedPatientId and selectedPatient
    setSelectedPatientId(exam.patient_id ?? ""); // si el backend lo provee
    setSelectedPatient({
      id: exam.patient_id ?? null,
      name: exam.patient_name,
      document: exam.patient_document,
    });
    // fill form with exam values (strings -> keep same format)
    setForm({
      od_sphere: String(exam.od_sphere ?? ""),
      od_cylinder: String(exam.od_cylinder ?? ""),
      od_axis: String(exam.od_axis ?? ""),
      oi_sphere: String(exam.oi_sphere ?? ""),
      oi_cylinder: String(exam.oi_cylinder ?? ""),
      oi_axis: String(exam.oi_axis ?? ""),
      observations: exam.observations ?? "",
      edit_reason:  exam.modification ?? "", // obligatorio: el usuario debe completar el motivo en edición
    });
    setErrors({});
    setIsOpen(true);
  }

  function handleClose() {
    if (isSaving) return;
    setIsOpen(false);
    setIsEditMode(false);
    setEditingExamId(null);
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

  /* ------------------ Validations (same for create & edit) ------------------ */
  function validateAll() {
    const errs = {};

    if (!selectedPatientId) {
      errs.patient_id = "Seleccione un paciente.";
    } else if (!isEditMode && !patients.some((p) => String(p.id) === String(selectedPatientId))) {
      // en modo creación asegurar que paciente exista
      errs.patient_id = "Paciente inválido.";
    }

    const floatFields = ["od_sphere", "od_cylinder", "oi_sphere", "oi_cylinder"];
    floatFields.forEach((f) => {
      const v = String(form[f] ?? "").trim();
      if (!v) {
        errs[f] = "Campo requerido.";
      } else if (!/^[-+]?\d+(\.\d+)?$/.test(v)) {
        errs[f] = "Debe ser número válido (negativos y decimales).";
      }
    });

    const axisFields = ["od_axis", "oi_axis"];
    axisFields.forEach((a) => {
      const v = String(form[a] ?? "").trim();
      if (!v) {
        errs[a] = "Campo requerido.";
      } else if (!/^\d+$/.test(v)) {
        errs[a] = "Debe ser un número entero.";
      } else {
        const num = parseInt(v, 10);
        if (num < 1 || num > 180) {
          errs[a] = "Eje debe estar entre 1 y 180.";
        }
      }
    });

    const obs = String(form.observations ?? "").trim();
    if (obs && obs.length < 10) {
      errs.observations = "Si escribe observaciones, debe tener al menos 10 caracteres.";
    }

    // motivo obligatorio SÓLO en edición
    if (isEditMode) {
      if (!String(form.edit_reason ?? "").trim()) {
        errs.edit_reason = "Motivo es requerido para la edición.";
      }
    }

    setErrors(errs);
    return errs;
  }

  /* ------------------ Submit (POST or PUT según modo) ------------------ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    const errs = validateAll();
    if (Object.keys(errs).length) {
      setToast({ id: Date.now(), type: "error", message: "Corrija los errores del formulario." });
      return;
    }

    const payload = {
      patient_id: Number(selectedPatientId),
      od_sphere: parseFloat(form.od_sphere),
      od_cylinder: parseFloat(form.od_cylinder),
      od_axis: parseInt(form.od_axis, 10),
      oi_sphere: parseFloat(form.oi_sphere),
      oi_cylinder: parseFloat(form.oi_cylinder),
      oi_axis: parseInt(form.oi_axis, 10),
      observations: form.observations ? form.observations.trim() : "",
    };

    try {
      setIsSaving(true);

      let res;
      if (isEditMode && editingExamId) {
        // **IMPORTANTE**: enviar 'modification' porque tu backend lo espera
        payload.modification = form.edit_reason?.trim() || "";

        // log para verificar lo que se envía al backend (útil para debugging)
        console.log("PUT payload:", payload);

        // PUT update
        res = await fetch(`${API_URL}/optometrico/v1/exams/${editingExamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // POST create (add exam_datetime automatically)
        payload.exam_datetime = new Date().toISOString();
        res = await fetch(`${API_URL}/optometrico/v1/exams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      if (isEditMode) {
        setToast({ id: Date.now(), type: "success", message: "Examen actualizado correctamente." });
      } else {
        setToast({ id: Date.now(), type: "success", message: "Examen registrado correctamente." });
      }

      setIsOpen(false);
      setIsEditMode(false);
      setEditingExamId(null);
      // refrescar tabla
      await fetchExams();
    } catch (err) {
      console.error("submit error:", err);
      setToast({
        id: Date.now(),
        type: "error",
        message: isEditMode ? "No se pudo actualizar el examen." : "No se pudo guardar el examen.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ------------------ Render ------------------ */
  return (
    <div className="oc-page">
      <header className="oc-header">
        <h1>Órdenes Ópticas</h1>
        <button className="oc-btn-primary" onClick={openCreateModal}>
          Crear Orden Óptica
        </button>
      </header>

      <p className="muted">Click en 'Crear Orden Óptica' para abrir el formulario.</p>

      {/* Tabla de exámenes */}
      {loadingExams ? (
        <p>Cargando exámenes...</p>
      ) : errorExams ? (
        <p className="oc-error-text">{errorExams}</p>
      ) : (
        <div className="oc-table-wrapper">
          <table className="oc-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>OD Esfera</th>
                <th>OD Cil.</th>
                <th>OD Eje</th>
                <th>OI Esfera</th>
                <th>OI Cil.</th>
                <th>OI Eje</th>
                <th>Observaciones</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.patient_document}</td>
                  <td>{ex.patient_name}</td>
                  <td>{ex.od_sphere}</td>
                  <td>{ex.od_cylinder}</td>
                  <td>{ex.od_axis}</td>
                  <td>{ex.oi_sphere}</td>
                  <td>{ex.oi_cylinder}</td>
                  <td>{ex.oi_axis}</td>
                  <td>{ex.observations}</td>
                  <td>
                    <button
                      className="oc-btn-edit"
                      onClick={() => {
                        // fill with exam data and open edit modal
                        // note: ensure your exam rows include patient_id (if not, backend should include it)
                        openEditModal(ex);
                      }}
                    >
                      <FaEdit /> Editar
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "18px" }}>
                    No hay exámenes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - create / edit (reused) */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? "Editar Examen" : "Crear Orden Óptica — Registrar Examen"}
      >
        <form className="oc-form" onSubmit={handleSubmit} noValidate>
          {/* Paciente */}
          <div className="oc-row">
            <label className="oc-label">Seleccionar paciente</label>
            {patientsLoading ? (
              <div className="oc-loading">Cargando pacientes...</div>
            ) : patientsError ? (
              <div className="oc-error-text">{patientsError}</div>
            ) : (
              // If editing, keep select disabled and show selectedPatient only (patient cannot be changed)
              <select
                className={`oc-select ${errors.patient_id ? "oc-input-error" : ""}`}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                disabled={isEditMode}
              >
                <option value="">-- Seleccione paciente --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.document}
                  </option>
                ))}
              </select>
            )}
            {errors.patient_id && <div className="oc-field-error">{errors.patient_id}</div>}
          </div>

          {/* Readonly patient fields */}
          <div className="oc-row oc-separator">
            <div className="oc-col">
              <label className="oc-label">Nombre</label>
              <input className="oc-input" value={selectedPatient?.name || ""} readOnly />
            </div>
            <div className="oc-col">
              <label className="oc-label">Documento</label>
              <input className="oc-input" value={selectedPatient?.document || ""} readOnly />
            </div>
          </div>

          {/* OD */}
          <fieldset className="oc-fieldset">
            <legend>Ojo Derecho (OD)</legend>
            <div className="oc-grid-3">
              <div>
                <label className="oc-label">Esfera (od_sphere)</label>
                <input
                  name="od_sphere"
                  value={form.od_sphere}
                  onChange={handleChange}
                  className={`oc-input ${errors.od_sphere ? "oc-input-error" : ""}`}
                  placeholder="-1.25"
                />
                {errors.od_sphere && <div className="oc-field-error">{errors.od_sphere}</div>}
              </div>

              <div>
                <label className="oc-label">Cilindro (od_cylinder)</label>
                <input
                  name="od_cylinder"
                  value={form.od_cylinder}
                  onChange={handleChange}
                  className={`oc-input ${errors.od_cylinder ? "oc-input-error" : ""}`}
                  placeholder="-0.50"
                />
                {errors.od_cylinder && <div className="oc-field-error">{errors.od_cylinder}</div>}
              </div>

              <div>
                <label className="oc-label">Eje (od_axis)</label>
                <input
                  name="od_axis"
                  value={form.od_axis}
                  onChange={handleChange}
                  className={`oc-input ${errors.od_axis ? "oc-input-error" : ""}`}
                  placeholder="90"
                />
                {errors.od_axis && <div className="oc-field-error">{errors.od_axis}</div>}
              </div>
            </div>
          </fieldset>

          {/* OI */}
          <fieldset className="oc-fieldset">
            <legend>Ojo Izquierdo (OI)</legend>
            <div className="oc-grid-3">
              <div>
                <label className="oc-label">Esfera (oi_sphere)</label>
                <input
                  name="oi_sphere"
                  value={form.oi_sphere}
                  onChange={handleChange}
                  className={`oc-input ${errors.oi_sphere ? "oc-input-error" : ""}`}
                  placeholder="-0.75"
                />
                {errors.oi_sphere && <div className="oc-field-error">{errors.oi_sphere}</div>}
              </div>

              <div>
                <label className="oc-label">Cilindro (oi_cylinder)</label>
                <input
                  name="oi_cylinder"
                  value={form.oi_cylinder}
                  onChange={handleChange}
                  className={`oc-input ${errors.oi_cylinder ? "oc-input-error" : ""}`}
                  placeholder="-0.25"
                />
                {errors.oi_cylinder && <div className="oc-field-error">{errors.oi_cylinder}</div>}
              </div>

              <div>
                <label className="oc-label">Eje (oi_axis)</label>
                <input
                  name="oi_axis"
                  value={form.oi_axis}
                  onChange={handleChange}
                  className={`oc-input ${errors.oi_axis ? "oc-input-error" : ""}`}
                  placeholder="85"
                />
                {errors.oi_axis && <div className="oc-field-error">{errors.oi_axis}</div>}
              </div>
            </div>
          </fieldset>

          {/* Observaciones (opcional) */}
          <div className="oc-row">
            <label className="oc-label">Observaciones (opcional)</label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              className={`oc-textarea ${errors.observations ? "oc-input-error" : ""}`}
              rows={3}
              placeholder="Observaciones clínicas, detalles…"
            />
            {errors.observations && <div className="oc-field-error">{errors.observations}</div>}
          </div>

            {isEditMode && (
            <div className="oc-row">
                <label className="oc-label">Motivo de modificación de fórmula</label>
                <textarea
                name="edit_reason"
                value={form.edit_reason}
                onChange={handleChange}
                className={`oc-textarea ${errors.edit_reason ? "oc-input-error" : ""}`}
                rows={3}
                placeholder="Explique la razón del ajuste en la fórmula…"
                required
                />
                {errors.edit_reason && <div className="oc-field-error">{errors.edit_reason}</div>}
            </div>
            )}
          {/* Buttons */}
          <div className="oc-actions">
            <button type="button" className="oc-btn-secondary" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="oc-btn-primary" disabled={isSaving}>
              {isSaving ? (isEditMode ? "Guardando..." : "Guardando...") : isEditMode ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="oc-toast-wrapper" aria-live="polite">
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
