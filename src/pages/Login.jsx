import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { apiFetch } from "../api";

export default function Login({ onLogin }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            if (
                !data.session ||
                !data.session.access_token
            ) {
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

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
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
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <p>
                Do not have an account?{" "}
                <Link to="/signup">Sign up</Link>
            </p>
        </main>
    );
}
