import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function FacultyManagement({ role }) {
  const [faculty, setFaculty] = useState([]); const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", facultyId: "", designation: "" });
  const load = async () => { try { const data = await api("/auth/faculties"); setFaculty(data.faculties || []); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); setError(""); try { await api("/auth/admin/register-faculty", { method: "POST", body: JSON.stringify(form) }); setForm({ name: "", email: "", password: "", department: "", facultyId: "", designation: "" }); load(); } catch (err) { setError(err.message); } };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return <section className="page-section"><div className="page-hero glass"><div><span className="eyebrow">FACULTY</span><h1>Faculty Management</h1><p>Register faculty and view the faculty accounts already stored in MongoDB.</p><div className="hero-mini-row"><span className="glass mini-pill">✦ {role}</span><span className="glass mini-pill">● Connected</span></div></div><div className="hero-sculpture" aria-hidden="true"><div className="sculpture-core" /><div className="sculpture-ring" /></div></div>
    {error && <div className="form-error page-error">{error}</div>}
    <form className="management-form glass" onSubmit={submit}><span className="card-kicker">ADD FACULTY</span><div className="form-grid"><input required value={form.name} onChange={set("name")} placeholder="Full name" /><input required type="email" value={form.email} onChange={set("email")} placeholder="Email" /><input required type="password" minLength="8" value={form.password} onChange={set("password")} placeholder="Password (8+ characters)" /><input required value={form.department} onChange={set("department")} placeholder="Department" /><input required value={form.facultyId} onChange={set("facultyId")} placeholder="Faculty ID" /><input required value={form.designation} onChange={set("designation")} placeholder="Designation" /></div><button className="continue-button small-button" type="submit">Register Faculty <span>→</span></button></form>
    <div className="content-grid">{faculty.map((item) => <article className="content-card glass" key={item._id}><div className="content-icon">◇</div><div><span className="card-kicker">FACULTY</span><h3>{item.name}</h3><p>{item.designation || "Faculty"} · {item.department || "Department not set"}</p><small>{item.email}</small></div></article>)}</div>
  </section>;
}
