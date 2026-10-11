import {useEffect,useState} from "react";
import axios from "axios";
import {API} from "../api";
import {PageHeader,Tag} from "../components/Common";

export function Profile({go,user,onLogout})
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


export function EditProfile({go,user})
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
