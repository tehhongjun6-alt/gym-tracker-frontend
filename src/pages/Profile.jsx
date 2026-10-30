import { useEffect, useState } from "react";
import {
    FiActivity,
    FiChevronDown,
    FiGrid,
    FiImage,
    FiRefreshCw,
    FiUsers,
} from "react-icons/fi";

import { apiFetch } from "../api";
import armImage from "../assets/muscle-arm.png";
import backImage from "../assets/muscle-back.png";
import chestImage from "../assets/muscle-chest.png";
import coreImage from "../assets/muscle-core.png";
import legImage from "../assets/muscle-leg.png";
import shoulderImage from "../assets/muscle-shoulder.png";
import "../styles/pages/Profile.css";

const BODY_PARTS = {
    chest: { label: "Chest", image: chestImage },
    shoulder: { label: "Shoulder", image: shoulderImage },
    arm: { label: "Arm", image: armImage },
    leg: { label: "Leg", image: legImage },
    core: { label: "Core", image: coreImage },
    back: { label: "Back", image: backImage },
};

function getDateParts(dateValue) {
    const date = new Date(dateValue + "T00:00:00");

    return {
        day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
        month: new Intl.DateTimeFormat("en", { month: "short" }).format(date).toUpperCase(),
        year: new Intl.DateTimeFormat("en", { year: "numeric" }).format(date),
        weekday: new Intl.DateTimeFormat("en", { weekday: "long" }).format(date),
    };
}

function getInitial(username = "") {
    return username.trim().charAt(0).toUpperCase() || "W";
}

