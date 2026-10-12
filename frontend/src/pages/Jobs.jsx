
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";
import { ActionButton, Arrow, PageHeader, Tag } from "../components/Common";
import { savePlan, isPlanSaved, removeSavedPlan } from "../savedPlans.js";
function SaveJobButton({ job }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(isPlanSaved(String(job._id)));
  }, [job._id]);
  const toggleSave = () => {
    const id = String(job._id);
    if (saved) {
      removeSavedPlan(id);
      setSaved(false);
    } else {
      savePlan({ id, type: "job", title: job.name, name: job.name, description: job.description || "", company: job.company || "", location: job.location || "", salary: job.salary || "", jobType: job.type || "Full-time", skills: job.skills || [] });
      setSaved(true);
    }
  };
  return <button type="button" onClick={toggleSave}>{saved ? "Saved · Remove" : "Save Job"}</button>;
}
export function JobExplorer({ go, setSelectedJob }) {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await axios.get(`${API}/jobs`);
        setJobs(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);
  const visible = jobs.filter((job) => `${job.name || ""} ${job.company || ""} ${job.location || ""} ${(job.skills || []).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <main className="page">
      <PageHeader eyebrow="OPPORTUNITY · NEXT STEPS" title="Job Explorer"><span className="result-count">{visible.length} roles</span></PageHeader>
      <div className="search-row">
        <label><span>SEARCH ROLES</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Role, company, skill or location" /></label>
        <button type="button" onClick={() => setQuery("")}>Clear</button>
      </div>
      {loading && <div className="empty"><p>Loading jobs...</p></div>}
      {error && <div className="empty"><h2>{error}</h2></div>}
      {!loading && !error && <section className="jobs-list">
        {visible.map((job, index) => <article className="job-card" key={job._id}>
          <div className="job-number">{String(index + 1).padStart(2, "0")}</div>
          <div>
            <div className="card-kicker"><span>{job.company}</span><span>{job.type || "Full-time"}</span></div>
            <h2>{job.name}</h2>
            <p>{job.location} · {job.salary || "Salary not specified"}</p>
            <div className="tags">{(job.skills || []).map((skill) => <Tag key={skill}>{skill}</Tag>)}</div>
          </div>
          <div className="job-action">
            <strong>View role</strong>
            <ActionButton onClick={() => { setSelectedJob(job); go("job"); }}>View role</ActionButton>
            <SaveJobButton job={job} />
          </div>
        </article>)}
      </section>}
      {!loading && !error && !visible.length && <div className="empty"><h2>No jobs found.</h2><p>Add jobs from the admin dashboard.</p></div>}
    </main>
  );
}
export function JobDetails({ go, job }) {
  if (!job) return <main className="page"><PageHeader eyebrow="JOB OPPORTUNITY" title="No job selected" /><ActionButton onClick={() => go("jobs")}>Back to jobs</ActionButton></main>;
  return (
    <main className="page detail-page">
      <button type="button" className="back" onClick={() => go("jobs")}>← Back to jobs</button>
      <PageHeader eyebrow={`JOB OPPORTUNITY · ${job.type || "FULL-TIME"}`} title={job.name}><ActionButton onClick={() => go("cover")}>Generate cover letter</ActionButton><SaveJobButton job={job} /></PageHeader>
      <div className="detail-meta"><span>{job.company}</span><span>{job.location}</span>{job.salary && <span>{job.salary}</span>}<span>{job.type || "Full-time"}</span></div>
      <div className="detail-layout">
        <section className="detail-main">
          <div className="section-block"><div className="eyebrow">ABOUT THE ROLE</div><p className="lead">{job.description || "Explore this opportunity and compare its requirements with your skills and interests."}</p></div>
          <div className="section-block"><div className="eyebrow">REQUIRED SKILLS</div><div className="tags">{(job.skills || []).map((skill) => <Tag key={skill}>{skill}</Tag>)}</div></div>
        </section>
        <aside className="detail-side">
          <div className="match-card"><span>YOUR OPPORTUNITY</span><strong>OPEN</strong><p>Compare this role with your current profile before applying.</p></div>
          <div className="side-card"><div className="eyebrow">COMPANY</div><h3>{job.company}</h3><p>{job.location}</p></div>
        </aside>
      </div>
      <div className="sticky-action"><div><strong>{job.name}</strong><span>{job.company}</span></div><ActionButton onClick={() => go("cover")}>Generate cover letter</ActionButton><SaveJobButton job={job} /></div>
    </main>
  );
}
