import {
    Link,
    Outlet,
    useNavigate,
} from "react-router-dom";

export default function Layout({ onLogout }) {
    const navigate = useNavigate();

    function handleLogout() {
        onLogout();
        navigate("/login");
    }

    return (
        <div>
            <header>
                <h1>Gym Tracker</h1>

                <nav>
                    <Link to="/feed">Feed</Link>
                    {" | "}
                    <Link to="/workouts">Workouts</Link>
                    {" | "}
                    <Link to="/exercises">Exercises</Link>
                    {" | "}
                    <Link to="/friends">Friends</Link>
                    {" | "}
                    <Link to="/profile">Profile</Link>
                    {" | "}
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </header>

            <hr />

            <main>
                <Outlet />
            </main>
        </div>
    );
}
