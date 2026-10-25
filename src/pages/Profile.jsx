import {
    useEffect,
    useState,
} from "react";

import { apiFetch } from "../api";

export default function Profile({ token }) {
    const [profile, setProfile] =
        useState(null);
    const [workoutCount, setWorkoutCount] =
        useState(0);
    const [postCount, setPostCount] =
        useState(0);
    const [friendCount, setFriendCount] =
        useState(0);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] = useState("");

    async function loadProfilePage() {
        setLoading(true);
        setError("");

        try {
            const profileData = await apiFetch(
                "/whoami",
                {
                    token,
                }
            );

            const workoutsData = await apiFetch(
                "/workouts",
                {
                    token,
                }
            );

            const postsData = await apiFetch(
                "/posts",
                {
                    token,
                }
            );

            const friendsData = await apiFetch(
                "/friends",
                {
                    token,
                }
            );

            const ownPosts = postsData.filter(
                (post) =>
                    post.author_id ===
                    profileData.id
            );

            setProfile(profileData);
            setWorkoutCount(workoutsData.length);
            setPostCount(ownPosts.length);
            setFriendCount(friendsData.length);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProfilePage();
    }, [token]);

    if (loading) {
        return (
            <section>
                <h2>Profile</h2>
                <p>Loading profile...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2>Profile</h2>
                <p>{error}</p>

                <button onClick={loadProfilePage}>
                    Try again
                </button>
            </section>
        );
    }

    if (!profile) {
        return (
            <section>
                <h2>Profile</h2>
                <p>Profile not found.</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Profile</h2>

            <div>
                <h3>Account information</h3>

                <p>
                    Username: {profile.username}
                </p>

                <p>Email: {profile.email}</p>

                <p>
                    Member since:{" "}
                    {profile.created_at.slice(0, 10)}
                </p>
            </div>

            <div>
                <h3>Your activity</h3>

                <p>
                    Workout records:{" "}
                    {workoutCount}
                </p>

                <p>
                    Posts shared: {postCount}
                </p>

                <p>
                    Friends: {friendCount}
                </p>
            </div>

            <button onClick={loadProfilePage}>
                Refresh profile
            </button>
        </section>
    );
}