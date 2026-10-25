import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { apiFetch } from "../api";

export default function Signup({ onLogin }) {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            // 如果 Supabase 马上建立 session，就直接登录
            if (
                data.session &&
                data.session.access_token
            ) {
                onLogin(data.session.access_token);
                navigate("/feed");
                return;
            }

            // 如果需要确认邮箱，就显示后端信息
            setMessage(data.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Sign Up</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">
                        Username
                    </label>

                    <br />

                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <br />

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <br />

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        minLength="6"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating account..."
                        : "Sign Up"}
                </button>
            </form>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <p>
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </main>
    );
}
