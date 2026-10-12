
import { useEffect, useState } from "react";
import { ActionButton, Arrow, PageHeader } from "../components/Common.jsx";
import { getSavedPlans, removeSavedPlan } from "../savedPlans.js";
export function SavedPlans({ go, onExplore }) {
const [plans, setPlans] = useState([]);
const [error, setError] = useState("");
const refreshPlans = () => setPlans(getSavedPlans());
useEffect(() => {
try {
refreshPlans();
} catch {
setError("Unable to load saved plans.");
}
}, []);
const handleRemove = (id) => {
try {
removeSavedPlan(id);
refreshPlans();
setError("");
} catch {
setError("Unable to remove this saved plan.");
}
};
return (
<main className="page">
<PageHeader eyebrow="YOUR LIBRARY" title="Saved plans" />
<section className="saved-hero">
<div>
<span>EXPLORE YOUR FUTURE</span>
<h2>Build your<br />future path</h2>
<p>Compare courses, careers and opportunities.</p>
</div>
<div className="saved-actions">
<div className="big-progress">→</div>
<ActionButton light onClick={() => go("scenario")}>Start scenario</ActionButton>
</div>
</section>
{error && <p role="alert">{error}</p>}
<div className="section-title"><div className="eyebrow">YOUR SAVED ITEMS</div><span>{plans.length} saved</span></div>
{plans.length === 0 ? (
<section className="saved-list"><div><strong>No saved plans yet</strong><p>Save a course, career, job or What If? scenario to see it here.</p></div></section>
) : (
<div className="saved-list">
{plans.map((plan, index) => (
<article key={`${plan.id || plan.title || plan.name}-${index}`} className="saved-plan-item">
<span>{String(plan.type || "PLAN").toUpperCase()}</span>
<strong>{plan.title || plan.name || "Saved plan"}</strong>
{plan.description && <p>{plan.description}</p>}
<div className="saved-plan-actions">
<button type="button" onClick={() => onExplore ? onExplore(plan) : go(plan.type === "course" ? "courses" : plan.type === "job" ? "jobs" : plan.type === "career" ? "career" : plan.type === "scenario" ? "scenario" : "skills")}>Explore</button>
<button type="button" onClick={() => handleRemove(plan.id)}>Remove</button>
</div>
<Arrow />
</article>
))}
</div>
)}
<div className="section-title"><div className="eyebrow">AVAILABLE EXPLORATIONS</div><span>3 options</span></div>
<div className="saved-list">
<button type="button" onClick={() => go("courses")}><span>COURSES</span><strong>Explore educational paths</strong><Arrow /></button>
<button type="button" onClick={() => go("skills")}><span>SKILLS</span><strong>Check your skill gap</strong><Arrow /></button>
<button type="button" onClick={() => go("jobs")}><span>JOBS</span><strong>Explore opportunities</strong><Arrow /></button>
</div>
</main>
);
}
