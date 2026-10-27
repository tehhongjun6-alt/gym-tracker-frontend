import {
    FiActivity,
    FiCoffee,
    FiHeart,
    FiHome,
    FiLogOut,
    FiPlusSquare,
    FiUser,
} from "react-icons/fi";
import { GiWeightLiftingUp } from "react-icons/gi";
import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import wesetLogo from "../assets/weset-logo-social.svg";
import "./AppShell.css";

const navigation = [
    { label: "Fit", to: "/feed", icon: FiHome },
    { label: "Workouts", to: "/workouts", icon: FiActivity },
    { label: "Exercises", to: "/exercises", icon: GiWeightLiftingUp },
    { label: "Food", to: "/food", icon: FiCoffee },
    { label: "Friends", to: "/friends", icon: FiHeart },
];

export default function Layout({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    function openCreatePost() {
        if (location.pathname === "/feed") {
            document.dispatchEvent(
                new CustomEvent("weset:open-create-post")
            );
            return;
        }

        navigate("/feed");
        window.setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent("weset:open-create-post")
            );
        }, 0);
    }

    async function handleLogout() {
        await onLogout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="weset-app">
            <aside className="app-rail">
                <NavLink
                    to="/feed"
                    className="app-logo-link"
                    aria-label="WESET Fit"
                >
                    <img
                        src={wesetLogo}
                        alt="WESET"
                        className="app-logo"
                    />
                </NavLink>

                <nav
                    className="app-navigation"
                    aria-label="Main navigation"
                >
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                aria-label={item.label}
                                title={item.label}
                                className={({ isActive }) =>
                                    `app-nav-action app-nav-${item.label.toLowerCase()}${isActive ? " is-active" : ""}`
                                }
                            >
                                <Icon aria-hidden="true" />
                                <span className="app-nav-label">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}

                    <button
                        type="button"
                        className="app-nav-action app-create-action"
                        aria-label="Create post"
                        title="Create post"
                        onClick={openCreatePost}
                    >
                        <FiPlusSquare aria-hidden="true" />
                        <span className="app-nav-label">
                            Create
                        </span>
                    </button>

                    <NavLink
                        to="/profile"
                        aria-label="Profile"
                        title="Profile"
                        className={({ isActive }) =>
                            `app-nav-action app-nav-profile${isActive ? " is-active" : ""}`
                        }
                    >
                        <FiUser aria-hidden="true" />
                        <span className="app-nav-label">
                            Profile
                        </span>
                    </NavLink>
                </nav>

                <button
                    type="button"
                    className="app-nav-action app-logout-action"
                    aria-label="Logout"
                    title="Logout"
                    onClick={handleLogout}
                >
                    <FiLogOut aria-hidden="true" />
                    <span className="app-nav-label">
                        Logout
                    </span>
                </button>
            </aside>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}
