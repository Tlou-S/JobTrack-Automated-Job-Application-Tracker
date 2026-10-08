import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaBriefcase, FaCalendarAlt, FaFileAlt, FaPlus, FaTrash } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { applicationStatuses, loadApplications, saveApplications, type ApplicationPriority, type ApplicationStatus, type JobApplication } from "../lib/jobApplications";
import "./JobTrackerPage.css";

export type TrackerView = "dashboard" | "applications" | "companies" | "interviews" | "resumes" | "detail";
type Props = { view: TrackerView };
const blankApplication = { jobTitle: "", company: "", location: "", employmentType: "Full-time", salary: "", applicationDate: new Date().toISOString().slice(0, 10), status: "APPLIED" as ApplicationStatus, priority: "MEDIUM" as ApplicationPriority, jobUrl: "", contactPerson: "", notes: "", interviewDate: "" };
const statusLabel = (status: ApplicationStatus) => status.charAt(0) + status.slice(1).toLowerCase();

function TrackerPage({ view }: Props) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>(loadApplications);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankApplication);
  const [resumes, setResumes] = useState<{ name: string; size: number; added: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("jobtrack_resumes_v1") || "[]"); } catch { return []; }
  });
  useEffect(() => saveApplications(applications), [applications]);
  useEffect(() => localStorage.setItem("jobtrack_resumes_v1", JSON.stringify(resumes)), [resumes]);

  const total = applications.length;
  const interviews = applications.filter((app) => app.status === "INTERVIEW");
  const upcoming = interviews.filter((app) => app.interviewDate && new Date(app.interviewDate) >= new Date());
  const recent = [...applications].sort((a, b) => b.applicationDate.localeCompare(a.applicationDate)).slice(0, 5);
  const companies = [...new Set(applications.map((app) => app.company))].sort();
  const filtered = applications.filter((app) => `${app.jobTitle} ${app.company} ${app.location}`.toLowerCase().includes(search.toLowerCase()) && (!statusFilter || app.status === statusFilter));
  const selected = applications.find((app) => app.id === id);
  const addApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplications((current) => [{ ...form, id: `application-${Date.now()}` }, ...current]);
    setForm(blankApplication);
    setShowForm(false);
  };
  const updateStatus = (appId: string, status: ApplicationStatus) => setApplications((items) => items.map((app) => app.id === appId ? { ...app, status } : app));
  const removeApplication = (appId: string) => setApplications((items) => items.filter((app) => app.id !== appId));
  const title = { dashboard: "Dashboard", applications: "Applications", companies: "Companies", interviews: "Interviews", resumes: "Resumes & CVs", detail: "Application details" }[view];

  return <div className="jobtrack-page"><Navbar /><main className="jt-main">
    <header className="jt-page-heading"><div><p className="jt-eyebrow">JOBTRACK / {view.toUpperCase()}</p><h1>{title}</h1><p className="jt-subtitle">Keep every opportunity, conversation, and next step in one place.</p></div>{(view === "dashboard" || view === "applications") && <button className="jt-primary-button" type="button" onClick={() => setShowForm((open) => !open)}><FaPlus /> {showForm ? "Close form" : "Add application"}</button>}</header>
    {showForm && <form className="jt-form" onSubmit={addApplication}><div className="jt-form-heading"><h2>New application</h2><span>Fields marked * are required</span></div>
      <label>Job title *<input required value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></label><label>Company *<input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
      <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label><label>Employment type<select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>{["Full-time", "Part-time", "Internship", "Graduate programme", "Contract"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Salary<input placeholder="e.g. R25,000 / month" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></label><label>Application date<input type="date" value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} /></label>
      <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>{applicationStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ApplicationPriority })}>{["LOW", "MEDIUM", "HIGH"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Job URL<input type="url" placeholder="https://" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} /></label><label>Contact person<input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></label><label>Interview date<input type="datetime-local" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} /></label><label className="jt-wide-field">Notes<textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label><button className="jt-primary-button jt-wide-field" type="submit">Save application</button>
    </form>}

    {view === "dashboard" && <><section className="jt-metrics"><Metric label="Total applications" value={total} /><Metric label="Applications sent" value={applications.filter((app) => app.status !== "SAVED").length} /><Metric label="Interviews" value={interviews.length} /><Metric label="Offers" value={applications.filter((app) => app.status === "OFFER").length} /><Metric label="Rejected" value={applications.filter((app) => app.status === "REJECTED").length} /></section>
      <section className="jt-dashboard-grid"><div className="jt-panel"><div className="jt-panel-heading"><div><h2>Upcoming interviews</h2><p>Your next scheduled conversations</p></div><Link to="/interviews">All interviews</Link></div>{upcoming.length ? upcoming.map((app) => <InterviewRow key={app.id} application={app} />) : <p className="jt-empty">No upcoming interviews yet.</p>}</div>
        <div className="jt-panel"><h2>Application progress</h2><p className="jt-panel-caption">Current opportunities by stage</p>{applicationStatuses.map((status) => { const count = applications.filter((app) => app.status === status).length; return <div className="jt-progress-row" key={status}><span>{statusLabel(status)}</span><div><i style={{ width: `${Math.max(4, count / Math.max(1, applications.length) * 100)}%` }} /></div><b>{count}</b></div>; })}</div></section>
      <ApplicationTable applications={recent} onStatusChange={updateStatus} onRemove={removeApplication} compact /></>}

    {view === "applications" && <><section className="jt-list-controls"><input aria-label="Search applications" placeholder="Search title, company, or location" value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All statuses</option>{applicationStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select><span>{filtered.length} applications</span></section><ApplicationTable applications={filtered} onStatusChange={updateStatus} onRemove={removeApplication} /></>}

    {view === "detail" && (selected ? <section className="jt-panel jt-detail-panel"><Link className="jt-back-link" to="/applications"><FaArrowLeft /> Applications</Link><div className="jt-detail-heading"><div><p className="jt-eyebrow">{selected.company}</p><h2>{selected.jobTitle}</h2><p>{selected.location} · {selected.employmentType}</p></div><StatusBadge status={selected.status} /></div><div className="jt-detail-fields"><Field label="Salary" value={selected.salary} /><Field label="Application date" value={selected.applicationDate} /><Field label="Priority" value={selected.priority} /><Field label="Contact person" value={selected.contactPerson} /><Field label="Job URL" value={selected.jobUrl} /><Field label="Notes" value={selected.notes} /></div><label className="jt-status-edit">Update status<select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value as ApplicationStatus)}>{applicationStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label></section> : <p className="jt-empty">Application not found. <Link to="/applications">Return to applications</Link></p>)}

    {view === "companies" && <section className="jt-company-grid">{companies.map((company) => { const roles = applications.filter((app) => app.company === company); return <article className="jt-company-item" key={company}><div className="jt-company-mark">{company.slice(0, 1)}</div><div><h2>{company}</h2><p>{roles.length} {roles.length === 1 ? "application" : "applications"}</p><span>{roles.map((app) => app.jobTitle).join(" · ")}</span></div><Link to="/applications">View</Link></article>; })}</section>}
    {view === "interviews" && <section className="jt-panel jt-interview-list"><div className="jt-panel-heading"><div><h2>Interview schedule</h2><p>Upcoming and completed interview stages</p></div><span>{interviews.length} total</span></div>{interviews.length ? interviews.map((app) => <InterviewRow key={app.id} application={app} />) : <p className="jt-empty">Applications moved to Interview will appear here.</p>}</section>}
    {view === "resumes" && <section className="jt-panel jt-resume-panel"><div className="jt-panel-heading"><div><h2>Your resume library</h2><p>Keep CV versions organized for different roles.</p></div><label className="jt-primary-button jt-upload-button"><FaPlus /> Add CV<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const file = e.target.files?.[0]; if (file) setResumes((items) => [{ name: file.name, size: file.size, added: new Date().toISOString() }, ...items]); e.target.value = ""; }} /></label></div>{resumes.length ? resumes.map((resume, index) => <div className="jt-resume-row" key={`${resume.name}-${index}`}><FaFileAlt /><div><strong>{resume.name}</strong><span>{(resume.size / 1024).toFixed(0)} KB · Added {new Date(resume.added).toLocaleDateString()}</span></div><button aria-label={`Remove ${resume.name}`} type="button" onClick={() => setResumes((items) => items.filter((_, i) => i !== index))}><FaTrash /></button></div>) : <p className="jt-empty">No CVs added yet. PDF and Word files are supported.</p>}</section>}
  </main><Footer /></div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <article className="jt-metric"><div><span>{label}</span><strong>{value}</strong></div><i><FaBriefcase /></i></article>; }
