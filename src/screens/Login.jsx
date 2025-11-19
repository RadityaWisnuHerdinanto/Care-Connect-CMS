import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const base = import.meta.env.VITE_BASE_URL || "https://careconnect.unikloh.icu";

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }
        setLoading(true);
        try {
            // If you have an API, set VITE_BASE_URL in .env (e.g. VITE_BASE_URL=https://api.example.com)
            if (base) {
                const res = await axios.post(`${base}/api/users/login`, { email, password });
                console.log(res);
                
                const token = res?.data?.token || res?.data?.access_token || null;
                const user = res?.data?.user || res?.data || null;
                if (token) localStorage.setItem("access_token", token);
                if (user?.name) localStorage.setItem("username", user.name);
                navigate("/");
            } else {
                // No API provided — simulate a successful login for local dev
                await new Promise((r) => setTimeout(r, 700));
                localStorage.setItem("access_token", "demo-token");
                localStorage.setItem("username", email.split("@")[0] || "User");
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Invalid credentials or server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatarCircle} aria-hidden>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#047857" opacity="0.15"/>
                            <path d="M12 13c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" fill="#047857" opacity="0.08"/>
                            <circle cx="12" cy="7" r="3" fill="#047857" />
                        </svg>
                    </div>
                    <h1 style={styles.title}>Welcome back</h1>
                    <p style={styles.subtitle}>Sign in to continue to Care Connect</p>
                </div>

                <form onSubmit={submit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <label style={styles.label} htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />

                    <label style={styles.label} htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />

                    <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        padding: '32px',
    },
    card: {
        width: '100%',
        maxWidth: 420,
        background: '#WHITE',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(16,24,40,0.08)',
        overflow: 'hidden',
    },
    header: {
        textAlign: 'center',
        padding: '36px 28px',
        borderBottom: '1px solid #E5E7EB',
    },
    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#ECFDF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
    },
    title: {
        margin: 0,
        fontSize: 22,
        color: '#111827',
        fontWeight: 700,
    },
    subtitle: {
        margin: '6px 0 0',
        color: '#6B7280',
        fontSize: 13,
    },
    form: {
        padding: '20px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        height: 44,
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid #E5E7EB',
        fontSize: 14,
        outline: 'none',
    },
    button: {
        marginTop: 20,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },
    row: {
        marginTop: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    small: {
        color: '#6B7280',
        fontSize: 13,
    },
    linkBtn: {
        background: 'transparent',
        border: 'none',
        color: '#047857',
        fontWeight: 600,
        cursor: 'pointer',
        padding: 0,
    },
    error: {
        background: '#FEF2F2',
        color: '#B91C1C',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 6,
    },
};
