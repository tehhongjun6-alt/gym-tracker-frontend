import { useState } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Exercises from "./pages/Exercises";
import Feed from "./pages/Feed";
import Food from "./pages/Food";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Workouts from "./pages/Workouts";

export default function App() {
    const [token, setToken] = useState(
        localStorage.getItem("access_token") || ""
    );

    function handleLogin(accessToken) {
        localStorage.setItem(
            "access_token",
            accessToken
        );

        setToken(accessToken);
    }

    function handleLogout() {
        localStorage.removeItem("access_token");
        setToken("");
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={token ? "/feed" : "/login"}
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        token ? (
                            <Navigate
                                to="/feed"
                                replace
                            />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />

                <Route
                    path="/signup"
                    element={
                        token ? (
                            <Navigate
                                to="/feed"
                                replace
                            />
                        ) : (
                            <Signup onLogin={handleLogin} />
                        )
                    }
                />

                <Route
                    element={
                        <ProtectedRoute token={token} />
                    }
                >
                    <Route
                        element={
                            <Layout
                                onLogout={handleLogout}
                            />
                        }
                    >
                        <Route
                            path="/feed"
                            element={<Feed token={token} />}
                        />

                        <Route
                            path="/workouts"
                            element={<Workouts token={token} />}
                        />

                        <Route
                            path="/exercises"
                            element={<Exercises token={token} />}
                        />

                        <Route
                            path="/food"
                            element={<Food token={token} />}
                        />

                        <Route
                            path="/friends"
                            element={<Friends token={token} />}
                        />

                        <Route
                            path="/profile"
                            element={<Profile token={token} />}
                        />
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
