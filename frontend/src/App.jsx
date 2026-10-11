
import { useEffect, useState } from "react";
import { Shell } from "./components/Common.jsx";
import { Landing } from "./pages/Landing.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import {
    CourseExplorer,
    CourseDetails
} from "./pages/Courses.jsx";
import { CareerDetails } from "./pages/Careers.jsx";
import { SkillGap } from "./pages/SkillGap.jsx";
import {
    JobExplorer,
    JobDetails
} from "./pages/Jobs.jsx";
import { CoverLetter } from "./pages/CoverLetter.jsx";
import { Scenario } from "./pages/Scenario.jsx";
import {
    Login,
    Signup,
    ForgotPassword,
    ResetPassword,
    AdminLogin
} from "./pages/Auth.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { Profile, EditProfile } from "./pages/Profile.jsx";
import { SavedPlans } from "./pages/SavedPlans.jsx";
import Intro from "./components/Intro.jsx";
import { trackEvent } from "./analytics";

export default function App() {
    const [screen, setScreen] = useState("landing");
    const [user, setUser] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showIntro, setShowIntro] = useState(true);

    // Restore the saved user when the app opens.
    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }
    }, []);

    // Track visits only for authenticated regular users.
    // Exclude landing, authentication and admin screens.
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        const excludedScreens = [
            "landing",
            "login",
            "signup",
            "forgot",
            "reset",
            "admin",
            "admin-login"
        ];

        if (
            !showIntro &&
            token &&
            role === "user" &&
            user &&
            !excludedScreens.includes(screen)
        ) {
            trackEvent("page_visit", screen);
        }
    }, [screen, showIntro, user]);

    const go = (next) => {
        setScreen(next);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Regular-user login handler.
    const onLogin = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", "user");
    };

    // Admin login handler.
    const onAdminLogin = (adminData) => {
        setUser(adminData || { role: "admin" });
        localStorage.setItem(
            "user",
            JSON.stringify(adminData || { role: "admin" })
        );
        localStorage.setItem("role", "admin");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setUser(null);
        go("landing");
    };

    if (showIntro) {
        return (
            <Intro
                onComplete={() => setShowIntro(false)}
            />
        );
    }

    if (screen === "landing") {
        return <Landing go={go} />;
    }

    if (screen === "login") {
        return (
            <Login
                go={go}
                onLogin={onLogin}
                onAdminLogin={onAdminLogin}
            />
        );
    }

    if (screen === "signup") {
        return <Signup go={go} />;
    }

    if (screen === "forgot") {
        return <ForgotPassword go={go} />;
    }

    if (screen === "reset") {
        return <ResetPassword go={go} />;
    }

    // Retained for compatibility with the existing route.
    if (screen === "admin-login") {
        return (
            <AdminLogin
                go={go}
                onAdminLogin={onAdminLogin}
            />
        );
    }

    if (screen === "admin") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <AdminDashboard go={go} />
            </Shell>
        );
    }

    if (screen === "dashboard") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <Dashboard
                    go={go}
                    user={user}
                    courses={[]}
                />
            </Shell>
        );
    }

    if (screen === "courses") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <CourseExplorer
                    go={go}
                    setSelectedCourse={setSelectedCourse}
                />
            </Shell>
        );
    }

    if (screen === "course") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <CourseDetails
                    go={go}
                    course={selectedCourse}
                />
            </Shell>
        );
    }

    if (screen === "career") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <CareerDetails go={go} />
            </Shell>
        );
    }

    if (screen === "skills") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <SkillGap
                    go={go}
                    user={user}
                />
            </Shell>
        );
    }

    if (screen === "jobs") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <JobExplorer
                    go={go}
                    setSelectedJob={setSelectedJob}
                />
            </Shell>
        );
    }

    if (screen === "job") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <JobDetails
                    go={go}
                    job={selectedJob}
                />
            </Shell>
        );
    }

    if (screen === "cover") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <CoverLetter go={go} />
            </Shell>
        );
    }

    if (screen === "scenario") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <Scenario go={go} />
            </Shell>
        );
    }

    if (screen === "saved") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <SavedPlans go={go} />
            </Shell>
        );
    }

    if (screen === "edit-profile") {
        return (
            <Shell
                screen="profile"
                go={go}
                user={user}
            >
                <EditProfile
                    go={go}
                    user={user}
                />
            </Shell>
        );
    }

    if (screen === "profile") {
        return (
            <Shell
                screen={screen}
                go={go}
                user={user}
            >
                <Profile
                    go={go}
                    user={user}
                    onLogout={logout}
                />
            </Shell>
        );
    }

    return <Landing go={go} />;
}
