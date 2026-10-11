import {useState} from "react";
import {ActionButton} from "../components/Common.jsx";

export function Scenario({go})
{
    const [education,setEducation]=useState("");
    const [career,setCareer]=useState("");
    const [skills,setSkills]=useState("");
    const [result,setResult]=useState(false);
    const [error,setError]=useState("");

    const createScenario=()=>
    {
        if(!education.trim()||!career.trim())
        {
            setError("Please enter both your education path and career goal.");
            setResult(false);
            return;
        }
        setError("");
        setResult(true);
    };

    const resetScenario=()=>
    {
        setEducation("");
        setCareer("");
        setSkills("");
        setResult(false);
        setError("");
    };

    return <main className="page">
        <header className="page-header">
            <div>
                <div className="eyebrow">PLAN YOUR FUTURE</div>
                <h1>What If?</h1>
                <p>Explore how different choices could shape your career.</p>
            </div>
        </header>
        <section className="section-block">
            <div className="section-title">
                <h2>Create a scenario</h2>
                <p>Change your choices and explore a possible career direction.</p>
            </div>
            <div className="scenario-form">
                <div className="scenario-field">
                    <label htmlFor="scenario-education">Education path</label>
                    <input id="scenario-education" type="text" value={education} onChange={event=>setEducation(event.target.value)} placeholder="e.g. Computer Science degree"/>
                </div>
                <div className="scenario-field">
                    <label htmlFor="scenario-career">Career goal</label>
                    <input id="scenario-career" type="text" value={career} onChange={event=>setCareer(event.target.value)} placeholder="e.g. UX Designer"/>
                </div>
                <div className="scenario-field">
                    <label htmlFor="scenario-skills">Skills you have or want to develop</label>
                    <textarea id="scenario-skills" rows="4" value={skills} onChange={event=>setSkills(event.target.value)} placeholder="e.g. Figma, communication, research"/>
                </div>
                {error&&<p className="error">{error}</p>}
                <div className="scenario-actions">
                    <ActionButton onClick={createScenario}>Explore scenario</ActionButton>
                    <button type="button" className="back-button" onClick={resetScenario}>Reset</button>
                </div>
            </div>
            {result&&<div className="inline-card scenario-result">
                <div className="eyebrow">YOUR SCENARIO</div>
                <h3>{career}</h3>
                <p><strong>Education path:</strong> {education}</p>
                <p><strong>Career goal:</strong> {career}</p>
                <p><strong>Skills:</strong> {skills.trim()||"No skills added yet"}</p>
                <p>This is a starting point for exploring your options, not a prediction of guaranteed outcomes.</p>
                <button type="button" onClick={()=>go("career")}>Explore career paths</button>
            </div>}
        </section>
    </main>;
}