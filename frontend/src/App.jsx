import {useEffect,useState} from "react";
import axios from "axios";
const API="http://localhost:5000/api";
function Arrow()
{
    return <span aria-hidden="true">↗</span>;
}
function Tag({children,dark=false})
{
    return <span className={`tag ${dark?"tag-dark":""}`}>{children}</span>;
}
function ActionButton({children,onClick,light=false,className=""})
{
    return <button className={`button ${light?"button-light":""} ${className}`} onClick={onClick}>
        <span>{children}</span>
        <Arrow/>
    </button>;
}
function Landing({go})
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
const nav=[
    {label:"Overview",screen:"dashboard",number:"01"},
    {label:"Courses",screen:"courses",number:"02"},
    {label:"Careers",screen:"career",number:"03"},
    {label:"Skills",screen:"skills",number:"04"},
    {label:"Jobs",screen:"jobs",number:"05"},
    {label:"What If?",screen:"scenario",number:"06"},
    {label:"Saved Plans",screen:"saved",number:"07"}
];
function Shell({screen,go,children,user})
{
    const [darkMode,setDarkMode]=useState(false);
    const isAdmin=localStorage.getItem("role")==="admin";
    const initials=user?.name?user.name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase():"AM";
    return <div className={`app-shell ${darkMode?"dark-mode":""}`}>
        <aside className="sidebar">
            <button className="side-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <nav>
                {nav.map(item=><button
                    key={item.screen}
                    className={
                        screen===item.screen ||
                        (screen==="course"&&item.screen==="courses") ||
                        (["job","cover"].includes(screen)&&item.screen==="jobs")
                        ?"active":""
                    }
                    onClick={()=>go(item.screen)}
                >
                    <span>{item.label}</span>
                    <small>{item.number}</small>
                </button>)}
                {isAdmin&&<button
                    className={screen==="admin"?"active":""}
                    onClick={()=>go("admin")}
                >
                    <span>Admin</span>
                    <small>08</small>
                </button>}
            </nav>
            <div className="sidebar-bottom">
                <button className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>
                    <span>{darkMode?"Light mode":"Dark mode"}</span>
                    <i className={darkMode?"on":""}><b/></i>
                </button>
                <button className="profile" onClick={()=>go("profile")}>
                    <div className="avatar">{initials}</div>
                    <div>
                        <strong>{user?.name||"Student"}</strong>
                        <span>{isAdmin?"Admin plan":"Student plan"}</span>
                    </div>
                </button>
            </div>
        </aside>
        <div className="main-wrap">
            <header className="mobile-header">
                <button className="side-logo" onClick={()=>go("landing")}>WHAT IF?</button>
                <div className="mobile-actions">
                    <button className="mobile-theme" onClick={()=>setDarkMode(!darkMode)}>
                        {darkMode?"Light":"Dark"}
                    </button>
                    <select
                        value={
                            screen==="course"?"courses":
                            ["job","cover"].includes(screen)?"jobs":
                            screen
                        }
                        onChange={e=>go(e.target.value)}
                    >
                        {nav.map(item=><option key={item.screen} value={item.screen}>{item.label}</option>)}
                        {isAdmin&&<option value="admin">Admin</option>}
                    </select>
                </div>
            </header>
            {children}
        </div>
    </div>;
}
function PageHeader({eyebrow,title,children})
{
    return <header className="page-header">
        <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
        </div>
        {children}
    </header>;
}
function Dashboard({go,user,courses})
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
function CourseExplorer({go,setSelectedCourse})
{
    const [courses,setCourses]=useState([]);
    const [query,setQuery]=useState("");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    useEffect(()=>{
        getCourses();
    },[]);
    const getCourses=async()=>{
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.get(`${API}/courses`);
            setCourses(response.data);
        }
        catch(error)
        {
            setError("Failed to load courses");
        }
        finally
        {
            setLoading(false);
        }
    };
    const visible=courses.filter(course=>
        `${course.name} ${course.description} ${course.category} ${course.duration}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    return <main className="page">
        <PageHeader eyebrow="LEARN · GROW · PROGRESS" title="Course Explorer">
            <span className="result-count">{visible.length} courses</span>
        </PageHeader>
        <div className="search-row">
            <label>
                <span>SEARCH</span>
                <input
                    value={query}
                    onChange={e=>setQuery(e.target.value)}
                    placeholder="Search courses, categories or skills"
                />
            </label>
            <button onClick={()=>setQuery("")}>Clear</button>
        </div>
        {loading&&<div className="empty"><p>Loading courses...</p></div>}
        {error&&<div className="empty"><h2>{error}</h2><button className="text-button" onClick={getCourses}>Try again</button></div>}
        {!loading&&!error&&<section className="card-grid">
            {visible.map((course,index)=><article className="course-card" key={course._id}>
                <div className="card-kicker">
                    <span>COURSE {String(index+1).padStart(2,"0")}</span>
                    <span>{course.category}</span>
                </div>
                <h2>{course.name}</h2>
                <p>{course.duration}</p>
                <div className="tags">
                    <Tag>{course.category}</Tag>
                    {course.source&&<Tag>{course.source}</Tag>}
                </div>
                <p>{course.description}</p>
                <ActionButton onClick={()=>{
                    setSelectedCourse(course);
                    go("course");
                }}>Explore course</ActionButton>
            </article>)}
        </section>}
        {!loading&&!error&&!visible.length&&<div className="empty">
            <h2>No exact matches.</h2>
            <p>Try a broader subject or category.</p>
        </div>}
    </main>;
}
function CourseDetails({go,course})
{
    if(!course)
    {
        return <main className="page">
            <PageHeader eyebrow="COURSE" title="No course selected"/>
            <ActionButton onClick={()=>go("courses")}>Back to courses</ActionButton>
        </main>;
    }
    return <main className="page detail-page">
        <button className="back" onClick={()=>go("courses")}>← Back to courses</button>
        <PageHeader eyebrow={`COURSE · ${course.category}`} title={course.name}>
            <ActionButton onClick={()=>go("saved")}>Save course</ActionButton>
        </PageHeader>
        <div className="detail-meta">
            <span>{course.duration}</span>
            <span>{course.category}</span>
            {course.source&&<span>{course.source}</span>}
        </div>
        <div className="detail-layout">
            <section className="detail-main">
                <div className="section-block">
                    <div className="eyebrow">COURSE OVERVIEW</div>
                    <p className="lead">{course.description}</p>
                </div>
                <div className="section-block">
                    <div className="eyebrow">WHAT YOU CAN EXPLORE</div>
                    <div className="number-list">
                        <div><b>01</b><span>Understand the course structure and learning path.</span></div>
                        <div><b>02</b><span>Identify the skills developed through this course.</span></div>
                        <div><b>03</b><span>Explore possible career opportunities.</span></div>
                    </div>
                </div>
            </section>
            <aside className="detail-side">
                <div className="side-card dark">
                    <div className="eyebrow light">CAREER PATHS</div>
                    <h3>Where could this course take you?</h3>
                    <button onClick={()=>go("career")}>Explore careers <Arrow/></button>
                    <button onClick={()=>go("skills")}>Check required skills <Arrow/></button>
                    <button onClick={()=>go("jobs")}>Find related jobs <Arrow/></button>
                </div>
                <div className="side-card">
                    <div className="eyebrow">COURSE INFORMATION</div>
                    <div className="tags">
                        <Tag>{course.category}</Tag>
                        <Tag>{course.duration}</Tag>
                    </div>
                </div>
            </aside>
        </div>
    </main>;
}
function CareerDetails({go})
{
    const [careers,setCareers]=useState([]);
    const [query,setQuery]=useState("");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    useEffect(()=>{
        getCareers();
    },[]);
    const getCareers=async()=>{
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.get(`${API}/careers`);
            setCareers(response.data);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Failed to load careers");
        }
        finally
        {
            setLoading(false);
        }
    };
    const visible=careers.filter(career=>
        `${career.name} ${career.description} ${career.industry} ${career.salary} ${career.opportunity}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    return <main className="page detail-page">
        <div className="eyebrow">CAREER PATH · EXPLORATION</div>
        <div className="career-hero">
            <div>
                <h1>Career<br/>Paths</h1>
                <p>Explore possible careers, understand required skills and compare your options.</p>
            </div>
            <div className="salary">
                <span>WHAT IF?</span>
                <strong>{careers.length||"Explore"}</strong>
                <small>{careers.length?"Career paths available":"Find a path that fits you"}</small>
            </div>
        </div>
        <div className="detail-layout career-layout">
            <section className="detail-main">
                <div className="section-block">
                    <div className="eyebrow">CAREER EXPLORATION</div>
                    <p className="lead">Your education can lead to multiple career paths. Compare roles, industries and opportunities before making a decision.</p>
                </div>
                <div className="section-block">
                    <div className="eyebrow">AVAILABLE CAREERS</div>
                    <div className="search-row">
                        <label>
                            <span>SEARCH CAREERS</span>
                            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search careers, industries or opportunities"/>
                        </label>
                        <button onClick={()=>setQuery("")}>Clear</button>
                    </div>
                    {loading&&<div className="empty"><p>Loading careers...</p></div>}
                    {error&&<div className="empty"><h2>{error}</h2><button className="text-button" onClick={getCareers}>Try again</button></div>}
                    {!loading&&!error&&<section className="card-grid">
                        {visible.map((career,index)=><article className="course-card" key={career._id}>
                            <div className="card-kicker">
                                <span>CAREER {String(index+1).padStart(2,"0")}</span>
                                <span>{career.industry}</span>
                            </div>
                            <h2>{career.name}</h2>
                            <p>{career.description}</p>
                            <div className="tags">
                                {career.industry&&<Tag>{career.industry}</Tag>}
                                {career.opportunity&&<Tag>{career.opportunity}</Tag>}
                                {career.salary&&<Tag>{career.salary}</Tag>}
                            </div>
                        </article>)}
                    </section>}
                    {!loading&&!error&&!visible.length&&<div className="empty">
                        <h2>No careers found.</h2>
                        <p>Try a broader career or industry.</p>
                    </div>}
                </div>
                <div className="section-block">
                    <div className="eyebrow">NEXT STEP</div>
                    <button className="inline-card" onClick={()=>go("skills")}>
                        <span>Check your skill gap</span>
                        <Arrow/>
                    </button>
                    <button className="inline-card" onClick={()=>go("jobs")}>
                        <span>Explore job opportunities</span>
                        <Arrow/>
                    </button>
                </div>
            </section>
            <aside className="detail-side">
                <div className="match-card">
                    <span>YOUR NEXT STEP</span>
                    <strong>01</strong>
                    <p>Explore a career and compare its requirements with your current profile.</p>
                    <ActionButton light onClick={()=>go("skills")}>View skill gap</ActionButton>
                </div>
                <div className="side-card">
                    <div className="eyebrow">READY?</div>
                    <h3>See available opportunities.</h3>
                    <ActionButton onClick={()=>go("jobs")}>View jobs</ActionButton>
                </div>
            </aside>
        </div>
    </main>;
}
function SkillGap({go,user})
{
    const [profile,setProfile]=useState(user||null);
    const [skills,setSkills]=useState([]);
    const [careers,setCareers]=useState([]);
    const [careerId,setCareerId]=useState("");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    useEffect(()=>{
        const load=async()=>{
            try
            {
                const token=localStorage.getItem("token");
                const requests=[
                    axios.get(`${API}/skills`),
                    axios.get(`${API}/careers`)
                ];
                if(token)
                {
                    requests.push(axios.get(`${API}/auth/profile`,{headers:{Authorization:`Bearer ${token}`}}));
                }
                const responses=await Promise.all(requests);
                setSkills(responses[0].data);
                setCareers(responses[1].data);
                if(responses[2])setProfile(responses[2].data);
                if(responses[1].data.length)setCareerId(responses[1].data[0]._id);
            }
            catch(error)
            {
                setError(error.response?.data?.message||"Failed to load skill data");
            }
            finally
            {
                setLoading(false);
            }
        };
        load();
    },[]);
    const currentCareer=careers.find(career=>career._id===careerId);
    const userSkills=(profile?.skills||[]).map(skill=>String(skill).toLowerCase().trim());
    const required=currentCareer?.requiredSkills||[];
    const have=skills.filter(skill=>userSkills.includes(String(skill.name).toLowerCase().trim()));
    const missing=required.filter(requiredSkill=>!userSkills.includes(String(requiredSkill).toLowerCase().trim()));
    const match=required.length?Math.round(((required.length-missing.length)/required.length)*100):0;
    return <main className="page">
        <PageHeader eyebrow="SKILL ANALYSIS" title="Your skill gap">
            <div className="score">
                <strong>{match}</strong>
                <span>%<br/>match</span>
            </div>
        </PageHeader>
        <p className="intro">Compare your current skills with the skills required for your selected career path.</p>
        {loading&&<div className="empty"><p>Loading skills...</p></div>}
        {error&&<div className="empty"><h2>{error}</h2></div>}
        {!loading&&!error&&<>
            {careers.length>0&&<div className="search-row">
                <label>
                    <span>CAREER</span>
                    <select value={careerId} onChange={e=>setCareerId(e.target.value)}>
                        {careers.map(career=><option value={career._id} key={career._id}>{career.name}</option>)}
                    </select>
                </label>
            </div>}
            <div className="comparison-grid">
                <section className="skill-column">
                    <div className="column-head"><span>YOU HAVE</span><strong>{have.length} skills</strong></div>
                    {have.length?have.map((skill,i)=><div className="check-row" key={skill._id}>
                        <span>✓</span>
                        <div><strong>{skill.name}</strong><small>Current profile</small></div>
                    </div>):<div className="empty"><p>No matching skills in your profile yet.</p></div>}
                </section>
                <section className="skill-column missing">
                    <div className="column-head"><span>TO DEVELOP</span><strong>{missing.length} skills</strong></div>
                    {missing.length?missing.map((skill,i)=><div className="check-row" key={skill}>
                        <span>0{i+1}</span>
                        <div><strong>{skill}</strong><small>{i===0?"High priority":"Recommended"}</small></div>
                    </div>):<div className="empty"><p>No missing skills for this career.</p></div>}
                    <ActionButton light onClick={()=>go("courses")}>Find courses</ActionButton>
                </section>
            </div>
        </>}
    </main>;
}
function JobExplorer({go,setSelectedJob})
{
    const [jobs,setJobs]=useState([]);
    const [query,setQuery]=useState("");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    useEffect(()=>{
        const loadJobs=async()=>{
            try{const response=await axios.get(`${API}/jobs`);setJobs(response.data);}
            catch(error){setError("Failed to load jobs");}
            finally{setLoading(false);}
        };
        loadJobs();
    },[]);
    const visible=jobs.filter(job=>`${job.name} ${job.company} ${job.location} ${job.skills?.join(" ")||""}`.toLowerCase().includes(query.toLowerCase()));
    return <main className="page">
        <PageHeader eyebrow="OPPORTUNITY · NEXT STEPS" title="Job Explorer"><span className="result-count">{visible.length} roles</span></PageHeader>
        <div className="search-row"><label><span>SEARCH ROLES</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Role, company, skill or location"/></label><button onClick={()=>setQuery("")}>Clear</button></div>
        {loading&&<div className="empty"><p>Loading jobs...</p></div>}
        {error&&<div className="empty"><h2>{error}</h2></div>}
        {!loading&&!error&&<section className="jobs-list">
            {visible.map((job,index)=><article className="job-card" key={job._id}>
                <div className="job-number">{String(index+1).padStart(2,"0")}</div>
                <div><div className="card-kicker"><span>{job.company}</span><span>{job.type||"Full-time"}</span></div><h2>{job.name}</h2><p>{job.location} · {job.salary||"Salary not specified"}</p><div className="tags">{(job.skills||[]).map(skill=><Tag key={skill}>{skill}</Tag>)}</div></div>
                <div className="job-action"><strong>View role</strong><ActionButton onClick={()=>{setSelectedJob(job);go("job")}}>View role</ActionButton></div>
            </article>)}
        </section>}
        {!loading&&!error&&!visible.length&&<div className="empty"><h2>No jobs found.</h2><p>Add jobs from the admin dashboard.</p></div>}
    </main>;
}
function JobDetails({go,job})
{
    if(!job)return <main className="page"><PageHeader eyebrow="JOB OPPORTUNITY" title="No job selected"/><ActionButton onClick={()=>go("jobs")}>Back to jobs</ActionButton></main>;
    return <main className="page detail-page">
        <button className="back" onClick={()=>go("jobs")}>← Back to jobs</button>
        <PageHeader eyebrow={`JOB OPPORTUNITY · ${job.type||"FULL-TIME"}`} title={job.name}><ActionButton onClick={()=>go("cover")}>Generate cover letter</ActionButton></PageHeader>
        <div className="detail-meta"><span>{job.company}</span><span>{job.location}</span>{job.salary&&<span>{job.salary}</span>}<span>{job.type||"Full-time"}</span></div>
        <div className="detail-layout">
            <section className="detail-main">
                <div className="section-block"><div className="eyebrow">ABOUT THE ROLE</div><p className="lead">{job.description||"Explore this opportunity and compare its requirements with your skills and interests."}</p></div>
                <div className="section-block"><div className="eyebrow">REQUIRED SKILLS</div><div className="tags">{(job.skills||[]).map(skill=><Tag key={skill}>{skill}</Tag>)}</div></div>
            </section>
            <aside className="detail-side">
                <div className="match-card"><span>YOUR OPPORTUNITY</span><strong>OPEN</strong><p>Compare this role with your current profile before applying.</p></div>
                <div className="side-card"><div className="eyebrow">COMPANY</div><h3>{job.company}</h3><p>{job.location}</p></div>
            </aside>
        </div>
        <div className="sticky-action"><div><strong>{job.name}</strong><span>{job.company}</span></div><ActionButton onClick={()=>go("cover")}>Generate cover letter</ActionButton></div>
    </main>;
}
function CoverLetter({go})
{
    const [generated,setGenerated]=useState(true);
    return <main className="page">
        <PageHeader eyebrow="AI APPLICATION STUDIO" title="Cover letter">
            <button className="text-button" onClick={()=>go("job")}>Back to job</button>
        </PageHeader>
        <div className="cover-layout">
            <aside className="cover-info">
                <section>
                    <div className="eyebrow">CANDIDATE</div>
                    <h3>Current User</h3>
                    <p>Student<br/>India</p>
                </section>
                <section>
                    <div className="eyebrow">ROLE</div>
                    <h3>Product Designer</h3>
                    <p>Northstar Labs<br/>Bengaluru · Hybrid</p>
                </section>
                <section>
                    <div className="eyebrow">HIGHLIGHT</div>
                    <div className="tags">
                        <Tag>Research</Tag>
                        <Tag>Figma</Tag>
                        <Tag>Prototyping</Tag>
                    </div>
                </section>
                <button className="text-button" onClick={()=>setGenerated(!generated)}>
                    {generated?"Clear draft":"Restore draft"}
                </button>
            </aside>
            <section className="letter">
                <div className="letter-head">
                    <span>GENERATED DRAFT · READY TO EDIT</span>
                    <button onClick={()=>navigator.clipboard?.writeText("Dear Hiring Team,\n\nI am excited to apply for the Product Designer role.")}>Copy text</button>
                </div>
                {generated?<div className="letter-copy">
                    <p>Dear Hiring Team,</p>
                    <p>I am excited to apply for the Product Designer role. I am interested in creating useful and thoughtful digital experiences and would welcome the opportunity to contribute to your team.</p>
                    <p>My experience with user research, Figma, prototyping and digital product development has helped me understand how design decisions can solve real user problems.</p>
                    <p>I would be happy to bring my curiosity, creativity and collaborative approach to your organisation.</p>
                    <p>Best,<br/>Candidate</p>
                </div>:<div className="empty-letter">
                    <p>Your draft has been cleared.</p>
                    <ActionButton onClick={()=>setGenerated(true)}>Generate again</ActionButton>
                </div>}
            </section>
        </div>
    </main>;
}
function Scenario()
{
    const [courses,setCourses]=useState([]);
    const [careers,setCareers]=useState([]);
    const [jobs,setJobs]=useState([]);
    const [saved,setSaved]=useState(false);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const [selections,setSelections]=useState([{course:"",career:"",job:""},{course:"",career:"",job:""}]);
    useEffect(()=>{
        const load=async()=>{
            try{
                const [coursesResponse,careersResponse,jobsResponse]=await Promise.all([axios.get(`${API}/courses`),axios.get(`${API}/careers`),axios.get(`${API}/jobs`)]);
                setCourses(coursesResponse.data);setCareers(careersResponse.data);setJobs(jobsResponse.data);
                setSelections([{course:coursesResponse.data[0]?._id||"",career:careersResponse.data[0]?._id||"",job:jobsResponse.data[0]?._id||""},{course:coursesResponse.data[1]?._id||coursesResponse.data[0]?._id||"",career:careersResponse.data[1]?._id||careersResponse.data[0]?._id||"",job:jobsResponse.data[1]?._id||jobsResponse.data[0]?._id||""}]);
            }catch(error){setError("Failed to load scenario data");}
            finally{setLoading(false);}
        };
        load();
    },[]);
    const updatePath=(pathIndex,field,value)=>{setSelections(current=>current.map((path,index)=>index===pathIndex?{...path,[field]:value}:path));setSaved(false);};
    const resetComparison=()=>{setSelections([{course:courses[0]?._id||"",career:careers[0]?._id||"",job:jobs[0]?._id||""},{course:courses[1]?._id||courses[0]?._id||"",career:careers[1]?._id||careers[0]?._id||"",job:jobs[1]?._id||jobs[0]?._id||""}]);setSaved(false);};
    if(loading)return <main className="page"><PageHeader eyebrow="WHAT IF? · COMPARISON" title="Build two futures."/><div className="empty"><p>Loading courses, careers and jobs...</p></div></main>;
    if(error)return <main className="page"><PageHeader eyebrow="WHAT IF? · COMPARISON" title="Build two futures."/><div className="empty"><h2>{error}</h2></div></main>;
    return <main className="page scenario">
        <PageHeader eyebrow="WHAT IF? · COMPARISON" title="Build two futures."><ActionButton onClick={()=>setSaved(true)}>{saved?"Scenario saved":"Save scenario"}</ActionButton></PageHeader>
        <p className="intro">Select a course, career and job for each path to see how your choices compare.</p>
        <div className="builder-toolbar"><span>CHOOSE YOUR OPTIONS</span><div><button onClick={()=>{setSelections(([a,b])=>[b,a]);setSaved(false);}}>Swap paths</button><button onClick={resetComparison}>Reset example</button></div></div>
        <section className="scenario-builder">
            {selections.map((selection,index)=><div className="builder-path" key={index}>
                <div className="path-label"><strong>PATH {index?"B":"A"}</strong><span>{index?"ALTERNATIVE":"STARTING POINT"}</span></div>
                <label><span>SEARCH COURSE</span><select value={selection.course} onChange={e=>updatePath(index,"course",e.target.value)}>{courses.map(item=><option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
                <label><span>SEARCH CAREER</span><select value={selection.career} onChange={e=>updatePath(index,"career",e.target.value)}>{careers.map(item=><option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
                <label><span>SEARCH JOB</span><select value={selection.job} onChange={e=>updatePath(index,"job",e.target.value)}>{jobs.map(item=><option value={item._id} key={item._id}>{item.name} · {item.location}</option>)}</select></label>
            </div>)}
        </section>
        <div className="comparison-heading"><div className="eyebrow">SIDE-BY-SIDE COMPARISON</div><span>Selections update instantly</span></div>
        <div className="path-grid">
            {selections.map((selection,index)=>{
                const course=courses.find(item=>item._id===selection.course);const career=careers.find(item=>item._id===selection.career);const job=jobs.find(item=>item._id===selection.job);
                if(!course||!career||!job)return null;
                const required=[...new Set([...(career.requiredSkills||[]),...(job.skills||[])])];
                return <section className={`path-card ${index?"inverted":""}`} key={index}>
                    <div className="path-label">PATH {index?"B":"A"}<span>{index?"ALTERNATIVE":"BEST MATCH"}</span></div>
                    <div className="path-route"><strong>{course.name}</strong><span>→</span><strong>{career.name}</strong><span>→</span><strong>{job.name}</strong></div>
                    <h2>{job.name}</h2>
                    <div className="path-stats"><div><span>Course</span><strong>{course.category} · {course.duration}</strong></div><div><span>Industry</span><strong>{career.industry}</strong></div><div><span>Opportunity</span><strong>{career.opportunity||"—"}</strong></div><div><span>Career salary</span><strong>{career.salary||"—"}</strong></div><div><span>Job salary</span><strong>{job.salary||"—"}</strong></div><div><span>Company</span><strong>{job.company}</strong></div><div><span>Location</span><strong>{job.location}</strong></div></div>
                    <div className="scenario-skills"><div className="path-skills"><span>REQUIRED SKILLS</span>{required.slice(0,5).map((skill,i)=><div key={skill}><b>0{i+1}</b>{skill}</div>)}</div><div className="missing-skills"><span>CAREER SKILLS</span><div className="tags">{(career.requiredSkills||[]).map(skill=><Tag key={skill}>{skill}</Tag>)}</div></div></div>
                </section>;
            })}
        </div>
        <div className={`save-confirmation ${saved?"show":""}`}><strong>Scenario saved</strong><span>This comparison is now in Saved Plans.</span><button onClick={()=>setSaved(false)}>Close</button></div>
    </main>;
}
function Login({go,onLogin})
{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const login=async()=>{
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.post(`${API}/auth/login`,{email,password});
            localStorage.setItem("token",response.data.token);
            localStorage.setItem("role","user");
            onLogin(response.data.user);
            go("dashboard");
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Login failed");
        }
        finally
        {
            setLoading(false);
        }
    };
    return <main className="auth-page">
        <div className="auth-card">
            <button className="auth-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="eyebrow">WELCOME BACK</div>
            <h1>Log in</h1>
            <p>Continue exploring your education and career possibilities.</p>
            {error&&<div className="error">{error}</div>}
            <label>
                <span>EMAIL ADDRESS</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
            </label>
            <label>
                <span>PASSWORD</span>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>
            </label>
            <div className="auth-row">
                <button className="forgot" type="button" onClick={()=>go("forgot")}>Forgot password?</button>
            </div>
            <button className="auth-button" onClick={login} disabled={loading}>
                {loading?"Logging in...":"Log in →"}
            </button>
            <button className="admin-link" type="button" onClick={()=>go("admin-login")}>
                Admin login
            </button>
            <div className="auth-footer">
                Don't have an account?
                <button onClick={()=>go("signup")}>Sign up</button>
            </div>
        </div>
    </main>;
}
function Signup({go})
{
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [confirm,setConfirm]=useState("");
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");
    const [loading,setLoading]=useState(false);
    const register=async()=>{
        try
        {
            setError("");
            setMessage("");
            if(!name||!email||!password)
            {
                setError("Please fill all the fields");
                return;
            }
            if(password!==confirm)
            {
                setError("Passwords do not match");
                return;
            }
            setLoading(true);
            const response=await axios.post(`${API}/auth/register`,{name,email,password});
            setMessage(response.data.message);
            setTimeout(()=>go("login"),1000);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Registration failed");
        }
        finally
        {
            setLoading(false);
        }
    };
    return <main className="auth-page">
        <div className="auth-card signup-card">
            <button className="auth-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="eyebrow">GET STARTED</div>
            <h1>Create account</h1>
            <p>Start exploring your education and career possibilities.</p>
            {error&&<div className="error">{error}</div>}
            {message&&<div className="message">{message}</div>}
            <label><span>FULL NAME</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Morgan"/></label>
            <label><span>EMAIL ADDRESS</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
            <label><span>PASSWORD</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password"/></label>
            <label><span>CONFIRM PASSWORD</span><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm your password"/></label>
            <label className="checkbox-row">
                <input type="checkbox"/>
                <span>I agree to the Terms & Conditions</span>
            </label>
            <button className="auth-button" onClick={register} disabled={loading}>
                {loading?"Creating account...":"Create account →"}
            </button>
            <div className="auth-footer">
                Already have an account?
                <button onClick={()=>go("login")}>Log in</button>
            </div>
        </div>
    </main>;
}
function ForgotPassword({go})
{
    const [email,setEmail]=useState("");
    const [token,setToken]=useState("");
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");
    const requestReset=async()=>{
        try
        {
            setError("");
            setMessage("");
            const response=await axios.post(`${API}/auth/forgot-password`,{email});
            setToken(response.data.resetToken);
            setMessage(response.data.message);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Forgot password failed");
        }
    };
    return <main className="auth-page">
        <div className="auth-card">
            <button className="auth-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="eyebrow">ACCOUNT RECOVERY</div>
            <h1>Forgot password</h1>
            <p>Enter your registered email address to generate a password reset token.</p>
            {error&&<div className="error">{error}</div>}
            {message&&<div className="message">{message}</div>}
            <label>
                <span>EMAIL ADDRESS</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
            </label>
            <button className="auth-button" onClick={requestReset}>Generate reset token</button>
            {token&&<div className="message">Reset token: {token}</div>}
            {token&&<button className="auth-button" onClick={()=>go("reset")}>Continue to reset password</button>}
            <div className="auth-footer">
                Remember your password?
                <button onClick={()=>go("login")}>Log in</button>
            </div>
        </div>
    </main>;
}
function ResetPassword({go})
{
    const [email,setEmail]=useState("");
    const [resetToken,setResetToken]=useState("");
    const [newPassword,setNewPassword]=useState("");
    const [message,setMessage]=useState("");
    const [error,setError]=useState("");
    const reset=async()=>{
        try
        {
            setError("");
            setMessage("");
            const response=await axios.post(`${API}/auth/reset-password`,{
                email,
                resetToken,
                newPassword
            });
            setMessage(response.data.message);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Password reset failed");
        }
    };
    return <main className="auth-page">
        <div className="auth-card">
            <button className="auth-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="eyebrow">ACCOUNT RECOVERY</div>
            <h1>Reset password</h1>
            <p>Enter the reset token and your new password.</p>
            {error&&<div className="error">{error}</div>}
            {message&&<div className="message">{message}</div>}
            <label><span>EMAIL ADDRESS</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
            <label><span>RESET TOKEN</span><input value={resetToken} onChange={e=>setResetToken(e.target.value)}/></label>
            <label><span>NEW PASSWORD</span><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label>
            <button className="auth-button" onClick={reset}>Reset password</button>
            <div className="auth-footer">
                <button onClick={()=>go("login")}>Back to login</button>
            </div>
        </div>
    </main>;
}
function AdminLogin({go,onAdminLogin})
{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const login=async()=>{
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.post(`${API}/auth/admin-login`,{email,password});
            localStorage.setItem("token",response.data.token);
            localStorage.setItem("role","admin");
            onAdminLogin(response.data.admin);
            go("admin");
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Admin login failed");
        }
        finally
        {
            setLoading(false);
        }
    };
    return <main className="auth-page">
        <div className="auth-card">
            <button className="auth-logo" onClick={()=>go("landing")}>WHAT IF?</button>
            <div className="eyebrow">ADMINISTRATION</div>
            <h1>Admin login</h1>
            <p>Manage the educational and career dataset.</p>
            {error&&<div className="error">{error}</div>}
            <label><span>ADMIN EMAIL</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
            <label><span>ADMIN PASSWORD</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
            <button className="auth-button" onClick={login} disabled={loading}>
                {loading?"Logging in...":"Admin login →"}
            </button>
            <div className="auth-footer">
                <button onClick={()=>go("login")}>Back to user login</button>
            </div>
        </div>
    </main>;
}
function AdminDashboard({go})
{
    const resources={
        courses:{label:"Courses",endpoint:"courses",fields:["name","description","category","duration","source"],required:["name","description","category","duration"],title:"Manage courses"},
        careers:{label:"Careers",endpoint:"careers",fields:["name","description","industry","salary","opportunity","requiredSkills"],required:["name","description","industry"],title:"Manage careers"},
        skills:{label:"Skills",endpoint:"skills",fields:["name","category","description"],required:["name","category"],title:"Manage skills"},
        jobs:{label:"Jobs",endpoint:"jobs",fields:["name","company","location","salary","type","description","skills"],required:["name","company","location"],title:"Manage jobs"}
    };
    const [resource,setResource]=useState("courses");
    const [records,setRecords]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");
    const [editingId,setEditingId]=useState(null);
    const [form,setForm]=useState({});
    const config=resources[resource];
    const token=localStorage.getItem("token");
    const headers={Authorization:`Bearer ${token}`};
    const emptyForm=()=>Object.fromEntries(config.fields.map(field=>[field,""]));
    const loadRecords=async()=>{
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.get(`${API}/${config.endpoint}`);
            setRecords(response.data);
        }
        catch(error)
        {
            setError(error.response?.data?.message||`Failed to load ${config.label.toLowerCase()}`);
        }
        finally
        {
            setLoading(false);
        }
    };
    useEffect(()=>{
        setForm(emptyForm());
        setEditingId(null);
        setMessage("");
        loadRecords();
    },[resource]);
    const updateForm=(field,value)=>setForm(current=>({...current,[field]:value}));
    const normalizeForm=()=>{
        const data={...form};
        if(["skills","requiredSkills"].includes(resource==="careers"?"requiredSkills":resource==="jobs"?"skills":"")){}
        if(resource==="jobs"||resource==="careers")
        {
            const field=resource==="jobs"?"skills":"requiredSkills";
            data[field]=String(data[field]||"").split(",").map(item=>item.trim()).filter(Boolean);
        }
        return data;
    };
    const saveRecord=async()=>{
        try
        {
            setError("");
            setMessage("");
            for(const field of config.required)
            {
                if(!String(form[field]||"").trim())
                {
                    setError("Please fill all required fields");
                    return;
                }
            }
            const data=normalizeForm();
            const response=editingId
                ?await axios.put(`${API}/${config.endpoint}/${editingId}`,data,{headers})
                :await axios.post(`${API}/${config.endpoint}`,data,{headers});
            setMessage(response.data.message);
            setForm(emptyForm());
            setEditingId(null);
            loadRecords();
        }
        catch(error)
        {
            setError(error.response?.data?.message||`${config.label.slice(0,-1)} operation failed`);
        }
    };
    const editRecord=(record)=>{
        const next={};
        config.fields.forEach(field=>{
            next[field]=Array.isArray(record[field])?record[field].join(", "):record[field]||"";
        });
        setEditingId(record._id);
        setForm(next);
        window.scrollTo({top:0,behavior:"smooth"});
    };
    const deleteRecord=async(id)=>{
        if(!window.confirm(`Delete this ${config.label.slice(0,-1).toLowerCase()}?`))return;
        try
        {
            setError("");
            setMessage("");
            const response=await axios.delete(`${API}/${config.endpoint}/${id}`,{headers});
            setMessage(response.data.message);
            loadRecords();
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Delete failed");
        }
    };
    const cancelEdit=()=>{setEditingId(null);setForm(emptyForm());};
    const displayRecord=(record)=>{
        if(resource==="courses")return `${record.category||""} · ${record.duration||""}`;
        if(resource==="careers")return `${record.industry||""} · ${record.salary||""}`;
        if(resource==="skills")return `${record.category||""}`;
        return `${record.company||""} · ${record.location||""}`;
    };
    return <main className="page">
        <PageHeader eyebrow="ADMINISTRATION · DATASET" title={config.title}>
            <button className="text-button" onClick={()=>{localStorage.removeItem("token");localStorage.removeItem("role");localStorage.removeItem("user");go("landing");}}>Log out</button>
        </PageHeader>
        <div className="admin-actions" style={{marginTop:"25px",marginBottom:"25px"}}>
            {Object.entries(resources).map(([key,item])=><button key={key} onClick={()=>setResource(key)} style={resource===key?{background:"#111",color:"#fff"}:{}}>{item.label}</button>)}
        </div>
        {error&&<div className="error">{error}</div>}
        {message&&<div className="message">{message}</div>}
        <div className="admin-layout">
            <section className="admin-form">
                <div className="eyebrow">{editingId?`EDIT ${config.label.slice(0,-1).toUpperCase()}`:`ADD ${config.label.slice(0,-1).toUpperCase()}`}</div>
                <h3>{editingId?`Update ${config.label.slice(0,-1).toLowerCase()}`:`Create new ${config.label.slice(0,-1).toLowerCase()}`}</h3>
                {config.fields.map(field=><label key={field}>
                    <span>{field.replace(/([A-Z])/g," $1").toUpperCase()}</span>
                    {field==="description"?<textarea value={form[field]||""} onChange={e=>updateForm(field,e.target.value)} placeholder={field}/>:<input value={form[field]||""} onChange={e=>updateForm(field,e.target.value)} placeholder={field.includes("Skills")?"React, Python, SQL":field}/>} 
                </label>)}
                <button className="auth-button" onClick={saveRecord}>{editingId?`Update ${config.label.slice(0,-1).toLowerCase()}`:`Add ${config.label.slice(0,-1).toLowerCase()}`}</button>
                {editingId&&<button className="cancel-button" onClick={cancelEdit}>Cancel</button>}
            </section>
            <section className="admin-list">
                <div className="eyebrow">DATABASE RECORDS</div>
                <h3>{records.length} {config.label.toLowerCase()}</h3>
                {loading?<p>Loading {config.label.toLowerCase()}...</p>:records.map(record=><div className="admin-course" key={record._id}>
                    <div><h4>{record.name}</h4><p>{displayRecord(record)}</p></div>
                    <div className="admin-actions"><button onClick={()=>editRecord(record)}>Edit</button><button onClick={()=>deleteRecord(record._id)}>Delete</button></div>
                </div>)}
                {!loading&&!records.length&&<div className="empty-state">No {config.label.toLowerCase()} found.</div>}
            </section>
        </div>
    </main>;
}
function Profile({go,user,onLogout})
{
    const [profile,setProfile]=useState(null);
    const [error,setError]=useState("");
    const isAdmin=localStorage.getItem("role")==="admin";
    useEffect(()=>{
        const getProfile=async()=>{
            if(isAdmin)return;
            try
            {
                const token=localStorage.getItem("token");
                const response=await axios.get(`${API}/auth/profile`,{headers:{Authorization:`Bearer ${token}`}});
                setProfile(response.data);
            }
            catch(error)
            {
                setError("Failed to load profile");
            }
        };
        getProfile();
    },[isAdmin]);
    const current=profile||user;
    const skills=current?.skills||[];
    const interests=current?.interests||[];
    const initials=current?.name?current.name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase():"AM";
    return <main className="page profile-page">
        <PageHeader eyebrow="YOUR ACCOUNT" title="My Profile">
            {!isAdmin&&<button className="text-button" onClick={()=>go("edit-profile")}>Edit profile</button>}
            <button className="text-button" onClick={onLogout}>Log out</button>
        </PageHeader>
        {error&&<div className="error">{error}</div>}
        <section className="profile-hero">
            <div className="avatar large">{initials}</div>
            <div>
                <h2>{current?.name||"Student"}</h2>
                <p>{isAdmin?"Administrator · India":"Student · India"}</p>
            </div>
        </section>
        <div className="profile-grid">
            <section className="profile-card">
                <div className="eyebrow">PERSONAL INFORMATION</div>
                <div className="profile-field"><span>FULL NAME</span><strong>{current?.name||"-"}</strong></div>
                <div className="profile-field"><span>EMAIL</span><strong>{current?.email||"-"}</strong></div>
                <div className="profile-field"><span>EDUCATION</span><strong>{isAdmin?"Administrator":current?.education||"Not added yet"}</strong></div>
            </section>
            {!isAdmin&&<section className="profile-card">
                <div className="eyebrow">SKILLS</div>
                <div className="tags">
                    {skills.length?skills.map(skill=><Tag key={skill}>{skill}</Tag>):<span>No skills added yet</span>}
                </div>
                <div className="eyebrow profile-section-label">CAREER INTERESTS</div>
                <div className="tags">
                    {interests.length?interests.map(interest=><Tag key={interest}>{interest}</Tag>):<span>No interests added yet</span>}
                </div>
            </section>}
        </div>
        <div className="profile-actions">
            {!isAdmin&&<button className="auth-button" onClick={()=>go("edit-profile")}>Edit profile →</button>}
            <button className="cancel-button" onClick={onLogout}>Log out</button>
        </div>
    </main>;
}
function EditProfile({go,user})
{
    const [form,setForm]=useState({name:user?.name||"",email:user?.email||"",education:user?.education||"",skills:Array.isArray(user?.skills)?user.skills.join(", "):"",interests:Array.isArray(user?.interests)?user.interests.join(", "):""});
    const [loading,setLoading]=useState(true);
    const [saving,setSaving]=useState(false);
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");
    useEffect(()=>{
        const getProfile=async()=>{
            try
            {
                const token=localStorage.getItem("token");
                const response=await axios.get(`${API}/auth/profile`,{headers:{Authorization:`Bearer ${token}`}});
                setForm({name:response.data.name||"",email:response.data.email||"",education:response.data.education||"",skills:Array.isArray(response.data.skills)?response.data.skills.join(", "):"",interests:Array.isArray(response.data.interests)?response.data.interests.join(", "):""});
            }
            catch(error)
            {
                setError(error.response?.data?.message||"Failed to load profile");
            }
            finally
            {
                setLoading(false);
            }
        };
        getProfile();
    },[]);
    const update=(field,value)=>setForm(current=>({...current,[field]:value}));
    const save=async()=>{
        try
        {
            setError("");
            setMessage("");
            setSaving(true);
            const token=localStorage.getItem("token");
            const skills=form.skills.split(",").map(skill=>skill.trim()).filter(Boolean);
            const interests=form.interests.split(",").map(interest=>interest.trim()).filter(Boolean);
            const response=await axios.put(`${API}/auth/profile`,{name:form.name.trim(),email:form.email.trim(),education:form.education.trim(),skills,interests},{headers:{Authorization:`Bearer ${token}`}});
            localStorage.setItem("user",JSON.stringify(response.data));
            setMessage("Profile updated successfully");
            setTimeout(()=>go("profile"),500);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Failed to update profile");
        }
        finally
        {
            setSaving(false);
        }
    };
    if(loading)
    {
        return <main className="page profile-page"><PageHeader eyebrow="YOUR ACCOUNT" title="Edit Profile"/><p>Loading profile...</p></main>;
    }
    return <main className="page profile-page">
        <PageHeader eyebrow="YOUR ACCOUNT" title="Edit Profile"/>
        {error&&<div className="error">{error}</div>}
        {message&&<div className="message">{message}</div>}
        <section className="edit-profile-card">
            <div className="edit-avatar">
                <div className="avatar large">{form.name?form.name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase():"AM"}</div>
                <span>Profile information</span>
            </div>
            <label><span>FULL NAME</span><input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Your name"/></label>
            <label><span>EMAIL</span><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="you@example.com"/></label>
            <label><span>EDUCATION</span><input value={form.education} onChange={e=>update("education",e.target.value)} placeholder="B.Tech Computer Science"/></label>
            <label><span>SKILLS</span><input value={form.skills} onChange={e=>update("skills",e.target.value)} placeholder="React, Python, Figma, Git"/></label>
            <p className="form-hint">Separate multiple skills with commas.</p>
            <label><span>CAREER INTERESTS</span><input value={form.interests} onChange={e=>update("interests",e.target.value)} placeholder="Software Development, UI/UX, Data Science"/></label>
            <p className="form-hint">Separate multiple career interests with commas.</p>
            <div className="edit-actions">
                <button className="cancel-button" onClick={()=>go("profile")}>Cancel</button>
                <button className="auth-button save-profile" onClick={save} disabled={saving}>{saving?"Saving...":"Save changes"}</button>
            </div>
        </section>
    </main>;
}
function SavedPlans({go})
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
export default function App()
{
    const [screen,setScreen]=useState("landing");
    const [user,setUser]=useState(null);
    const [selectedCourse,setSelectedCourse]=useState(null);
    const [selectedJob,setSelectedJob]=useState(null);
    useEffect(()=>{
        const savedUser=localStorage.getItem("user");
        if(savedUser)
        {
            try
            {
                setUser(JSON.parse(savedUser));
            }
            catch(error)
            {
                localStorage.removeItem("user");
            }
        }
    },[]);
    const go=(next)=>{
        setScreen(next);
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    };
    const onLogin=(userData)=>{
        setUser(userData);
        localStorage.setItem("user",JSON.stringify(userData));
    };
    const onAdminLogin=(adminData)=>{
        setUser(adminData);
        localStorage.setItem("user",JSON.stringify(adminData));
        localStorage.setItem("role","admin");
    };
    const logout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        setUser(null);
        go("landing");
    };
    if(screen==="landing")
    {
        return <Landing go={go}/>;
    }
    if(screen==="login")
    {
        return <Login go={go} onLogin={onLogin}/>;
    }
    if(screen==="signup")
    {
        return <Signup go={go}/>;
    }
    if(screen==="forgot")
    {
        return <ForgotPassword go={go}/>;
    }
    if(screen==="reset")
    {
        return <ResetPassword go={go}/>;
    }
    if(screen==="admin-login")
    {
        return <AdminLogin go={go} onAdminLogin={onAdminLogin}/>;
    }
    if(screen==="admin")
    {
        return <Shell screen="admin" go={go} user={user}>
            <AdminDashboard go={go}/>
        </Shell>;
    }
    if(screen==="dashboard")
    {
        return <Shell screen={screen} go={go} user={user}>
            <Dashboard go={go} user={user} courses={[]}/>
        </Shell>;
    }
    if(screen==="courses")
    {
        return <Shell screen={screen} go={go} user={user}>
            <CourseExplorer go={go} setSelectedCourse={setSelectedCourse}/>
        </Shell>;
    }
    if(screen==="course")
    {
        return <Shell screen={screen} go={go} user={user}>
            <CourseDetails go={go} course={selectedCourse}/>
        </Shell>;
    }
    if(screen==="career")
    {
        return <Shell screen={screen} go={go} user={user}>
            <CareerDetails go={go}/>
        </Shell>;
    }
    if(screen==="skills")
    {
        return <Shell screen={screen} go={go} user={user}>
            <SkillGap go={go} user={user}/>
        </Shell>;
    }
    if(screen==="jobs")
    {
        return <Shell screen={screen} go={go} user={user}>
            <JobExplorer go={go} setSelectedJob={setSelectedJob}/>
        </Shell>;
    }
    if(screen==="job")
    {
        return <Shell screen={screen} go={go} user={user}>
            <JobDetails go={go} job={selectedJob}/>
        </Shell>;
    }
    if(screen==="cover")
    {
        return <Shell screen={screen} go={go} user={user}>
            <CoverLetter go={go}/>
        </Shell>;
    }
    if(screen==="scenario")
    {
        return <Shell screen={screen} go={go} user={user}>
            <Scenario/>
        </Shell>;
    }
    if(screen==="saved")
    {
        return <Shell screen={screen} go={go} user={user}>
            <SavedPlans go={go}/>
        </Shell>;
    }
    if(screen==="saved")
{
    return <Shell screen={screen} go={go} user={user}>
        <SavedPlans go={go}/>
    </Shell>;
}

if(screen==="edit-profile")
{
    return <Shell screen="profile" go={go} user={user}>
        <EditProfile go={go} user={user}/>
    </Shell>;
}

if(screen==="profile")
{
    return <Shell screen={screen} go={go} user={user}>
        <Profile go={go} user={user} onLogout={logout}/>
    </Shell>;
}

return <Landing go={go}/>;
}
