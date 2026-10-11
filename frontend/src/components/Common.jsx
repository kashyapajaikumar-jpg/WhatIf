import {useState} from "react";

export function Arrow()
{
    return <span aria-hidden="true">↗</span>;
}

export function Tag({children,dark=false})
{
    return <span className={`tag ${dark?"tag-dark":""}`}>{children}</span>;
}

export function ActionButton({children,onClick,light=false,className=""})
{
    return <button className={`button ${light?"button-light":""} ${className}`} onClick={onClick}>
        <span>{children}</span>
        <Arrow/>
    </button>;
}

export const nav=[
    {label:"Overview",screen:"dashboard",number:"01"},
    {label:"Courses",screen:"courses",number:"02"},
    {label:"Careers",screen:"career",number:"03"},
    {label:"Skills",screen:"skills",number:"04"},
    {label:"Jobs",screen:"jobs",number:"05"},
    {label:"What If?",screen:"scenario",number:"06"},
    {label:"Saved Plans",screen:"saved",number:"07"}
];

export function Shell({screen,go,children,user})
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

export function PageHeader({eyebrow,title,children})
{
    return <header className="page-header">
        <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
        </div>
        {children}
    </header>;
}
