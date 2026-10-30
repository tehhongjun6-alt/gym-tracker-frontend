import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { apiFetch } from "../api";
import CreatePostModal from "../components/CreatePostModal";
import {
    formatRelativeTime,
    getFriendshipLabel,
} from "./feedUtils";
import "../styles/pages/Feed.css";

function getInitials(username = "") {
    return username
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "W";
}

export default function FitFeed({ token }) {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [brokenImages, setBrokenImages] = useState(() => new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const friendshipByUserId = useMemo(
        () =>
            new Map(
                users.map((user) => [
                    user.id,
                    user.friendship_status,
                ])
            ),
        [users]
    );

    const loadFeed = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [userData, postData, usersData] = await Promise.all([
                apiFetch("/whoami", { token }),
                apiFetch("/posts", { token }),
                apiFetch("/users", { token }),
            ]);

            setCurrentUser(userData);
            setPosts(postData);
            setUsers(usersData);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const initialLoad = window.setTimeout(loadFeed, 0);

        return () => window.clearTimeout(initialLoad);
    }, [loadFeed]);

    useEffect(() => {
        function openCreatePost() {
            setIsCreateOpen(true);
        }

        document.addEventListener(
            "weset:open-create-post",
            openCreatePost
        );

        return () => {
            document.removeEventListener(
                "weset:open-create-post",
                openCreatePost
            );
        };
    }, []);


    async function handleSendRequest(receiverId) {
        setSendingId(receiverId);
        setMessage("");
        setError("");

        try {
            await apiFetch("/friend-requests", {
                method: "POST",
                body: {
                    receiver_id: receiverId,
                },
                token,
            });

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === receiverId
                        ? {
                            ...user,
                            friendship_status: "request-sent",
                        }
                        : user
                )
            );
            setMessage("Friend request sent.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSendingId(null);
        }
    }

    function handleImageError(postId) {
        setBrokenImages((current) => {
            const next = new Set(current);
            next.add(postId);
            return next;
        });
    }

    return (
        <section className="fit-page" aria-label="WESET Fit feed">
            <header className="fit-mobile-header">
                <div>
                    <p className="fit-kicker">WESET</p>

                </div>
                <span className="fit-mobile-user" aria-label="Your profile">
                    {getInitials(currentUser?.username)}
                </span>
            </header>

            <div className="fit-feed" aria-live="polite">
                {message && (
                    <p className="fit-notice fit-notice-success">
                        {message}
                    </p>
                )}

                {error && (
                    <div className="fit-state fit-error" role="alert">
                        <p>{error}</p>
                        <button type="button" onClick={loadFeed}>
                            Try again
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="fit-state fit-loading">
                        <span className="fit-loading-mark" aria-hidden="true" />
                        <p>Loading your Fit feed...</p>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="fit-state fit-empty">
                        <span className="fit-empty-mark" aria-hidden="true">
                            +
                        </span>
                        <h2>Your Fit feed is ready for its first post.</h2>
                        <p>
                            Use the Create button to share today's training.
                        </p>
                    </div>
                )}

                {!loading && !error && posts.map((post) => {
                    const isOwnPost = currentUser?.id === post.author_id;
                    const friendshipStatus =
                        friendshipByUserId.get(post.author_id) || "none";
                    const friendshipLabel =
                        getFriendshipLabel(friendshipStatus);
                    const canAddFriend = friendshipStatus === "none";
                    const imageIsBroken = brokenImages.has(post.id);

                    return (
                        <article
                            className={`fit-post${post.image_url ? "" : " is-text-only"}`}
                            key={post.id}
                        >
                            <header className="fit-post-header">
                                <span
                                    className="fit-avatar"
                                    aria-hidden="true"
                                >
                                    {getInitials(post.author)}
                                </span>

                                <div className="fit-post-author">
                                    <strong>{post.author}</strong>
                                    <span>
                                        {formatRelativeTime(post.created_at)}
                                    </span>
                                </div>

                                {!isOwnPost && (
                                    <button
                                        type="button"
                                        className={`fit-friend-button is-${friendshipStatus}`}
                                        onClick={() =>
                                            handleSendRequest(post.author_id)
                                        }
                                        disabled={
                                            !canAddFriend ||
                                            sendingId === post.author_id
                                        }
                                    >
                                        {sendingId === post.author_id
                                            ? "Sending..."
                                            : friendshipLabel}
                                    </button>
                                )}
                            </header>

                            {post.image_url && !imageIsBroken && (
                                <div className="fit-post-media">
                                    <img
                                        className="fit-post-image"
                                        src={post.image_url}
                                        alt={`Post by ${post.author}`}
                                        onError={() => handleImageError(post.id)}
                                    />
                                </div>
                            )}

                            {post.image_url && imageIsBroken && (
                                <div
                                    className="fit-image-error"
                                    role="img"
                                    aria-label={`Image unavailable for post by ${post.author}`}
                                >
                                    Image unavailable
                                </div>
                            )}

                            <div className="fit-post-caption">
                                <p>
                                    <strong>{post.author}</strong>{" "}
                                    <span>{post.content}</span>
                                </p>

                                {isOwnPost && post.visibility === "friends-only" && (
                                    <span className="fit-visibility">
                                        Friends only
                                    </span>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            <CreatePostModal
                token={token}
                currentUser={currentUser}
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={loadFeed}
            />

        </section>
    );
}
