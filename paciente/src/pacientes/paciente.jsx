import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import "../components/opticloud.css"; // ajusta la ruta si es necesario
import {gestionPacienteApi} from "../api/ApiGlobal";
// 🔧 API base (nuevo backend)
const API_URL = "https://apigateway-opticloud.azure-api.net/gespaciente";

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

/* ------------------ Main component ------------------ */
export default function OpticloudCrearPaciente() {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // true = edit form, false = create form
  const [isViewMode, setIsViewMode] = useState(false); // true = view (readonly) modal
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Patients list
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState(null);

  // Selected / current patient for view/edit
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Exams for the selected patient (view)
  const [patientExams, setPatientExams] = useState([]);
  const [loadingExamsForPatient, setLoadingExamsForPatient] = useState(false);

  // Form state for create/edit patient
  const [form, setForm] = useState({
    name: "",
    document: "",
    age: "",
    birth_date: "",
    address: "",
    city: "",
    neighborhood: "",
    gender: "",
    observations: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Table / page load
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState(null);

  /* ------------------ Helpers: Toast ------------------ */
  const pushToast = (type, message) => {
    const t = { id: Date.now(), type, message };
    setToast(t);
  };

  const closeToast = (id) => {
    if (!toast) return;
    if (toast.id === id) setToast(null);
  };

  /* ------------------ Fetch patients (tabla) ------------------ */
  async function fetchPatients() {
    try {
      setLoadingTable(true);
      setErrorTable(null);
      const res = await gestionPacienteApi.get("/api/v1/patients");
      console.log("fetchPatients res:", res);
      if (!res.status) throw new Error(`HTTP ${res.status}`);
      const data = await res.data;
      setPatients(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("fetchPatients error:", err);
      setErrorTable("Error al cargar los pacientes.");
    } finally {
      setLoadingTable(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  /* ------------------ Fetch patient by id (for view or edit) ------------------ */
  async function fetchPatientById(id) {
  try {
    const res = await gestionPacienteApi.get(`/api/v1/patients/${id}`);
    if (!res.status) throw new Error(`HTTP ${res.status}`);
    const data = await res.data;
    return data; // contiene { patient: {...}, exams: [...] }
  } catch (err) {
    console.error("fetchPatientById:", err);
    throw err;
  }
}

  /* ------------------ Fetch exams for patient (assumed route) ------------------ */
  // Asumido: GET /api/v1/patients/:id/exams
 async function fetchExamsForPatient(id) {
  try {
    setLoadingExamsForPatient(true);
    setPatientExams([]);

    const res = await gestionPacienteApi.get(`/api/v1/patients/${id}`);
    if (!res.status) {
      if (res.status === 404) {
        setPatientExams([]);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.data;

    // ******* CORRECCIÓN AQUÍ ********
    const exams = Array.isArray(data.exams) ? data.exams : [];

    setPatientExams(exams);
  } catch (err) {
    console.error("fetchExamsForPatient error:", err);
    setPatientExams([]);
  } finally {
    setLoadingExamsForPatient(false);
  }
}

  /* ------------------ Open Create Modal ------------------ */
  function openCreateModal() {
    setIsEditMode(false);
    setIsViewMode(false);
    setEditingPatientId(null);
    setSelectedPatientId("");
    setSelectedPatient(null);
    setForm({
      name: "",
      document: "",
      age: "",
      birth_date: "",
      address: "",
      city: "",
      neighborhood: "",
      gender: "",
      observations: "",
    });
    setErrors({});
    setIsOpen(true);
  }

  /* ------------------ Open Edit Modal ------------------ */
 async function openEditModal(patient) {
  setIsEditMode(true);
  setIsViewMode(false);
  setEditingPatientId(patient.id);
  setSelectedPatientId(String(patient.id));

  try {
    const full = await fetchPatientById(patient.id);

    const p = full.patient ?? patient;

    setForm({
      name: p.name ?? "",
      document: p.document ?? "",
      age: p.age ?? "",
      birth_date: p.birth_date ? p.birth_date.substring(0, 10) : "",
      address: p.address ?? "",
      city: p.city ?? "",
      neighborhood: p.neighborhood ?? "",
      gender: p.gender ?? "",
      observations: p.observations ?? "",
    });

  } catch (err) {
    console.error("openEditModal:", err);

    // Fallback si la API falla
    setForm({
      name: patient.name ?? "",
      document: patient.document ?? "",
      age: patient.age ?? "",
      birth_date: patient.birth_date ? patient.birth_date.substring(0, 10) : "",
      address: patient.address ?? "",
      city: patient.city ?? "",
      neighborhood: patient.neighborhood ?? "",
      gender: patient.gender ?? "",
      observations: patient.observations ?? "",

      
    });
  }

  setIsOpen(true);
}

  /* ------------------ Open View Modal (readonly) - shows patient + exams ------------------ */
async function openViewModal(patient) {
  setIsEditMode(false);
  setIsViewMode(true);
  setEditingPatientId(null);
  setSelectedPatientId(String(patient.id));
  try {
    const full = await fetchPatientById(patient.id);
    // <-- FIX: usar full.patient cuando la API devuelve { patient, exams }
    setSelectedPatient(full.patient ?? full);
    // fetch exams
    await fetchExamsForPatient(patient.id);
  } catch (err) {
    setSelectedPatient(patient);
    setPatientExams([]);
  }
  setIsOpen(true);
}

  /* ------------------ Close modal ------------------ */
  function handleClose() {
    if (isSaving) return;
    setIsOpen(false);
    setIsEditMode(false);
    setIsViewMode(false);
    setEditingPatientId(null);
    setSelectedPatient(null);
    setPatientExams([]);
    setErrors({});
  }

  /* ------------------ Handle form input change ------------------ */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => {
      const c = { ...prev };
      delete c[name];
      return c;
    });
  }

  /* ------------------ Validations for patient form ------------------ */
  function validatePatientForm() {
    const errs = {};
    // name
    if (!form.name || !String(form.name).trim()) errs.name = "El nombre es obligatorio.";
    else if (String(form.name).trim().length < 2) errs.name = "Nombre muy corto.";

    // document
    if (!form.document || !String(form.document).trim()) errs.document = "Documento es obligatorio.";
    else if (String(form.document).trim().length < 3) errs.document = "Documento inválido.";

    // age (phone 10 digits)
        if (!form.age || form.age.trim() === "") {
          errs.age = "El teléfono es obligatorio.";
        } else if (!/^\d{10}$/.test(form.age)) {
          errs.age = "El teléfono debe tener exactamente 10 dígitos.";
        }

    // birth_date (optional, not future)
    if (form.birth_date) {
      const bd = new Date(form.birth_date);
      if (isNaN(bd.getTime())) errs.birth_date = "Fecha inválida.";
      else {
        const today = new Date();
        bd.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        if (bd > today) errs.birth_date = "Fecha no puede ser futura.";
      }
    }

    // texts length limits
    if (form.address && form.address.length > 250) errs.address = "Dirección demasiado larga.";
    if (form.city && form.city.length > 100) errs.city = "Ciudad demasiado larga.";
    if (form.neighborhood) {const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;if (!emailRegex.test(form.neighborhood)) {errs.neighborhood = "Debe ingresar un correo electrónico válido.";}}
    if (form.observations && form.observations.length > 2000) errs.observations = "Observaciones demasiado largas.";

    // gender (optional basic check)
    if (form.gender) {
      const g = String(form.gender).toLowerCase();
      const allowed = ["male","female","m","f","other","otro","masculino","femenino"];
      if (!allowed.includes(g)) {
        // we won't block, only warn
        // errs.gender = "Género inválido.";
      }
    }


    setErrors(errs);
    return errs;
  }

  /* ------------------ Submit create or update ------------------ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;

    const errs = validatePatientForm();
    if (Object.keys(errs).length) {
      pushToast("error", "Corrija los errores del formulario.");
      return;
    }

    // prepare payload (match exact fields)
    const payload = {
      name: form.name?.trim() ?? "",
      document: form.document?.trim() ?? "",
      age: form.age === "" ? null : Number(form.age),
      birth_date: form.birth_date ? new Date(form.birth_date).toISOString() : null,
      address: form.address?.trim() ?? "",
      city: form.city?.trim() ?? "",
      neighborhood: form.neighborhood?.trim() ?? "",
      gender: form.gender?.trim() ?? "",
      observations: form.observations?.trim() ?? "",
    };

    try {
      setIsSaving(true);
      let res;
      if (isEditMode && selectedPatientId) {

        console.log("Updating patient id:", selectedPatientId, "with payload:", payload);
        const putBody = {
          id: selectedPatientId,
          ...payload
        };
        
        const res = await gestionPacienteApi.put(`/api/v1/patients/${selectedPatientId}`, putBody);
        console.log("Update response:", res);
        if (!res.status) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        pushToast("success", "Paciente actualizado correctamente.");
      } else {
        // POST create
        res = await gestionPacienteApi.post(`/api/v1/patients`, payload);
        if (!res.status) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        pushToast("success", "Paciente creado correctamente.");
      }

      // refresh table and close
      await fetchPatients();
      handleClose();
    } catch (err) {
      console.error("handleSubmit:", err);
      pushToast("error", isEditMode ? "No se pudo actualizar el paciente." : "No se pudo crear el paciente.");
    } finally {
      setIsSaving(false);
    }
  }

  /* ------------------ Delete patient ------------------ */
  async function handleDelete(patient) {
    const ok = window.confirm(`¿Eliminar paciente "${patient.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      const res = await gestionPacienteApi.delete(`/api/v1/patients/${patient.id}`);
      if (!res.status) throw new Error(`HTTP ${res.status}`);
      pushToast("success", "Paciente eliminado.");
      await fetchPatients();
    } catch (err) {
      console.error("handleDelete:", err);
      pushToast("error", "No se pudo eliminar el paciente.");
    }
  }

  /* ------------------ Utility: format date (short) ------------------ */
  function formatDateShort(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toISOString().substring(0, 10);
    } catch {
      return iso;
    }
  }

  /* ------------------ Render ------------------ */
  return (
    <div className="oc-page">
      <header className="oc-header">
        <h1>Gestión de Pacientes</h1>
        <button className="oc-btn-primary" onClick={openCreateModal}>Crear Paciente</button>
      </header>

      <p className="muted">Lista de pacientes. Usa Crear para añadir un nuevo paciente o Editar para modificarlo.</p>

      {/* Tabla de pacientes */}
      {loadingTable ? (
        <p>Cargando pacientes...</p>
      ) : errorTable ? (
        <p className="oc-error-text">{errorTable}</p>
      ) : (
        <div className="oc-table-wrapper oc-card">
          <table className="oc-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Fecha Nac.</th>
                <th>Ciudad</th>
                <th>Correo</th>
                <th>Género</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 18 }}>
                    No hay pacientes registrados.
                  </td>
                </tr>
              )}
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.document}</td>
                  <td>
                    <button
                      className="oc-btn-secondary"
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "#0b74ff" }}
                      onClick={() => openViewModal(p)}
                    >
                      {p.name}
                    </button>
                  </td>
                  <td>{p.age ?? ""}</td>
                  <td>{formatDateShort(p.birth_date)}</td>
                  <td>{p.city ?? ""}</td>
                  <td>{p.neighborhood ?? ""}</td>
                  <td>{p.gender ?? ""}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="oc-btn-edit"
                        onClick={() => openEditModal(p)}
                        title="Editar paciente"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="oc-btn-secondary"
                        onClick={() => handleDelete(p)}
                        title="Eliminar paciente"
                        style={{ background: "transparent", border: "1px solid #fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 8 }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: create / edit / view */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          isViewMode
            ? "Ficha del Paciente"
            : isEditMode
            ? "Editar Paciente"
            : "Crear Paciente"
        }
      >
        {isViewMode ? (
          // VIEW MODE: show patient details and exams
          <div>
            {selectedPatient ? (
              <div className="oc-card" style={{ padding: 12 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div><strong>Nombre:</strong> {selectedPatient.name}</div>
                  <div><strong>Documento:</strong> {selectedPatient.document}</div>
                  <div><strong>Teléfono:</strong> {selectedPatient.age ?? ""}</div>
                  <div><strong>Fecha Nac.:</strong> {formatDateShort(selectedPatient.birth_date)}</div>
                  <div><strong>Dirección:</strong> {selectedPatient.address}</div>
                  <div><strong>Ciudad:</strong> {selectedPatient.city}</div>
                  <div><strong>Correo:</strong> {selectedPatient.neighborhood}</div>
                  <div><strong>Género:</strong> {selectedPatient.gender}</div>
                  <div><strong>Observaciones:</strong> {selectedPatient.observations}</div>
                </div>
              </div>
            ) : (
              <div>Cargando paciente...</div>
            )}

            <hr style={{ margin: "12px 0" }} />

            <h4>Exámenes asociados</h4>
            {loadingExamsForPatient ? (
              <div className="oc-loading">Cargando exámenes...</div>
            ) : patientExams.length === 0 ? (
              <div className="oc-placeholder">No hay exámenes registrados para este paciente.</div>
            ) : (
              <div className="oc-table-wrapper" style={{ marginTop: 8 }}>
                <table className="oc-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>OD Esfera</th>
                      <th>OD Cil.</th>
                      <th>OD Eje</th>
                      <th>OI Esfera</th>
                      <th>OI Cil.</th>
                      <th>OI Eje</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientExams.map((ex) => (
                      <tr key={ex.id ?? ex._id ?? JSON.stringify(ex)}>
                        <td>{ex.id ?? ex._id ?? ""}</td>
                        <td>{ex.exam_datetime ? ex.exam_datetime.substring(0, 10) : formatDateShort(ex.date)}</td>
                        <td>{ex.od_sphere}</td>
                        <td>{ex.od_cylinder}</td>
                        <td>{ex.od_axis}</td>
                        <td>{ex.oi_sphere}</td>
                        <td>{ex.oi_cylinder}</td>
                        <td>{ex.oi_axis}</td>
                        <td>{ex.observations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // CREATE / EDIT MODE: form
          <form className="oc-form" onSubmit={handleSubmit} noValidate>
            <div className="oc-row oc-separator">
              <div className="oc-col">
                <label className="oc-label">Nombre</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`oc-input ${errors.name ? "oc-input-error" : ""}`}
                />
                {errors.name && <div className="oc-field-error">{errors.name}</div>}
              </div>

              <div className="oc-col">
                <label className="oc-label">Documento</label>
                <input
                  name="document"
                  value={form.document}
                  onChange={handleChange}
                  className={`oc-input ${errors.document ? "oc-input-error" : ""}`}
                />
                {errors.document && <div className="oc-field-error">{errors.document}</div>}
              </div>
            </div>

            <div className="oc-row oc-separator">
              <div className="oc-col">
             <label className="oc-label">Teléfono</label>
             <input
               name="age"
               type="text"
               maxLength="10"
               value={form.age}
               onChange={(e) => {
                 // solo números
                 const val = e.target.value.replace(/\D/g, "");
                 handleChange({ target: { name: "age", value: val } });
               }}
               className={`oc-input ${errors.age ? "oc-input-error" : ""}`}
               placeholder="Teléfono (10 dígitos)"
             />
             {errors.age && <div className="oc-field-error">{errors.age}</div>}
            </div>  

              <div className="oc-col">
                <label className="oc-label">Fecha de nacimiento</label>
                <input
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={handleChange}
                  className={`oc-input ${errors.birth_date ? "oc-input-error" : ""}`}
                />
                {errors.birth_date && <div className="oc-field-error">{errors.birth_date}</div>}
              </div>
            </div>

            <div className="oc-row oc-separator">
              <div className="oc-col">
                <label className="oc-label">Dirección</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`oc-input ${errors.address ? "oc-input-error" : ""}`}
                />
                {errors.address && <div className="oc-field-error">{errors.address}</div>}
              </div>

              <div className="oc-col">
                <label className="oc-label">Ciudad</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={`oc-input ${errors.city ? "oc-input-error" : ""}`}
                />
                {errors.city && <div className="oc-field-error">{errors.city}</div>}
              </div>
            </div>

            <div className="oc-row oc-separator">
             <div className="oc-col">
             <label className="oc-label">Correo</label>
             <input
               name="neighborhood"
               type="email"
               value={form.neighborhood}
               onChange={handleChange}
               className={`oc-input ${errors.neighborhood ? "oc-input-error" : ""}`}
               placeholder="correo@example.com"
             />
             {errors.neighborhood && <div className="oc-field-error">{errors.neighborhood}</div>}
                </div>

              <div className="oc-col">
                <label className="oc-label">Género</label>
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`oc-input ${errors.gender ? "oc-input-error" : ""}`}
                  placeholder="Male / Female / Other"
                />
                {errors.gender && <div className="oc-field-error">{errors.gender}</div>}
              </div>
            </div>

            <div className="oc-row">
              <label className="oc-label">Observaciones</label>
              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                className={`oc-textarea ${errors.observations ? "oc-input-error" : ""}`}
                rows={3}
                placeholder="Observaciones..."
              />
              {errors.observations && <div className="oc-field-error">{errors.observations}</div>}
            </div>

            {/* {isEditMode && (
              <div className="oc-row">
                <label className="oc-label">Motivo de edición (requerido)</label>
                <textarea
                  name="edit_reason"
                  value={form.edit_reason}
                  onChange={handleChange}
                  className={`oc-textarea ${errors.edit_reason ? "oc-input-error" : ""}`}
                  rows={3}
                  placeholder="Explique brevemente por qué modifica este registro..."
                  required
                />
                {errors.edit_reason && <div className="oc-field-error">{errors.edit_reason}</div>}
              </div>
            )} */}

            <div className="oc-actions">
              <button type="button" className="oc-btn-secondary" onClick={handleClose} disabled={isSaving}>
                Cancelar
              </button>
              <button type="submit" className="oc-btn-primary" disabled={isSaving}>
                {isSaving ? (isEditMode ? "Guardando..." : "Guardando...") : isEditMode ? "Guardar Cambios" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toast */}
      <div className="oc-toast-wrapper" aria-live="polite">
        <Toast toast={toast} onClose={closeToast} />
      </div>
    </div>
  );
}
