import {ActionButton,Arrow,PageHeader} from "../components/Common";

export function Dashboard({go,user,courses})
{
    const tiles=[
        {name:"Courses",desc:"Find the learning path that moves you forward.",screen:"courses",stat:`${courses.length} options`},
        {name:"Careers",desc:"Understand roles, routes and possibilities.",screen:"career",stat:"Career paths"},
        {name:"Skills",desc:"See what you have and what comes next.",screen:"skills",stat:"Skill analysis"},
        {name:"Jobs",desc:"Connect your potential to open opportunities.",screen:"jobs",stat:"Job opportunities"}
    ];
    return <main className="page">
        <PageHeader eyebrow="OVERVIEW · WHAT IF?" title={`Good morning, ${user?.name?.split(" ")[0]||"there"}.`}>
            <ActionButton onClick={()=>go("scenario")}>Start a scenario</ActionButton>
        </PageHeader>
        <section className="statement">
            <p>Your next move</p>
            <h2>Build a future that<br/>fits who you are.</h2>
        </section>
        <section className="tile-grid">
            {tiles.map((tile,index)=><button className="feature-tile" key={tile.name} onClick={()=>go(tile.screen)}>
                <div className="tile-top">
                    <span>0{index+1}</span>
                    <Arrow/>
                </div>
                <h3>{tile.name}</h3>
                <p>{tile.desc}</p>
                <small>{tile.stat}</small>
            </button>)}
        </section>
        <section className="plan-strip">
            <div>
                <div className="eyebrow light">YOUR ACTIVE PLAN</div>
                <h3>Explore your future possibilities</h3>
            </div>
            <div className="progress-wrap">
                <span>Start by exploring courses</span>
                <div className="progress"><i/></div>
            </div>
            <button onClick={()=>go("courses")}>Explore courses <Arrow/></button>
        </section>
    </main>;
}
