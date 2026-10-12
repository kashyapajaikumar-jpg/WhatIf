
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";
import { ActionButton, Arrow, Tag } from "../components/Common";
import { savePlan, isPlanSaved, removeSavedPlan } from "../savedPlans.js";
function SaveCareerButton({ career }) {
  const [saved, setSaved] = useState(false);
  const id = String(career._id || career.id || career.name);
  useEffect(() => {
    setSaved(isPlanSaved(`career-${id}`));
  }, [id]);
  const toggleSave = () => {
    const savedId = `career-${id}`;
    if (saved) {
      removeSavedPlan(savedId);
      setSaved(false);
    } else {
      savePlan({ id: savedId, type: "career", title: career.name, name: career.name, description: career.description || "", industry: career.industry || "", salary: career.salary || "", opportunity: career.opportunity || "" });
      setSaved(true);
    }
  };
  return <button type="button" onClick={toggleSave}>{saved ? "Saved · Remove" : "Save Career"}</button>;
}
export function CareerDetails({ go }) {
  const [careers, setCareers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCareer, setSelectedCareer] = useState(null);
  const getCareers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API}/careers`);
      setCareers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load careers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getCareers();
  }, []);
  const visible = careers.filter((career) => `${career.name || ""} ${career.description || ""} ${career.industry || ""} ${career.salary || ""} ${career.opportunity || ""}`.toLowerCase().includes(query.toLowerCase()));
  if (selectedCareer) {
    return (
      <main className="page detail-page">
        <button type="button" className="text-button" onClick={() => setSelectedCareer(null)}>← Back to careers</button>
        <div className="eyebrow">CAREER DETAILS</div>
        <div className="career-hero">
          <div><h1>{selectedCareer.name}</h1><p>{selectedCareer.description}</p></div>
          <div className="salary"><span>INDUSTRY</span><strong>{selectedCareer.industry || "Not specified"}</strong><small>Explore the opportunities in this field</small></div>
        </div>
        <div className="detail-meta"><SaveCareerButton career={selectedCareer} /></div>
        <div className="detail-layout career-layout">
          <section className="detail-main">
            <div className="section-block"><div className="eyebrow">ROLE OVERVIEW</div><h2>What this career involves</h2><p className="lead">{selectedCareer.description}</p></div>
            <div className="section-block"><div className="eyebrow">CAREER INFORMATION</div><div className="tags"><Tag>{selectedCareer.industry || "Industry not specified"}</Tag>{selectedCareer.salary && <Tag>Salary: {selectedCareer.salary}</Tag>}{selectedCareer.opportunity && <Tag>{selectedCareer.opportunity}</Tag>}</div></div>
            <div className="section-block"><div className="eyebrow">EXPLORE YOUR NEXT STEP</div><button type="button" className="inline-card" onClick={() => go("skills")}><span>Check your skill gap</span><Arrow /></button><button type="button" className="inline-card" onClick={() => go("jobs")}><span>Explore job opportunities</span><Arrow /></button></div>
          </section>
          <aside className="detail-side">
            <div className="match-card"><span>YOUR NEXT STEP</span><strong>01</strong><p>Review the skills you have and identify what you could develop for this career.</p><ActionButton light onClick={() => go("skills")}>View skill gap</ActionButton></div>
            <div className="side-card"><div className="eyebrow">OPPORTUNITIES</div><h3>Explore available jobs.</h3><ActionButton onClick={() => go("jobs")}>View jobs</ActionButton></div>
          </aside>
        </div>
      </main>
    );
  }
  return (
    <main className="page detail-page">
      <div className="eyebrow">CAREER PATH · EXPLORATION</div>
      <div className="career-hero">
        <div><h1>Career<br />Paths</h1><p>Explore possible careers, understand required skills and compare your options.</p></div>
        <div className="salary"><span>WHAT IF?</span><strong>{careers.length || "Explore"}</strong><small>{careers.length ? "Career paths available" : "Find a path that fits you"}</small></div>
      </div>
      <div className="detail-layout career-layout">
        <section className="detail-main">
          <div className="section-block"><div className="eyebrow">CAREER EXPLORATION</div><p className="lead">Your education can lead to multiple career paths. Compare roles, industries and opportunities before making a decision.</p></div>
          <div className="section-block">
            <div className="eyebrow">AVAILABLE CAREERS</div>
            <div className="search-row"><label><span>SEARCH CAREERS</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search careers, industries or opportunities" /></label><button type="button" onClick={() => setQuery("")}>Clear</button></div>
            {loading && <div className="empty"><p>Loading careers...</p></div>}
            {error && <div className="empty"><h2>{error}</h2><button type="button" className="text-button" onClick={getCareers}>Try again</button></div>}
            {!loading && !error && <section className="card-grid">
              {visible.map((career, index) => <article className="course-card" key={career._id || career.name || index}>
                <div role="button" tabIndex={0} aria-label={`View details for ${career.name}`} onClick={() => setSelectedCareer(career)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCareer(career); } }} style={{ cursor: "pointer" }}>
                  <div className="card-kicker"><span>CAREER {String(index + 1).padStart(2, "0")}</span><span>{career.industry}</span></div>
                  <h2>{career.name}</h2><p>{career.description}</p>
                  <div className="tags">{career.industry && <Tag>{career.industry}</Tag>}{career.opportunity && <Tag>{career.opportunity}</Tag>}{career.salary && <Tag>{career.salary}</Tag>}</div>
                  <div className="career-card-link">Explore career details <Arrow /></div>
                </div>
                <SaveCareerButton career={career} />
              </article>)}
            </section>}
            {!loading && !error && !visible.length && <div className="empty"><h2>No careers found.</h2><p>Try a broader career or industry.</p></div>}
          </div>
          <div className="section-block"><div className="eyebrow">NEXT STEP</div><button type="button" className="inline-card" onClick={() => go("skills")}><span>Check your skill gap</span><Arrow /></button><button type="button" className="inline-card" onClick={() => go("jobs")}><span>Explore job opportunities</span><Arrow /></button></div>
        </section>
        <aside className="detail-side">
          <div className="match-card"><span>YOUR NEXT STEP</span><strong>01</strong><p>Choose a career to learn more, then compare its requirements with your current profile.</p><ActionButton light onClick={() => go("skills")}>View skill gap</ActionButton></div>
          <div className="side-card"><div className="eyebrow">READY?</div><h3>See available opportunities.</h3><ActionButton onClick={() => go("jobs")}>View jobs</ActionButton></div>
        </aside>
      </div>
    </main>
  );
}
