
import { useState } from "react";
import axios from "axios";
import { API } from "../api";

const getErrorMessage = (err, fallback) => {
    if (err.response?.data?.message) {
        return err.response.data.message;
    }

    if (err.response?.status === 404) {
        return "Login endpoint not found. Please check the backend routes.";
    }

    if (!err.response) {
        return "Cannot connect to the backend. Please check the server and API URL.";
    }

    return fallback;
};

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
            let response;

            try {
                response = await axios.post(`${API}/auth/login`, {
                    email: email.trim(),
                    password,
                });

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", "user");
                onLogin(response.data.user);
                go("dashboard");
                return;
            } catch (userError) {
                // Only try admin login when the user credentials are rejected.
                // A 404 or network error means the endpoint may be unavailable.
                if (
                    userError.response?.status !== 401 &&
                    userError.response?.status !== 403
                ) {
                    throw userError;
                }
            }

            response = await axios.post(`${API}/auth/admin-login`, {
                email: email.trim(),
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", "admin");

            if (onAdminLogin) {
                onAdminLogin(response.data.admin);
            }

            go("admin");
        } catch (err) {
            setError(getErrorMessage(err, "Invalid email or password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button
                    className="auth-logo"
                    type="button"
                    onClick={() => go("landing")}
                >
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
                    <button
                        className="forgot"
                        type="button"
                        onClick={() => go("forgot")}
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    className="auth-button"
                    type="button"
                    onClick={login}
                    disabled={loading}
                >
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
                name: name.trim(),
                email: email.trim(),
                password,
            });

            setMessage(
                response.data.message || "Account created successfully."
            );

            setTimeout(() => go("login"), 1000);
        } catch (err) {
            setError(getErrorMessage(err, "Registration failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card signup-card">
                <button
                    className="auth-logo"
                    type="button"
                    onClick={() => go("landing")}
                >
                    WHAT IF?
                </button>

                <div className="eyebrow">GET STARTED</div>
                <h1>Create account</h1>
                <p>Start exploring your education and career possibilities.</p>

                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}

                <label>
                    <span>FULL NAME</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                    />
                </label>

                <label>
                    <span>EMAIL ADDRESS</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </label>

                <label>
                    <span>PASSWORD</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                    />
                </label>

                <label>
                    <span>CONFIRM PASSWORD</span>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm your password"
                    />
                </label>

                <label className="checkbox-row">
                    <input type="checkbox" />
                    <span>I agree to the Terms &amp; Conditions</span>
                </label>

                <button
                    className="auth-button"
                    type="button"
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create account →"}
                </button>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <button type="button" onClick={() => go("login")}>
                        Log in
                    </button>
                </div>
            </div>
        </main>
    );
}

export function ForgotPassword({ go }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const requestReset = async () => {
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API}/auth/forgot-password`,
                { email: email.trim() }
            );

            setMessage(
                response.data.message ||
                "If the account exists, follow the reset instructions sent to your email."
            );
        } catch (err) {
            setError(getErrorMessage(err, "Forgot password failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button
                    className="auth-logo"
                    type="button"
                    onClick={() => go("landing")}
                >
                    WHAT IF?
                </button>

                <div className="eyebrow">ACCOUNT RECOVERY</div>
                <h1>Forgot password</h1>
                <p>
                    Enter your registered email address to receive password
                    reset instructions.
                </p>

                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}

                <label>
                    <span>EMAIL ADDRESS</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </label>

                <button
                    className="auth-button"
                    type="button"
                    onClick={requestReset}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send reset instructions"}
                </button>

                <div className="auth-footer">
                    Remember your password?{" "}
                    <button type="button" onClick={() => go("login")}>
                        Log in
                    </button>
                </div>
            </div>
        </main>
    );
}

export function ResetPassword({ go }) {
    const params = new URLSearchParams(window.location.search);

    const [email, setEmail] = useState(params.get("email") || "");
    const [resetToken, setResetToken] = useState(params.get("token") || "");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const reset = async () => {
        setError("");
        setMessage("");

        if (!email.trim() || !resetToken.trim() || !newPassword) {
            setError("Please complete all fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API}/auth/reset-password`,
                {
                    email: email.trim(),
                    resetToken: resetToken.trim(),
                    newPassword,
                }
            );

            setMessage(
                response.data.message || "Password reset successfully."
            );
        } catch (err) {
            setError(getErrorMessage(err, "Password reset failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button
                    className="auth-logo"
                    type="button"
                    onClick={() => go("landing")}
                >
                    WHAT IF?
                </button>

                <div className="eyebrow">ACCOUNT RECOVERY</div>
                <h1>Reset password</h1>
                <p>Enter your reset token and choose a new password.</p>

                {error && <div className="error">{error}</div>}
                {message && <div className="message">{message}</div>}

                <label>
                    <span>EMAIL ADDRESS</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label>
                    <span>RESET TOKEN</span>
                    <input
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                    />
                </label>

                <label>
                    <span>NEW PASSWORD</span>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </label>

                <button
                    className="auth-button"
                    type="button"
                    onClick={reset}
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset password"}
                </button>

                <div className="auth-footer">
                    <button type="button" onClick={() => go("login")}>
                        Back to login
                    </button>
                </div>
            </div>
        </main>
    );
}

// Kept for compatibility with existing imports.
export function AdminLogin({ go, onAdminLogin }) {
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
            const response = await axios.post(`${API}/auth/admin-login`, {
                email: email.trim(),
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", "admin");

            if (onAdminLogin) {
                onAdminLogin(response.data.admin);
            }

            go("admin");
        } catch (err) {
            setError(getErrorMessage(err, "Admin login failed."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <button
                    className="auth-logo"
                    type="button"
                    onClick={() => go("landing")}
                >
                    WHAT IF?
                </button>

                <div className="eyebrow">ADMINISTRATION</div>
                <h1>Admin login</h1>
                <p>Manage the educational and career dataset.</p>

                {error && <div className="error">{error}</div>}

                <label>
                    <span>ADMIN EMAIL</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label>
                    <span>ADMIN PASSWORD</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <button
                    className="auth-button"
                    type="button"
                    onClick={login}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Admin login →"}
                </button>

                <div className="auth-footer">
                    <button type="button" onClick={() => go("login")}>
                        Back to user login
                    </button>
                </div>
            </div>
        </main>
    );
}