function StatusBadge({ status }: { status: ApplicationStatus }) { return <span className={`jt-status jt-status-${status.toLowerCase()}`}>{statusLabel(status)}</span>; }
function ApplicationTable({ applications, onStatusChange, onRemove, compact = false }: { applications: JobApplication[]; onStatusChange: (id: string, status: ApplicationStatus) => void; onRemove: (id: string) => void; compact?: boolean }) {
  return <section className="jt-panel jt-applications-panel"><div className="jt-panel-heading"><div><h2>{compact ? "Recent applications" : "Your applications"}</h2><p>{compact ? "The latest changes in your pipeline" : "Update progress as you hear back."}</p></div><Link to="/applications">View all</Link></div>{applications.length ? <div className="jt-table-scroll"><table className="jt-table"><thead><tr><th>Job & company</th><th>Applied</th><th>Priority</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{applications.map((app) => <tr key={app.id}><td><Link className="jt-job-link" to={`/applications/${app.id}`}>{app.jobTitle}</Link><span className="jt-company-name">{app.company} · {app.location}</span></td><td>{app.applicationDate}</td><td><span className={`jt-priority jt-priority-${app.priority.toLowerCase()}`}>{app.priority}</span></td><td><select aria-label={`Status for ${app.jobTitle}`} value={app.status} onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}>{applicationStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></td><td><button className="jt-icon-button" aria-label={`Remove ${app.jobTitle}`} type="button" onClick={() => onRemove(app.id)}><FaTrash /></button></td></tr>)}</tbody></table></div> : <p className="jt-empty">No applications match this view.</p>}{compact && applications.length > 0 && <p className="jt-table-note">Showing the {applications.length} most recently updated opportunities</p>}</section>;
}
function InterviewRow({ application }: { application: JobApplication }) { return <article className="jt-interview-row"><div className="jt-interview-date"><FaCalendarAlt /><span>{application.interviewDate ? new Date(application.interviewDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Date TBC"}</span></div><div><Link to={`/applications/${application.id}`}>{application.jobTitle}</Link><p>{application.company}{application.interviewDate ? ` · ${new Date(application.interviewDate).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}</p></div><StatusBadge status={application.status} /></article>; }
function Field({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><p>{value || "Not provided"}</p></div>; }
export default TrackerPage;