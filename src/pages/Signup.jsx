import "@fontsource/manrope/500.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { apiFetch } from "../api";
import wesetLogo from "../assets/weset-logo-social.svg";
import "../styles/pages/Login.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Signup({ onLogin }) {
    const navigate = useNavigate();
    const stageRef = useRef(null);
    const panelRef = useRef(null);
    const lockupRef = useRef(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useGSAP(
        () => {
            const motion = gsap.matchMedia();

            motion.add(
                "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
                () => {
                    const timeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: stageRef.current,
                            start: "top top",
                            end: "+=110%",
                            scrub: 0.8,
                            pin: true,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                        },
                    });

                    timeline
                        .to(panelRef.current, { xPercent: 108, ease: "none" }, 0)
                        .to(
                            lockupRef.current,
                            {
                                x: () => window.innerWidth * 0.275,
                                scale: 1.16,
                                ease: "none",
                            },
                            0
                        );

                    return () => timeline.kill();
                }
            );

            return () => motion.revert();
        },
        { scope: stageRef }
    );

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/auth/signup", {
                method: "POST",
                body: {
                    username,
                    email,
                    password,
                },
            });

            if (data.session && data.session.access_token) {
                onLogin(data.session.access_token);
                navigate("/feed");
                return;
            }

            setMessage(data.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page" ref={stageRef}>
            <section className="login-brand" aria-label="WESET brand">
                <img className="login-watermark" src={wesetLogo} alt="" aria-hidden="true" />

                <div className="brand-lockup" ref={lockupRef}>
                    <img
                        className="brand-mark"
                        src={wesetLogo}
                        alt="WESET social connection logo"
                    />
                    <div className="brand-copy">
                        <p className="brand-name">WESET</p>
                        <p className="brand-tagline">Train. Share. Together.</p>
                    </div>
                </div>

                <p className="scroll-note" aria-hidden="true">
                    <span /> Scroll to reveal
                </p>
            </section>

            <section className="login-panel" ref={panelRef}>
                <div className="login-panel-topline">
                    <span>Already have an account?</span>
                    <Link to="/login">Login</Link>
                </div>

                <div className="login-card signup-card">
                    <p className="login-eyebrow">JOIN WESET</p>
                    <h1>Create your account</h1>
                    <p className="login-intro">
                        Start tracking your progress and sharing the journey.
                    </p>

                    <button
                        className="google-button"
                        type="button"
                        disabled
                        title="Google sign-up is coming soon"
                    >
                        <FcGoogle aria-hidden="true" />
                        <span>Continue with Google</span>
                        <small>Coming soon</small>
                    </button>

                    <div className="login-divider" aria-hidden="true">
                        <span>or continue with email</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Choose a username"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                minLength="6"
                                required
                            />
                        </div>

                        {message && <p className="login-message" role="status">{message}</p>}
                        {error && <p className="login-error" role="alert">{error}</p>}

                        <button className="login-submit" type="submit" disabled={loading}>
                            <span>{loading ? "Creating account..." : "Create account"}</span>
                            {!loading && <span aria-hidden="true">→</span>}
                        </button>
                    </form>

                    <p className="login-mobile-signup">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>

                <p className="login-footer">
                    By creating an account, you agree to use WESET responsibly.
                </p>
            </section>
        </main>
    );
}
