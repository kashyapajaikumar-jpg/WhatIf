import {useState} from "react";
import {ActionButton} from "../components/Common.jsx";
import "./Scenario.css";

const careerData=[
    {
        name:"UX Designer",
        keywords:["ux","user experience","product design","ui/ux"],
        skills:["Figma","User research","Wireframing","Prototyping","Usability testing"],
        steps:[
            "Learn UX fundamentals and practise designing in Figma.",
            "Build two or three portfolio case studies showing your design process.",
            "Practise user interviews and usability testing.",
            "Explore UX internships and entry-level design roles."
        ],
        related:["UI Designer","Product Designer","UX Researcher"],
        description:"UX designers research user needs and shape digital experiences that are useful, accessible, and easy to navigate.",
        projects:["Redesign a confusing app screen","Create a user journey map","Build a clickable Figma prototype"]
    },
    {
        name:"Software Developer",
        keywords:["software","developer","programmer","web developer","full stack"],
        skills:["Programming","Data structures","Git and GitHub","API integration","Testing"],
        steps:[
            "Choose a programming language and strengthen the fundamentals.",
            "Build projects that solve practical problems.",
            "Learn Git, APIs and software testing.",
            "Prepare a portfolio and explore junior developer roles."
        ],
        related:["Frontend Developer","Backend Developer","Software Tester"],
        description:"Software developers build, test, and maintain applications that solve user or business problems.",
        projects:["Build a CRUD web application","Connect a frontend to a REST API","Write tests for an existing project"]
    },
    {
        name:"Data Analyst",
        keywords:["data analyst","analytics","business analyst"],
        skills:["Excel","SQL","Data visualisation","Statistics","Power BI or Tableau"],
        steps:[
            "Learn spreadsheet analysis and SQL.",
            "Practise cleaning and interpreting datasets.",
            "Create dashboards that communicate useful findings.",
            "Build data-analysis projects for your portfolio."
        ],
        related:["Business Analyst","BI Analyst","Data Scientist"],
        description:"Data analysts turn raw data into useful findings that help teams understand performance and make decisions.",
        projects:["Analyse a public dataset","Create a dashboard","Write SQL queries to answer business questions"]
    },
    {
        name:"Cybersecurity Analyst",
        keywords:["cybersecurity","security analyst","information security"],
        skills:["Networking","Linux","Security fundamentals","Log analysis","Incident response"],
        steps:[
            "Learn networking and operating-system fundamentals.",
            "Study common vulnerabilities and security controls.",
            "Practise in authorised cybersecurity labs.",
            "Build practical projects and explore entry-level security roles."
        ],
        related:["Security Engineer","SOC Analyst","Penetration Tester"],
        description:"Cybersecurity analysts help protect systems and data by monitoring activity, investigating threats, and improving security controls.",
        projects:["Complete a beginner security lab","Analyse sample system logs","Create a basic security checklist"]
    },
    {
        name:"Product Manager",
        keywords:["product manager","product management"],
        skills:["Communication","User research","Prioritisation","Analytics","Product strategy"],
        steps:[
            "Understand how products are researched and developed.",
            "Practise identifying user problems and defining solutions.",
            "Learn prioritisation, metrics and product roadmaps.",
            "Create a product case study and explore associate product roles."
        ],
        related:["Business Analyst","Product Designer","Project Manager"],
        description:"Product managers connect user needs, business goals, and delivery teams to help guide what a product should build next.",
        projects:["Write a product requirements document","Prioritise a sample feature backlog","Define success metrics for an app"]
    }
];

