import {useState} from "react";
import {ActionButton,PageHeader,Tag} from "../components/Common";

export function CoverLetter({go})
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