export default function Profile({ token }) {
    const [profile, setProfile] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeTab, setActiveTab] = useState("posts");
    const [expandedWorkoutDates, setExpandedWorkoutDates] = useState(new Set());
    const [brokenImages, setBrokenImages] = useState(
        () => new Set()
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadProfilePage() {
        setLoading(true);
        setError("");

        try {
            const [
                profileData,
                workoutsData,
                postsData,
                friendsData,
            ] = await Promise.all([
                apiFetch("/whoami", { token }),
                apiFetch("/workouts", { token }),
                apiFetch("/posts", { token }),
                apiFetch("/friends", { token }),
            ]);

            setProfile(profileData);
            setWorkouts(workoutsData);
            setPosts(
                postsData.filter(
                    (post) =>
                        post.author_id === profileData.id
                )
            );
            setFriends(friendsData);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProfilePage();
    }, [token]);

    function handleImageError(postId) {
        setBrokenImages((currentImages) => {
            const nextImages = new Set(currentImages);
            nextImages.add(postId);
            return nextImages;
        });
    }

    function toggleWorkoutDate(date) {
        setExpandedWorkoutDates((current) => {
            const next = new Set(current);
            if (next.has(date)) {
                next.delete(date);
            } else {
                next.add(date);
            }
            return next;
        });
    }

    if (loading) {
        return (
            <section className="profile-page">
                <div className="profile-state">
                    <span className="profile-loader" />
                    <p>Loading profile...</p>
                </div>
            </section>
        );
    }

    if (error || !profile) {
        return (
            <section className="profile-page">
                <div className="profile-state is-error">
                    <h1>Profile unavailable</h1>
                    <p>{error || "Profile not found."}</p>
                    <button
                        type="button"
                        onClick={loadProfilePage}
                    >
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    const tabs = [
        {
            id: "posts",
            label: "Posts",
            count: posts.length,
            icon: FiGrid,
        },
        {
            id: "workouts",
            label: "Workouts",
            count: workouts.length,
            icon: FiActivity,
        },
        {
            id: "friends",
            label: "Friends",
            count: friends.length,
            icon: FiUsers,
        },
    ];

    const workoutGroups = Object.entries(
        workouts.reduce((groups, workout) => {
            const date = workout.workout_date.slice(0, 10);
            if (!groups[date]) groups[date] = [];
            groups[date].push(workout);
            return groups;
        }, {})
    ).sort(([firstDate], [secondDate]) =>
        secondDate.localeCompare(firstDate)
    );

    return (
        <section className="profile-page">
            <div className="profile-shell">
                <header className="profile-header">
                    <div
                        className="profile-avatar"
                        aria-label={
                            profile.username + " avatar"
                        }
                    >
                        {getInitial(profile.username)}
                    </div>

                    <div className="profile-identity">
                        <h1>{profile.username}</h1>
                        <p>{profile.email}</p>
                    </div>

                    <button
                        className="profile-refresh"
                        type="button"
                        onClick={loadProfilePage}
                        aria-label="Refresh profile"
                        title="Refresh profile"
                    >
                        <FiRefreshCw aria-hidden="true" />
                    </button>

                    <div className="profile-stats">
                        {tabs.map((tab) => (
                            <button
                                type="button"
                                key={tab.id}
                                className={
                                    activeTab === tab.id
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveTab(tab.id)
                                }
                            >
                                <strong>{tab.count}</strong>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </header>

                <nav
                    className="profile-tabs"
                    aria-label="Profile content"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                type="button"
                                key={tab.id}
                                className={
                                    activeTab === tab.id
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveTab(tab.id)
                                }
                            >
                                <Icon aria-hidden="true" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="profile-content">
                    {activeTab === "posts" && (
                        <>
                            {posts.length === 0 ? (
                                <div className="profile-empty">
                                    <FiImage aria-hidden="true" />
                                    <h2>No posts yet</h2>
                                    <p>
                                        Your shared training
                                        moments will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="profile-post-grid">
                                    {posts.map((post) => {
                                        const showImage =
                                            post.image_url &&
                                            !brokenImages.has(
                                                post.id
                                            );

                                        return (
                                            <article
                                                className={
                                                    "profile-post" +
                                                    (showImage
                                                        ? ""
                                                        : " is-text")
                                                }
                                                key={post.id}
                                            >
                                                {showImage ? (
                                                    <img
                                                        src={
                                                            post.image_url
                                                        }
                                                        alt={
                                                            "Post by " +
                                                            profile.username
                                                        }
                                                        onError={() =>
                                                            handleImageError(
                                                                post.id
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <FiImage aria-hidden="true" />
                                                )}
                                                <div>
                                                    <p>
                                                        {post.content ||
                                                            "Shared a training moment."}
                                                    </p>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "workouts" && (
                        <>
                            {workouts.length === 0 ? (
                                <div className="profile-empty">
                                    <FiActivity aria-hidden="true" />
                                    <h2>No workouts yet</h2>
                                    <p>
                                        Logged workout records
                                        will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="profile-workout-date-list">
                                    {workoutGroups.map(([date, dateWorkouts]) => {
                                        const dateParts = getDateParts(date);
                                        const isExpanded = expandedWorkoutDates.has(date);
                                        const bodyParts = [...new Set(
                                            dateWorkouts
                                                .map((workout) => workout.body_part)
                                                .filter(Boolean)
                                        )];
                                        const bodyPartGroups = Object.entries(
                                            dateWorkouts.reduce((groups, workout) => {
                                                const bodyPart = workout.body_part || "other";
                                                if (!groups[bodyPart]) groups[bodyPart] = [];
                                                groups[bodyPart].push(workout);
                                                return groups;
                                            }, {})
                                        );

                                        return (
                                            <article
                                                className={`profile-workout-date-card${isExpanded ? " is-expanded" : ""}`}
                                                key={date}
                                            >
                                                <button
                                                    className="profile-workout-date-summary"
                                                    type="button"
                                                    onClick={() => toggleWorkoutDate(date)}
                                                    aria-expanded={isExpanded}
                                                    aria-controls={`profile-workout-${date}`}
                                                >
                                                    <span className="profile-workout-date-number">{dateParts.day}</span>
                                                    <span className="profile-workout-date-copy">
                                                        <strong>{dateParts.month} {dateParts.year}</strong>
                                                        <small>{dateParts.weekday}</small>
                                                    </span>
                                                    <span className="profile-workout-muscles">
                                                        {bodyParts.slice(0, 4).map((bodyPart) => (
                                                            <span key={bodyPart}>
                                                                {BODY_PARTS[bodyPart]?.label || bodyPart}
                                                            </span>
                                                        ))}
                                                    </span>
                                                    <span className="profile-workout-count">
                                                        <strong>{dateWorkouts.length}</strong>
                                                        <small>{dateWorkouts.length === 1 ? "exercise" : "exercises"}</small>
                                                    </span>
                                                    <FiChevronDown className="profile-workout-chevron" aria-hidden="true" />
                                                </button>

                                                {isExpanded && (
                                                    <div className="profile-workout-details" id={`profile-workout-${date}`}>
                                                        {bodyPartGroups.map(([bodyPartName, bodyPartWorkouts]) => {
                                                            const bodyPart = BODY_PARTS[bodyPartName];

                                                            return (
                                                                <section className="profile-workout-body-group" key={bodyPartName}>
                                                                    <div className="profile-workout-image">
                                                                        {bodyPart ? (
                                                                            <img src={bodyPart.image} alt={`${bodyPart.label} muscles`} />
                                                                        ) : (
                                                                            <span>W</span>
                                                                        )}
                                                                    </div>

                                                                    <div className="profile-workout-body-list">
                                                                        <span className="profile-workout-body-label">
                                                                            {bodyPart?.label || "Workout"}
                                                                        </span>

                                                                        {bodyPartWorkouts.map((workout) => (
                                                                            <article className="profile-workout-entry" key={workout.id}>
                                                                                <h3>{workout.exercise_name}</h3>
                                                                                <div className="profile-workout-metrics">
                                                                                    <span><strong>{workout.sets}</strong><small>SETS</small></span>
                                                                                    <span><strong>{workout.reps}</strong><small>REPS</small></span>
                                                                                    <span><strong>{workout.weight}</strong><small>KG</small></span>
                                                                                </div>
                                                                            </article>
                                                                        ))}
                                                                    </div>
                                                                </section>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "friends" && (
                        <>
                            {friends.length === 0 ? (
                                <div className="profile-empty">
                                    <FiUsers aria-hidden="true" />
                                    <h2>No friends yet</h2>
                                    <p>
                                        Your training circle
                                        will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="profile-friends">
                                    {friends.map((friend) => (
                                        <article key={friend.id}>
                                            <div className="profile-friend-avatar">
                                                {getInitial(
                                                    friend.username
                                                )}
                                            </div>
                                            <strong>
                                                {friend.username}
                                            </strong>
                                            <span>Friend</span>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