const generalSkills=["Communication","Problem-solving","Research","Presentation","Teamwork"];

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

    const matchedCareer=careerData.find(item=>
        item.name.toLowerCase()===career.trim().toLowerCase()||
        item.keywords.some(keyword=>career.toLowerCase().includes(keyword))
    );

    const requiredSkills=matchedCareer?matchedCareer.skills:generalSkills;
    const enteredSkills=skills.split(",").map(skill=>skill.trim()).filter(Boolean);
    const missingSkills=requiredSkills.filter(required=>
        !enteredSkills.some(entered=>entered.toLowerCase()===required.toLowerCase())
    );
    const matchedSkills=requiredSkills.filter(required=>
        enteredSkills.some(entered=>entered.toLowerCase()===required.toLowerCase())
    );
    const matchPercent=Math.round((matchedSkills.length/requiredSkills.length)*100);
    const nextSteps=matchedCareer?matchedCareer.steps:[
        "Research the qualifications and entry requirements for this career.",
        "Identify the technical and transferable skills employers request.",
        "Complete a small project related to your chosen career.",
        "Explore internships, entry-level jobs and relevant courses."
    ];
    const relatedCareers=matchedCareer?matchedCareer.related:[
        "Research related roles",
        "Explore alternative career paths",
        "Compare relevant job opportunities"
    ];

    return (
        <main className="page scenario-page">
            <header className="page-header scenario-page-header">
                <div>
                    <div className="eyebrow">PLAN YOUR FUTURE</div>
                    <h1>What If?</h1>
                    <p>Explore how different choices could shape your career.</p>
                </div>
            </header>
            <section className="section-block scenario-section">
                <div className="section-title scenario-title-row">
                    <div>
                        <h2>Create a scenario</h2>
                        <p>Change your choices and explore a possible career direction.</p>
                    </div>
                    <span className="scenario-title-mark">YOUR NEXT MOVE STARTS HERE</span>
                </div>
                <div className="scenario-form">
                    <div className="scenario-field">
                        <label htmlFor="scenario-education">Education path</label>
                        <input id="scenario-education" type="text" value={education} onChange={event=>setEducation(event.target.value)} placeholder="e.g. Commerce or Computer Science" />
                    </div>
                    <div className="scenario-field">
                        <label htmlFor="scenario-career">Career goal</label>
                        <input id="scenario-career" type="text" value={career} onChange={event=>setCareer(event.target.value)} placeholder="e.g. UX Designer" />
                    </div>
                    <div className="scenario-field scenario-skills-field">
                        <label htmlFor="scenario-skills">Skills you have or want to develop</label>
                        <textarea id="scenario-skills" rows="4" value={skills} onChange={event=>setSkills(event.target.value)} placeholder="Enter skills separated by commas, e.g. Figma, Canva, communication" />
                        <span className="scenario-field-hint">Separate each skill with a comma so the platform can compare them.</span>
                    </div>
                    {error&&<p className="scenario-error" role="alert">{error}</p>}
                    <div className="scenario-actions">
                        <ActionButton onClick={createScenario}>Explore scenario</ActionButton>
                        <button type="button" className="back-button scenario-reset" onClick={resetScenario}>Reset</button>
                    </div>
                </div>
                {!result&&
                    <div className="scenario-empty-state">
                        <div className="scenario-empty-icon">↗</div>
                        <div>
                            <h3>Your future is not one fixed path.</h3>
                            <p>Enter your education, a career goal, and any skills you have. We’ll turn them into a practical starting plan.</p>
                        </div>
                    </div>
                }
                {result&&
                    <div className="scenario-result" aria-live="polite">
                        <div className="scenario-result-heading">
                            <div>
                                <div className="eyebrow">YOUR SCENARIO</div>
                                <h2>{career.trim()}</h2>
                                <p>{matchedCareer?matchedCareer.description:"We don’t have a dedicated guide for this exact title yet, so here is a general starting plan you can use to research it."}</p>
                            </div>
                            <span className="scenario-label">Career exploration</span>
                        </div>
                        <div className="scenario-summary-grid">
                            <div className="scenario-summary-card">
                                <span className="scenario-summary-number">01</span>
                                <span className="scenario-summary-label">EDUCATION PATH</span>
                                <strong>{education.trim()}</strong>
                            </div>
                            <div className="scenario-summary-card">
                                <span className="scenario-summary-number">02</span>
                                <span className="scenario-summary-label">CAREER GOAL</span>
                                <strong>{career.trim()}</strong>
                            </div>
                            <div className="scenario-summary-card">
                                <span className="scenario-summary-number">03</span>
                                <span className="scenario-summary-label">SKILLS ENTERED</span>
                                <strong>{enteredSkills.length} skill{enteredSkills.length===1?"":"s"}</strong>
                            </div>
                        </div>
                        <section className="scenario-result-section">
                            <div className="scenario-section-heading">
                                <div>
                                    <h3>Skill gap overview</h3>
                                    <p>Compare the skills you entered with a suggested list for this career.</p>
                                </div>
                                <strong className="scenario-match-score">{matchPercent}% matched</strong>
                            </div>
                            <div className="scenario-progress-track">
                                <div className="scenario-progress-fill" style={{width:`${matchPercent}%`}}></div>
                            </div>
                            <div className="scenario-skill-list">
                                {requiredSkills.map(skill=>
                                    <span className={`scenario-skill ${enteredSkills.some(entered=>entered.toLowerCase()===skill.toLowerCase())?"is-matched":"is-missing"}`} key={skill}>
                                        <span>{enteredSkills.some(entered=>entered.toLowerCase()===skill.toLowerCase())?"✓":"＋"}</span>{skill}
                                    </span>
                                )}
                            </div>
                            <p className="scenario-skill-note">
                                {enteredSkills.length===0
                                    ?"Add skills above to get a more personalised comparison."
                                    :missingSkills.length===0
                                        ?"Nice — you entered all the skills in this suggested list. Keep practising and build evidence of them through projects."
                                        :"Skills to consider learning next: "+missingSkills.join(", ")}
                            </p>
                        </section>
                        <section className="scenario-result-section">
                            <div className="scenario-section-heading">
                                <div>
                                    <h3>Your suggested roadmap</h3>
                                    <p>A few manageable steps to move from your current position toward your goal.</p>
                                </div>
                            </div>
                            <ol className="scenario-next-steps">
                                {nextSteps.map((step,index)=>(
                                    <li key={step}>
                                        <span className="scenario-step-index">{String(index+1).padStart(2,"0")}</span>
                                        <p>{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </section>
                        <section className="scenario-result-section">
                            <div className="scenario-section-heading">
                                <div>
                                    <h3>Try a small project</h3>
                                    <p>Practical work helps you test whether the career suits you and gives you something to show.</p>
                                </div>
                            </div>
                            <div className="scenario-project-grid">
                                {(matchedCareer?matchedCareer.projects:["Speak to someone working in this field","Review five job descriptions and note common skills","Create a small project related to the career"]).map((project,index)=>(
                                    <div className="scenario-project-card" key={project}>
                                        <span>PROJECT 0{index+1}</span>
                                        <strong>{project}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="scenario-result-section">
                            <div className="scenario-section-heading">
                                <div>
                                    <h3>Related career options</h3>
                                    <p>Keep an open mind — nearby roles may use similar strengths.</p>
                                </div>
                            </div>
                            <div className="scenario-related-list">
                                {relatedCareers.map(item=><span className="scenario-related-item" key={item}>{item}<span>↗</span></span>)}
                            </div>
                        </section>
                        <div className="scenario-disclaimer">This is a rule-based exploration guide, not an AI prediction or a guarantee of employment, salary, or career success. Your education path alone does not determine eligibility.</div>
                        <div className="scenario-actions scenario-result-actions">
                            <button type="button" onClick={()=>go("career")}>Explore career paths <span>↗</span></button>
                            <button type="button" className="back-button" onClick={resetScenario}>Create another scenario</button>
                        </div>
                    </div>
                }
            </section>
        </main>
    );
}
