import { useState } from "react";
import axios from "axios";
import { API } from "../api";

export function Login({ go, onLogin, onAdminLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
        if (!email.trim() || !password) {
            setError("Please enter your email address and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // First, try regular-user login.
            try {
                const response = await axios.post(`${API}/auth/login`, {
                    email,
                    password,
                });

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", "user");
                onLogin(response.data.user);
                go("dashboard");
                return;
            } catch (userLoginError) {
                // If regular login fails, try the admin login endpoint using
                // the same email and password entered in this form.
                try {
                    const response = await axios.post(`${API}/auth/admin-login`, {
                        email,
                        password,
                    });

                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("role", "admin");

                    if (onAdminLogin) {
                        onAdminLogin(response.data.admin);
                    }
                    go("admin");
                    return;
                } catch (adminLoginError) {
                    setError(
                        userLoginError.response?.data?.message ||
                        adminLoginError.response?.data?.message ||
                        "Invalid email or password."
                    );
                }
            }
        } catch {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button className="auth-logo" type="button" onClick={() => go("landing")}>
                    WHAT IF?
                </button>

                <div className="eyebrow">WELCOME BACK</div>
                <h1>Log in</h1>
                <p>Continue exploring your education and career possibilities.</p>

                {error && <div className="error">{error}</div>}

                <label>
                    <span>EMAIL ADDRESS</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="username"
                    />
                </label>

                <label>
                    <span>PASSWORD</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !loading) login();
                        }}
                    />
                </label>

                <div className="auth-row">
                    <button className="forgot" type="button" onClick={() => go("forgot")}>
                        Forgot password?
                    </button>
                </div>

                <button className="auth-button" type="button" onClick={login} disabled={loading}>
                    {loading ? "Logging in..." : "Log in →"}
                </button>

                <div className="auth-footer">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => go("signup")}>
                        Sign up
                    </button>
                </div>
            </div>
        </main>
    );
}

export function Signup({ go }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const register = async () => {
        setError("");
        setMessage("");

        if (!name.trim() || !email.trim() || !password) {
            setError("Please fill all the fields.");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API}/auth/register`, {
                name,
                email,
                password,
            });
            setMessage(response.data.message || "Account created successfully.");
            setTimeout(() => go("login"), 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card signup-card">
                <button className="auth-logo" type="button" onClick={() => go("landing")}>
                    WHAT IF?
                </button>
                <div className="eyebrow">GET STARTED</div>
                <h1>Create account</h1>
                <p>Start exploring your education and career possibilities.</p>

                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}

                <label>
                    <span>FULL NAME</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
                </label>
                <label>
                    <span>EMAIL ADDRESS</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <label>
                    <span>PASSWORD</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
                </label>
                <label>
                    <span>CONFIRM PASSWORD</span>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" />
                </label>
                <label className="checkbox-row">
                    <input type="checkbox" />
                    <span>I agree to the Terms &amp; Conditions</span>
                </label>

                <button className="auth-button" type="button" onClick={register} disabled={loading}>
                    {loading ? "Creating account..." : "Create account →"}
                </button>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <button type="button" onClick={() => go("login")}>Log in</button>
                </div>
            </div>
        </main>
    );
}

export function ForgotPassword({ go }) {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const requestReset = async () => {
        setError("");
        setMessage("");
        try {
            const response = await axios.post(`${API}/auth/forgot-password`, { email });
            setToken(response.data.resetToken || "");
            setMessage(response.data.message || "If the account exists, follow the reset instructions.");
        } catch (err) {
            setError(err.response?.data?.message || "Forgot password failed.");
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button className="auth-logo" type="button" onClick={() => go("landing")}>WHAT IF?</button>
                <div className="eyebrow">ACCOUNT RECOVERY</div>
                <h1>Forgot password</h1>
                <p>Enter your registered email address to generate a password reset token.</p>
                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}
                <label>
                    <span>EMAIL ADDRESS</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <button className="auth-button" type="button" onClick={requestReset}>Generate reset token</button>
                {token && <div className="message">Reset token: {token}</div>}
                {token && <button className="auth-button" type="button" onClick={() => go("reset")}>Continue to reset password</button>}
                <div className="auth-footer">
                    Remember your password?{" "}
                    <button type="button" onClick={() => go("login")}>Log in</button>
                </div>
            </div>
        </main>
    );
}

export function ResetPassword({ go }) {
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const reset = async () => {
        setError("");
        setMessage("");
        try {
            const response = await axios.post(`${API}/auth/reset-password`, {
                email,
                resetToken,
                newPassword,
            });
            setMessage(response.data.message || "Password reset successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed.");
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button className="auth-logo" type="button" onClick={() => go("landing")}>WHAT IF?</button>
                <div className="eyebrow">ACCOUNT RECOVERY</div>
                <h1>Reset password</h1>
                <p>Enter the reset token and your new password.</p>
                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}
                <label>
                    <span>EMAIL ADDRESS</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>
                    <span>RESET TOKEN</span>
                    <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
                </label>
                <label>
                    <span>NEW PASSWORD</span>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </label>
                <button className="auth-button" type="button" onClick={reset}>Reset password</button>
                <div className="auth-footer">
                    <button type="button" onClick={() => go("login")}>Back to login</button>
                </div>
            </div>
        </main>
    );
}

// Kept for compatibility with existing imports/routes. The login-page button
// has been removed; administrators can now use the regular login form.
export function AdminLogin({ go, onAdminLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.post(`${API}/auth/admin-login`, { email, password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", "admin");
            if (onAdminLogin) onAdminLogin(response.data.admin);
            go("admin");
        } catch (err) {
            setError(err.response?.data?.message || "Admin login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button className="auth-logo" type="button" onClick={() => go("landing")}>WHAT IF?</button>
                <div className="eyebrow">ADMINISTRATION</div>
                <h1>Admin login</h1>
                <p>Manage the educational and career dataset.</p>
                {error && <div className="error">{error}</div>}
                <label>
                    <span>ADMIN EMAIL</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>
                    <span>ADMIN PASSWORD</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <button className="auth-button" type="button" onClick={login} disabled={loading}>
                    {loading ? "Logging in..." : "Admin login →"}
                </button>
                <div className="auth-footer">
                    <button type="button" onClick={() => go("login")}>Back to user login</button>
                </div>
            </div>
        </main>
    );
}
