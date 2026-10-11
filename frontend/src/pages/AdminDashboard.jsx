
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api.js";

const resources = {
    courses: {
        label: "Courses",
        endpoint: "courses",
        fields: ["name", "description", "category", "duration", "source"],
        required: ["name", "description", "category", "duration"]
    },
    careers: {
        label: "Careers",
        endpoint: "careers",
        fields: [
            "name", "description", "industry",
            "salary", "opportunity", "requiredSkills"
        ],
        required: ["name", "description", "industry"]
    },
    skills: {
        label: "Skills",
        endpoint: "skills",
        fields: ["name", "category", "description"],
        required: ["name", "category"]
    },
    jobs: {
        label: "Jobs",
        endpoint: "jobs",
        fields: [
            "name", "company", "location",
            "salary", "type", "description", "skills"
        ],
        required: ["name", "company", "location"]
    }
};

export default function AdminDashboard({ go }) {
    const [section, setSection] = useState("overview");
    const [resource, setResource] = useState("courses");

    const [analytics, setAnalytics] = useState({
        totalPageVisits: 0,
        mostVisitedPages: []
    });

    const [users, setUsers] = useState([]);
    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({});

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const config = resources[resource];

    const emptyForm = useCallback(() => {
        return Object.fromEntries(
            resources[resource].fields.map(field => [field, ""])
        );
    }, [resource]);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API}/analytics/summary?days=30`,
                { headers }
            );

            setAnalytics(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load page analytics"
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API}/auth/admin/users`,
                { headers }
            );

            setUsers(response.data.users || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load registered users"
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API}/${resources[resource].endpoint}`
            );

            setRecords(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Failed to load ${resources[resource].label.toLowerCase()}`
            );
        } finally {
            setLoading(false);
        }
    }, [resource]);

    useEffect(() => {
        if (section === "overview") {
            loadAnalytics();
        } else if (section === "users") {
            loadUsers();
        } else if (section === "resources") {
            setForm(emptyForm());
            setEditingId(null);
            setMessage("");
            loadRecords();
        }
    }, [
        section,
        resource,
        loadAnalytics,
        loadUsers,
        loadRecords,
        emptyForm
    ]);

    const updateForm = (field, value) => {
        setForm(current => ({
            ...current,
            [field]: value
        }));
    };

    const saveRecord = async () => {
        try {
            setError("");
            setMessage("");

            for (const field of config.required) {
                if (!String(form[field] || "").trim()) {
                    setError("Please fill all required fields.");
                    return;
                }
            }

            const data = { ...form };

            if (resource === "careers" || resource === "jobs") {
                const field =
                    resource === "careers"
                        ? "requiredSkills"
                        : "skills";

                data[field] = String(data[field] || "")
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);
            }

            const response = editingId
                ? await axios.put(
                    `${API}/${config.endpoint}/${editingId}`,
                    data,
                    { headers }
                )
                : await axios.post(
                    `${API}/${config.endpoint}`,
                    data,
                    { headers }
                );

            setMessage(
                response.data.message ||
                `${config.label.slice(0, -1)} saved successfully`
            );

            setEditingId(null);
            setForm(emptyForm());
            await loadRecords();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save record"
            );
        }
    };

    const editRecord = record => {
        const next = {};

        config.fields.forEach(field => {
            next[field] = Array.isArray(record[field])
                ? record[field].join(", ")
                : record[field] || "";
        });

        setEditingId(record._id);
        setForm(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteRecord = async id => {
        if (!window.confirm(`Delete this ${config.label.slice(0, -1).toLowerCase()}?`)) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await axios.delete(
                `${API}/${config.endpoint}/${id}`,
                { headers }
            );

            setMessage(
                response.data.message || "Record deleted successfully"
            );

            await loadRecords();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete record"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        if (go) {
            go("landing");
        }
    };

    const pageLabel = page => ({
        dashboard: "Dashboard",
        courses: "Courses",
        course: "Course details",
        career: "Careers",
        skills: "Skills",
        jobs: "Jobs",
        job: "Job details",
        cover: "Cover letter",
        scenario: "What If? scenarios",
        saved: "Saved plans",
        profile: "Profile"
    }[page] || page);

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <div className="eyebrow">
                        ADMINISTRATION · WHAT IF?
                    </div>

                    <h1>
                        {section === "overview"
                            ? "Platform Overview"
                            : section === "users"
                                ? "Registered Users"
                                : `Manage ${config.label}`}
                    </h1>

                    <p>
                        {section === "overview"
                            ? "Page visits and platform usage."
                            : section === "users"
                                ? "View people registered on the platform."
                                : "Manage the platform dataset."}
                    </p>
                </div>

                <button className="text-button" onClick={logout}>
                    Log out
                </button>
            </header>

            <nav
                className="admin-actions"
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    margin: "24px 0"
                }}
            >
                <button
                    onClick={() => setSection("overview")}
                    style={section === "overview"
                        ? { background: "#111", color: "#fff" }
                        : {}}
                >
                    Overview
                </button>

                <button
                    onClick={() => setSection("users")}
                    style={section === "users"
                        ? { background: "#111", color: "#fff" }
                        : {}}
                >
                    Registered users
                </button>

                {Object.entries(resources).map(([key, item]) => (
                    <button
                        key={key}
                        onClick={() => {
                            setResource(key);
                            setSection("resources");
                        }}
                        style={
                            section === "resources" && resource === key
                                ? { background: "#111", color: "#fff" }
                                : {}
                        }
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {error && <div className="error">{error}</div>}
            {message && <div className="message">{message}</div>}

            {section === "overview" && (
                <section>
                    <div className="eyebrow">
                        USAGE ANALYTICS · LAST 30 DAYS
                    </div>

                    <h2>Platform usage</h2>

                    {loading ? (
                        <p>Loading analytics...</p>
                    ) : (
                        <>
                            <div
                                className="tile-grid"
                                style={{ marginTop: "24px" }}
                            >
                                <article className="feature-tile">
                                    <div className="eyebrow">
                                        AUTHENTICATED PAGE VISITS
                                    </div>
                                    <h2>
                                        {analytics.totalPageVisits ?? 0}
                                    </h2>
                                    <p>
                                        Visits by logged-in users, excluding
                                        the landing page.
                                    </p>
                                </article>
                            </div>

                            <section style={{ marginTop: "32px" }}>
                                <h2>Most visited pages</h2>

                                {!analytics.mostVisitedPages?.length ? (
                                    <p>
                                        No authenticated page visits recorded
                                        in the last 30 days.
                                    </p>
                                ) : (
                                    <div>
                                        {analytics.mostVisitedPages.map(item => (
                                            <div
                                                key={item.page}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: "16px",
                                                    padding: "18px 0",
                                                    borderBottom: "1px solid #ccc"
                                                }}
                                            >
                                                <span>
                                                    {pageLabel(item.page)}
                                                </span>
                                                <strong>
                                                    {item.visits} visits
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    <button
                        className="auth-button"
                        style={{ marginTop: "24px" }}
                        onClick={loadAnalytics}
                        disabled={loading}
                    >
                        Refresh page visits
                    </button>
                </section>
            )}

            {section === "users" && (
                <section>
                    <div className="eyebrow">
                        USER MANAGEMENT
                    </div>

                    <h2>
                        Registered users ({users.length})
                    </h2>

                    {loading ? (
                        <p>Loading registered users...</p>
                    ) : users.length === 0 ? (
                        <p>No registered users found.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "20px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            "Name",
                                            "Email",
                                            "Education",
                                            "Skills",
                                            "Interests",
                                            "Registered"
                                        ].map(label => (
                                            <th
                                                key={label}
                                                style={{
                                                    textAlign: "left",
                                                    padding: "12px",
                                                    borderBottom: "1px solid #aaa"
                                                }}
                                            >
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map(person => (
                                        <tr key={person._id || person.email}>
                                            <td style={{ padding: "12px" }}>
                                                {person.name || "—"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {person.email || "—"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {person.education || "—"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {Array.isArray(person.skills)
                                                    ? person.skills.join(", ") || "—"
                                                    : "—"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {Array.isArray(person.interests)
                                                    ? person.interests.join(", ") || "—"
                                                    : "—"}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {person.createdAt
                                                    ? new Date(person.createdAt)
                                                        .toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button
                        className="auth-button"
                        style={{ marginTop: "24px" }}
                        onClick={loadUsers}
                        disabled={loading}
                    >
                        Refresh registered users
                    </button>
                </section>
            )}

            {section === "resources" && (
                <section>
                    <div className="eyebrow">
                        DATASET MANAGEMENT
                    </div>

                    <h2>
                        {editingId ? "Edit record" : `Add ${config.label.slice(0, -1).toLowerCase()}`}
                    </h2>

                    <div className="admin-layout">
                        <section className="admin-form">
                            {config.fields.map(field => (
                                <label key={field}>
                                    <span>
                                        {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                                    </span>

                                    {field === "description" ? (
                                        <textarea
                                            value={form[field] || ""}
                                            onChange={e =>
                                                updateForm(field, e.target.value)
                                            }
                                            placeholder={field}
                                        />
                                    ) : (
                                        <input
                                            value={form[field] || ""}
                                            onChange={e =>
                                                updateForm(field, e.target.value)
                                            }
                                            placeholder={
                                                ["skills", "requiredSkills"].includes(field)
                                                    ? "React, Python, SQL"
                                                    : field
                                            }
                                        />
                                    )}
                                </label>
                            ))}

                            <button
                                className="auth-button"
                                onClick={saveRecord}
                            >
                                {editingId ? "Update record" : "Add record"}
                            </button>

                            {editingId && (
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setForm(emptyForm());
                                        setError("");
                                    }}
                                >
                                    Cancel editing
                                </button>
                            )}
                        </section>

                        <section>
                            <h2>Existing {config.label.toLowerCase()}</h2>

                            {loading ? (
                                <p>Loading records...</p>
                            ) : records.length === 0 ? (
                                <p>No records found.</p>
                            ) : (
                                records.map(record => (
                                    <article
                                        key={record._id}
                                        className="course-card"
                                        style={{ marginBottom: "12px" }}
                                    >
                                        <h3>{record.name || "Untitled"}</h3>
                                        <p>{record.description || ""}</p>

                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "8px"
                                            }}
                                        >
                                            <button
                                                onClick={() => editRecord(record)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => deleteRecord(record._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </section>
                    </div>
                </section>
            )}
        </main>
    );
}
