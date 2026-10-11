import {ActionButton,Arrow,PageHeader} from "../components/Common";

export function SavedPlans({go})
{
    return <main className="page">
        <PageHeader eyebrow="YOUR LIBRARY" title="Saved plans"/>
        <section className="saved-hero">
            <div>
                <span>EXPLORE YOUR FUTURE</span>
                <h2>Build your<br/>future path</h2>
                <p>Compare courses, careers and opportunities.</p>
            </div>
            <div className="saved-actions">
                <div className="big-progress">→</div>
                <ActionButton light onClick={()=>go("scenario")}>Start scenario</ActionButton>
            </div>
        </section>
        <div className="section-title">
            <div className="eyebrow">AVAILABLE EXPLORATIONS</div>
            <span>3 options</span>
        </div>
        <div className="saved-list">
            <button onClick={()=>go("courses")}>
                <span>COURSES</span>
                <strong>Explore educational paths</strong>
                <Arrow/>
            </button>
            <button onClick={()=>go("skills")}>
                <span>SKILLS</span>
                <strong>Check your skill gap</strong>
                <Arrow/>
            </button>
            <button onClick={()=>go("jobs")}>
                <span>JOBS</span>
                <strong>Explore opportunities</strong>
                <Arrow/>
            </button>
        </div>
    </main>;
}
