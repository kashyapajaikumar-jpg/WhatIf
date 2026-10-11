
import {useEffect,useState} from "react";
import axios from "axios";
import {API} from "../api.js";
import {Arrow,Tag,ActionButton} from "../components/Common.jsx";

function CollegeExplorer({course})
{
    const [open,setOpen]=useState(false);
    const [query,setQuery]=useState(course.name||"");
    const [state,setState]=useState("");
    const [states,setStates]=useState([]);
    const [colleges,setColleges]=useState([]);
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");
    const [searched,setSearched]=useState(false);
    const [page,setPage]=useState(1);
    const [total,setTotal]=useState(0);

    useEffect(()=>
    {
        const getStates=async()=>
        {
            try
            {
                const response=await axios.get(`${API}/colleges/states`);
                setStates(Array.isArray(response.data.states)?response.data.states:[]);
            }
            catch(error)
            {
                setStates([]);
            }
        };
        getStates();
    },[]);

    const searchColleges=async(nextPage=1)=>
    {
        if(query.trim().length<2&&!state)
        {
            setError("Enter a course or college name, or choose a state.");
            return;
        }

        try
        {
            setLoading(true);
            setError("");
            setSearched(true);

            const response=await axios.get(`${API}/colleges/search`,{
                params:{
                    q:query.trim(),
                    state,
                    page:nextPage,
                    limit:10
                }
            });

            setColleges(Array.isArray(response.data.results)?response.data.results:[]);
            setPage(response.data.page||nextPage);
            setTotal(response.data.total||0);
        }
        catch(error)
        {
            setColleges([]);
            setError(error.response?.data?.message||"Unable to load colleges. Please try again.");
        }
        finally
        {
            setLoading(false);
        }
    };

    const openExplorer=()=>
    {
        setOpen(!open);
        if(!open&&!searched)
        {
            setTimeout(()=>searchColleges(1),0);
        }
    };

    return <div className="college-explorer">
        <button className="college-toggle" onClick={openExplorer}>
            {open?"Hide colleges":"Explore colleges"}
            <span>{open?"−":"+"}</span>
        </button>

        {open&&<div className="college-panel">
            <p className="college-note">
                Search institutions related to this course. Confirm the programme details with the institution before applying.
            </p>

            <form className="college-search" onSubmit={event=>
            {
                event.preventDefault();
                searchColleges(1);
            }}>
                <input
                    type="search"
                    placeholder="Search course or college..."
                    value={query}
                    onChange={event=>setQuery(event.target.value)}
                />
                <select value={state} onChange={event=>setState(event.target.value)}>
                    <option value="">All states</option>
                    {states.map(item=><option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
                <button type="submit" disabled={loading}>
                    {loading?"Searching...":"Search"}
                </button>
            </form>

            {loading&&<p className="empty">Loading colleges...</p>}
            {error&&<div className="error">{error}</div>}

            {!loading&&!error&&searched&&colleges.length===0&&
                <p className="empty">No matching institutions found. Try a different search or state.</p>
            }

            {!loading&&!error&&colleges.length>0&&<>
                <p className="college-count">{total} matching institutions · Page {page}</p>
                <div className="college-results">
                    {colleges.map((college,index)=><article className="college-result" key={college.id||college.aicte_id||index}>
                        <h3>{college.name||college.institute_name||"Institution name unavailable"}</h3>
                        {college.university&&<p><strong>University:</strong> {college.university}</p>}
                        <p>{[college.district, college.state].filter(Boolean).join(", ")||college.address||"Location details unavailable"}</p>
                        {college.programmes_count>0&&
                            <p><strong>Listed programmes:</strong> {college.programmes_count}</p>
                        }
                        <p className="college-disclaimer">
                            Check the institution's official sources to confirm that it offers {course.name}.
                        </p>
                    </article>)}
                </div>
                <div className="college-pagination">
                    <button disabled={page<=1||loading} onClick={()=>searchColleges(page-1)}>Previous</button>
                    <button disabled={colleges.length<10||loading} onClick={()=>searchColleges(page+1)}>Next</button>
                </div>
            </>}
        </div>}
    </div>;
}

export function CourseExplorer({go,setSelectedCourse})
{
    const [courses,setCourses]=useState([]);
    const [search,setSearch]=useState("");
    const [category,setCategory]=useState("All");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>
    {
        getCourses();
    },[]);

    const getCourses=async()=>
    {
        try
        {
            setLoading(true);
            setError("");
            const response=await axios.get(`${API}/courses`);
            setCourses(Array.isArray(response.data)?response.data:[]);
        }
        catch(error)
        {
            setError(error.response?.data?.message||"Unable to load courses. Please try again.");
        }
        finally
        {
            setLoading(false);
        }
    };

    const categories=["All",...new Set(courses.map(course=>course.category).filter(Boolean))];

    const filteredCourses=courses.filter(course=>
    {
        const matchesSearch=`${course.name} ${course.description} ${course.category}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory=category==="All"||course.category===category;
        return matchesSearch&&matchesCategory;
    });

    return <main className="page">
        <header className="page-header">
            <div>
                <div className="eyebrow">EXPLORE YOUR OPTIONS</div>
                <h1>Course Explorer</h1>
                <p>Discover courses that can take you closer to your future.</p>
            </div>
        </header>

        <section className="search-row">
            <input type="search" placeholder="Search courses or subjects..." value={search} onChange={event=>setSearch(event.target.value)}/>
            <select value={category} onChange={event=>setCategory(event.target.value)}>
                {categories.map(item=><option key={item} value={item}>{item}</option>)}
            </select>
        </section>

        {loading&&<p className="empty">Loading courses...</p>}
        {error&&<div className="error">{error}<button onClick={getCourses}>Retry</button></div>}
        {!loading&&!error&&filteredCourses.length===0&&
            <p className="empty">{courses.length===0?"No courses have been added yet.":"No courses match your search."}</p>
        }

        {!loading&&!error&&filteredCourses.length>0&&
            <section className="card-grid">
                {filteredCourses.map(course=><article className="course-card" key={course._id}>
                    <div className="card-kicker">{course.category||"COURSE"}</div>
                    <h2>{course.name}</h2>
                    <p>{course.description}</p>
                    <div className="tags">
                        {course.duration&&<Tag>{course.duration}</Tag>}
                    </div>
                    <div className="card-footer">
                        <button onClick={()=>
                        {
                            setSelectedCourse(course);
                            go("course");
                        }}>Explore course <Arrow/></button>
                    </div>
                    <CollegeExplorer course={course}/>
                </article>)}
            </section>
        }
    </main>;
}

export function CourseDetails({go,course})
{
    if(!course)
    {
        return <main className="page">
            <div className="empty">
                <h2>No course selected</h2>
                <p>Choose a course from the course explorer first.</p>
                <ActionButton onClick={()=>go("courses")}>Browse courses</ActionButton>
            </div>
        </main>;
    }

    return <main className="page detail-page">
        <button className="back-button" onClick={()=>go("courses")}>← Back to courses</button>
        <header className="detail-hero">
            <div className="eyebrow">{course.category||"COURSE DETAILS"}</div>
            <h1>{course.name}</h1>
            <p>{course.description}</p>
        </header>
        <section className="detail-layout">
            <div className="section-block">
                <div className="eyebrow">ABOUT THIS COURSE</div>
                <h2>What you'll explore</h2>
                <p>{course.description}</p>
                {course.duration&&<p><strong>Duration:</strong> {course.duration}</p>}
                {course.source&&<p><strong>Source:</strong> {course.source}</p>}
            </div>
            <aside className="side-card">
                <div className="eyebrow">YOUR NEXT STEP</div>
                <h3>Explore career paths</h3>
                <p>See careers and opportunities that may connect to your educational interests.</p>
                <ActionButton onClick={()=>go("career")}>Explore careers</ActionButton>
            </aside>
        </section>
    </main>;
}
