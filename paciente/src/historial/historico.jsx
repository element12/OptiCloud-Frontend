import React, { useEffect, useState } from "react";
import "../components/opticloud.css";

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

/* ------------------ Main screen component ------------------ */
export default function OpticloudCrearExamen() {
  // modal state
  const [isOpen, setIsOpen] = useState(false);

  // patients
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);

  // form state
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
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* ------------------ GET Patients ------------------ */
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    async function fetchPatients() {
      setPatientsLoading(true);
      setPatientsError(null);
      try {
        const res = await fetch(`${API_URL}/optometrico/v1/patients`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (mounted) setPatients(data instanceof Array ? data : [data]);
      } catch (err) {
        if (mounted) setPatientsError("No se pudieron cargar los pacientes.");
      } finally {
        if (mounted) setPatientsLoading(false);
      }
    }

    fetchPatients();
    return () => (mounted = false);
  }, [isOpen]);

  /* ------------------ Auto-fill patient info ------------------ */
  useEffect(() => {
    const p = patients.find((x) => String(x.id) === String(selectedPatientId));
    setSelectedPatient(p || null);

    setErrors((prev) => {
      const clone = { ...prev };
      delete clone.patient_id;
      return clone;
    });
  }, [selectedPatientId, patients]);

  /* ------------------ Helpers ------------------ */
  function handleOpen() {
    setIsOpen(true);
    setForm({
      od_sphere: "",
      od_cylinder: "",
      od_axis: "",
      oi_sphere: "",
      oi_cylinder: "",
      oi_axis: "",
      observations: "",
    });
    setSelectedPatientId("");
    setSelectedPatient(null);
    setErrors({});
  }

  function handleClose() {
    if (isSaving) return;
    setIsOpen(false);
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

  /* ------------------ VALIDATIONS ------------------ */
  function validateAll() {
    const errs = {};

    if (!selectedPatientId) {
      errs.patient_id = "Seleccione un paciente.";
    } else if (!patients.some((p) => String(p.id) === String(selectedPatientId))) {
      errs.patient_id = "Paciente inválido.";
    }

    const floatFields = ["od_sphere", "od_cylinder", "oi_sphere", "oi_cylinder"];
    floatFields.forEach((f) => {
      const v = String(form[f]).trim();
      if (!v) errs[f] = "Campo requerido.";
      else if (!/^[-+]?\d+(\.\d+)?$/.test(v))
        errs[f] = "Debe ser número válido (negativos y decimales).";
    });

    const axisFields = ["od_axis", "oi_axis"];
    axisFields.forEach((a) => {
      const v = String(form[a]).trim();
      if (!v) errs[a] = "Campo requerido.";
      else if (!/^\d+$/.test(v)) errs[a] = "Debe ser un entero.";
      else {
        const num = parseInt(v, 10);
        if (num < 1 || num > 180) errs[a] = "Eje debe estar entre 1 y 180.";
      }
    });

    const obs = String(form.observations || "").trim();
    if (obs && obs.length < 10)
      errs.observations = "Debe tener al menos 10 caracteres.";

    setErrors(errs);
    return errs;
  }

  /* ------------------ POST Submit ------------------ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    const errs = validateAll();
    if (Object.keys(errs).length) {
      setToast({ id: Date.now(), type: "error", message: "Corrija los errores del formulario." });
      return;
    }

    const body = {
      patient_id: Number(selectedPatientId),
      od_sphere: parseFloat(form.od_sphere),
      od_cylinder: parseFloat(form.od_cylinder),
      od_axis: parseInt(form.od_axis, 10),
      oi_sphere: parseFloat(form.oi_sphere),
      oi_cylinder: parseFloat(form.oi_cylinder),
      oi_axis: parseInt(form.oi_axis, 10),
      observations: form.observations.trim(),
      exam_datetime: new Date().toISOString(),
    };

    try {
      setIsSaving(true);

      const res = await fetch(`${API_URL}/optometrico/v1/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());

      setToast({ id: Date.now(), type: "success", message: "Examen registrado correctamente." });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        id: Date.now(),
        type: "error",
        message: "No se pudo guardar el examen. Intente nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ------------------ RENDER ------------------ */
  return (
    <div className="oc-page">
      <header className="oc-header">
        <h1>Órdenes Ópticas</h1>
        <button className="oc-btn-primary" onClick={handleOpen}>
          Crear Orden Óptica
        </button>
      </header>

      <main className="oc-main">
        <div className="oc-card">
          <h2>Registrar Examen Optométrico</h2>
          <p className="muted">Cree una orden rápida para un examen con prescripción.</p>
          <div className="oc-placeholder">
            <p>Click en "Crear Orden Óptica" para abrir el formulario.</p>
          </div>
        </div>
      </main>

      <Modal isOpen={isOpen} onClose={handleClose} title="Crear Orden Óptica — Registrar Examen">
        <form className="oc-form" onSubmit={handleSubmit} noValidate>
          {/* Paciente */}
          <div className="oc-row">
            <label className="oc-label">Seleccionar paciente</label>
            {patientsLoading ? (
              <div className="oc-loading">Cargando pacientes...</div>
            ) : patientsError ? (
              <div className="oc-error-text">{patientsError}</div>
            ) : (
              <select
                className={`oc-select ${errors.patient_id ? "oc-input-error" : ""}`}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
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
                />
                {errors.oi_axis && <div className="oc-field-error">{errors.oi_axis}</div>}
              </div>
            </div>
          </fieldset>

          {/* Observaciones */}
          <div className="oc-row">
            <label className="oc-label">Observaciones (opcional)</label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              className={`oc-textarea ${errors.observations ? "oc-input-error" : ""}`}
              rows={3}
            />
            {errors.observations && <div className="oc-field-error">{errors.observations}</div>}
          </div>

          {/* Buttons */}
          <div className="oc-actions">
            <button type="button" className="oc-btn-secondary" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="oc-btn-primary" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="oc-toast-wrapper">
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
