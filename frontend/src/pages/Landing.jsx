import {ActionButton} from "../components/Common";

export function Landing({go})
{
    return <main className="landing">
        <header className="landing-header">
            <button className="wordmark" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="landing-actions">
                <span className="edition">EDUCATION + CAREER PLANNER</span>
                <button className="landing-login" onClick={()=>go("login")}>Log in →</button>
            </div>
        </header>
        <section className="hero">
            <div className="eyebrow light">YOUR FUTURE, EXPLORED</div>
            <h1>WHAT IF?</h1>
            <div className="hero-bottom">
                <p>Explore your options.<br/>Shape your future.</p>
                <ActionButton light onClick={()=>go("login")}>Get started</ActionButton>
            </div>
        </section>
        <footer className="landing-footer">
            <span>Courses</span>
            <span>Careers</span>
            <span>Skills</span>
            <span>Jobs</span>
        </footer>
    </main>;
}
