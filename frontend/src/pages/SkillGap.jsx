import {useEffect,useState} from "react";
import axios from "axios";
import {API} from "../api";
import {ActionButton,PageHeader} from "../components/Common";

export function SkillGap({go,user})
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
