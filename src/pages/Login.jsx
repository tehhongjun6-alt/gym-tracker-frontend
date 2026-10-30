import "@fontsource/manrope/500.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { apiFetch } from "../api";
import wesetLogo from "../assets/weset-logo-social.svg";
import trackPhoto from "../assets/weset-track.png";
import learnPhoto from "../assets/weset-learn.png";
import sharePhoto from "../assets/weset-share.png";
import "../styles/pages/Login.css";
import { supabaseAuth } from "../supabaseAuth";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const stageRef = useRef(null);
    const panelRef = useRef(null);
    const lockupRef = useRef(null);
    const storyRef = useRef(null);
    const blendRef = useRef(null);
    const joinRef = useRef(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useGSAP(
        () => {
            if (typeof window.matchMedia !== "function") {
                return;
            }

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
                        .to(
                            panelRef.current,
                            {
                                xPercent: 108,
                                ease: "none",
                            },
                            0
                        )
                        .to(
                            lockupRef.current,
                            {
                                x: () => window.innerWidth * 0.275,
                                scale: 1.16,
                                ease: "none",
                            },
                            0
                        );

                    const storyCards = gsap.utils.toArray(
                        ".feature-photo",
                        storyRef.current
                    );
                    const storyLines = gsap.utils.toArray(
                        ".feature-line",
                        storyRef.current
                    );

                    gsap.set(storyCards, {
                        xPercent: 180,
                        autoAlpha: 0,
                    });
                    gsap.set(storyLines, {
                        y: 20,
                        autoAlpha: 0,
                    });
                    gsap.set(blendRef.current, {
                        autoAlpha: 1,
                    });

                    const storyTimeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: storyRef.current,
                            start: "top top",
                            end: "+=240%",
                            scrub: 0.8,
                            pin: true,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                        },
                    });

                    storyTimeline.to(
                        blendRef.current,
                        {
                            autoAlpha: 0,
                            duration: 0.5,
                            ease: "none",
                        },
                        0
                    );

                    storyCards.forEach((card, index) => {
                        if (index > 0) {
                            storyTimeline.to(
                                storyLines[index - 1],
                                {
                                    y: -20,
                                    autoAlpha: 0,
                                    duration: 0.2,
                                    ease: "none",
                                },
                                index
                            );
                        }

                        storyTimeline
                            .to(
                                card,
                                {
                                    xPercent: 0,
                                    autoAlpha: 1,
                                    duration: 0.75,
                                    ease: "none",
                                },
                                index
                            )
                            .to(
                                storyLines[index],
                                {
                                    y: 0,
                                    autoAlpha: 1,
                                    duration: 0.25,
                                    ease: "none",
                                },
                                index + 0.42
                            );
                    });

                    const joinWords = gsap.utils.toArray(
                        ".join-word",
                        joinRef.current
                    );
                    const joinWatermark =
                        joinRef.current?.querySelector(".join-watermark");

                    const joinTimeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: joinRef.current,
                            start: "top 82%",
                            end: "top 12%",
                            scrub: 0.75,
                            invalidateOnRefresh: true,
                        },
                    });

                    joinTimeline
                        .fromTo(
                            joinWords[0],
                            { xPercent: -24, autoAlpha: 0 },
                            { xPercent: 0, autoAlpha: 1, ease: "none" },
                            0
                        )
                        .fromTo(
                            joinWords[1],
                            { xPercent: 24, autoAlpha: 0 },
                            { xPercent: 0, autoAlpha: 1, ease: "none" },
                            0.08
                        )
                        .fromTo(
                            joinWords[2],
                            { xPercent: -18, autoAlpha: 0 },
                            { xPercent: 0, autoAlpha: 1, ease: "none" },
                            0.2
                        )
                        .fromTo(
                            joinWords[3],
                            { yPercent: 70, autoAlpha: 0 },
                            { yPercent: 0, autoAlpha: 1, ease: "none" },
                            0.32
                        )
                        .fromTo(
                            joinWatermark,
                            { scale: 0.72, rotate: -8, autoAlpha: 0 },
                            { scale: 1, rotate: 0, autoAlpha: 0.08, ease: "none" },
                            0.08
                        );

                    return () => {
                        timeline.kill();
                        storyTimeline.kill();
                        joinTimeline.kill();
                    };
                }
            );

            return () => {
                motion.revert();
            };
        },
        {
            scope: stageRef,
        }
    );
    useEffect(() => {
        let handled = false;

        async function finishGoogleLogin(session) {
            if (handled || !session?.access_token) {
                return;
            }

            handled = true;

            try {
                await apiFetch("/auth/google-profile", {
                    method: "POST",
                    token: session.access_token,
                });

                onLogin(session.access_token);
                navigate("/feed");
            } catch (error) {
                handled = false;
                setError(error.message);
            }
        }

        supabaseAuth.auth.getSession().then(({ data }) => {
            finishGoogleLogin(data.session);
        });

        const {
            data: { subscription },
        } = supabaseAuth.auth.onAuthStateChange(
            (_event, session) => {
                finishGoogleLogin(session);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, onLogin]);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: {
                    email,
                    password,
                },
            });

            if (!data.session || !data.session.access_token) {
                throw new Error("Login token is missing");
            }

            onLogin(data.session.access_token);
            navigate("/feed");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function returnToLogin() {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        stageRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
    }
    async function handleGoogleLogin() {
        setError("");
        setLoading(true);

        try {
            const { error } =
                await supabaseAuth.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo:
                            `${window.location.origin}/login`,
                    },
                });

            if (error) {
                throw error;
            }
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <main className="login-experience">
            <section className="login-page" ref={stageRef}>
                <section className="login-brand" aria-label="WESET brand">
                    <img
                        className="login-watermark"
                        src={wesetLogo}
                        alt=""
                        aria-hidden="true"
                    />

                    <div className="brand-lockup" ref={lockupRef}>
                        <img
                            className="brand-mark"
                            src={wesetLogo}
                            alt="WESET social connection logo"
                        />

                        <div className="brand-copy">
                            <p className="brand-name">WESET</p>
                            <p className="brand-tagline">
                                Train. Share. Together.
                            </p>
                        </div>
                    </div>

                    <p className="scroll-note" aria-hidden="true">
                        <span /> Scroll to reveal
                    </p>
                </section>

                <section className="login-panel" ref={panelRef}>
                    <div className="login-panel-topline">
                        <span>New to WESET?</span>
                        <Link to="/signup">Create account</Link>
                    </div>

                    <div className="login-card">
                        <p className="login-eyebrow">WELCOME BACK</p>
                        <h1>Welcome back</h1>
                        <p className="login-intro">
                            Your progress, your people, all in one place.
                        </p>
                        <button
                            className="google-button"
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <FcGoogle aria-hidden="true" />

                            <span>
                                {loading
                                    ? "Connecting..."
                                    : "Continue with Google"}
                            </span>
                        </button>

                        <div className="login-divider" aria-hidden="true">
                            <span>or continue with email</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="login-field">
                                <label htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
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
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                className="login-submit"
                                type="submit"
                                disabled={loading}
                            >
                                <span>
                                    {loading ? "Logging in..." : "Login"}
                                </span>
                                {!loading && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="login-mobile-signup">
                            Do not have an account?{" "}
                            <Link to="/signup">Sign up</Link>
                        </p>
                    </div>

                    <p className="login-footer">
                        By continuing, you agree to use WESET responsibly.
                    </p>
                </section>
            </section>

            <section
                className="feature-story"
                ref={storyRef}
                aria-label="What you can do with WESET"
            >
                <div
                    className="feature-blend"
                    ref={blendRef}
                    aria-hidden="true"
                />

                <div className="feature-photos">
                    <figure className="feature-photo feature-photo--track">
                        <img
                            src={trackPhoto}
                            alt="Athlete tracking a strength workout"
                        />
                    </figure>

                    <figure className="feature-photo feature-photo--learn">
                        <img
                            src={learnPhoto}
                            alt="Training partners learning an exercise"
                        />
                    </figure>

                    <figure className="feature-photo feature-photo--share">
                        <img
                            src={sharePhoto}
                            alt="Friends sharing an active journey"
                        />
                    </figure>
                </div>

                <div className="feature-copy" aria-live="polite">
                    <h2 className="feature-line">
                        Track Every Workout And See Your Progress
                    </h2>
                    <h2 className="feature-line">
                        Discover New Exercises And Train With Confidence
                    </h2>
                    <h2 className="feature-line">
                        Share Your Journey And Grow Stronger Together
                    </h2>
                </div>
            </section>

            <section
                className="join-finale"
                ref={joinRef}
                aria-label="Join WESET"
            >
                <img
                    className="join-watermark"
                    src={wesetLogo}
                    alt=""
                    aria-hidden="true"
                />

                <button
                    className="join-statement"
                    type="button"
                    onClick={returnToLogin}
                    aria-label="Join WESET right now and return to login"
                >
                    <span className="join-word join-word--join" aria-hidden="true">
                        JOIN
                    </span>
                    <span className="join-word join-word--brand" aria-hidden="true">
                        <span>WE</span>
                        <span>SET</span>
                    </span>
                    <span className="join-word join-word--right" aria-hidden="true">
                        RIGHT
                    </span>
                    <span className="join-word join-word--now" aria-hidden="true">
                        NOW <span>↗</span>
                    </span>
                </button>
            </section>
        </main>
    );
}
