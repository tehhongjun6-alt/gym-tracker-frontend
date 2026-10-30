import { useEffect, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";

import { apiFetch } from "../api";
import PageHeader from "../components/PageHeader";
import "../styles/pages/Friends.css";

function getInitial(username = "") {
    return username.trim().charAt(0).toUpperCase() || "?";
}
export default function Friends({ token }) {
    const [activeTab, setActiveTab] = useState("find");
    const [users, setUsers] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [acceptedRequestIds, setAcceptedRequestIds] =
        useState(new Set());
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    const [acceptingId, setAcceptingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadUsers(searchValue = "") {
        let path = "/users";

        if (searchValue.trim()) {
            path =
                "/users?search=" +
                encodeURIComponent(searchValue.trim());
        }

        const data = await apiFetch(path, { token });
        setUsers(data);
    }

    async function loadFriendRequests() {
        const data = await apiFetch("/friend-requests", {
            token,
        });
        setFriendRequests(data);
    }

    async function loadFriends() {
        const data = await apiFetch("/friends", { token });
        setFriends(data);
    }

    async function loadPage() {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                loadUsers(),
                loadFriendRequests(),
                loadFriends(),
            ]);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPage();
    }, [token]);

    async function handleSearch(event) {
        event.preventDefault();
        setSearching(true);
        setMessage("");
        setError("");

        try {
            await loadUsers(search);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSearching(false);
        }
    }

    async function handleSendRequest(receiverId) {
        setSendingId(receiverId);
        setMessage("");
        setError("");

        try {
            await apiFetch("/friend-requests", {
                method: "POST",
                body: { receiver_id: receiverId },
                token,
            });

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === receiverId
                        ? {
                              ...user,
                              friendship_status:
                                  "request-sent",
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

    async function handleAcceptRequest(requestId) {
        setAcceptingId(requestId);
        setMessage("");
        setError("");

        try {
            await apiFetch(
                "/friend-requests/" +
                    requestId +
                    "/accept",
                {
                    method: "PATCH",
                    token,
                }
            );

            setAcceptedRequestIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.add(requestId);
                return nextIds;
            });

            await Promise.all([
                loadUsers(search),
                loadFriends(),
            ]);
            setMessage("Friend request accepted.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setAcceptingId(null);
        }
    }

    function getUserButton(user) {
        if (sendingId === user.id) {
            return {
                label: "Sending...",
                disabled: true,
                className: "is-primary",
            };
        }

        if (user.friendship_status === "none") {
            return {
                label: "Add Friend",
                disabled: false,
                className: "is-primary",
            };
        }

        if (user.friendship_status === "request-sent") {
            return {
                label: "Requested",
                disabled: true,
                className: "is-muted",
            };
        }

        if (
            user.friendship_status === "request-received"
        ) {
            return {
                label: "Request received",
                disabled: true,
                className: "is-muted",
            };
        }

        return {
            label: "Friends",
            disabled: true,
            className: "is-muted",
        };
    }

    const pendingRequestCount = friendRequests.filter(
        (request) => !acceptedRequestIds.has(request.id)
    ).length;

    return (
        <section className="friends-page">
            <PageHeader eyebrow="Friends" title="Stronger" accent="Together." />

            <nav
                className="friends-tabs"
                aria-label="Friend sections"
            >
                <button
                    type="button"
                    className={
                        activeTab === "find"
                            ? "is-active"
                            : ""
                    }
                    onClick={() => setActiveTab("find")}
                >
                    Find Users
                </button>
                <button
                    type="button"
                    className={
                        activeTab === "requests"
                            ? "is-active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("requests")
                    }
                >
                    Friend Requests
                    {pendingRequestCount > 0 && (
                        <span>{pendingRequestCount}</span>
                    )}
                </button>
                <button
                    type="button"
                    className={
                        activeTab === "friends"
                            ? "is-active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("friends")
                    }
                >
                    Your Friends
                </button>
            </nav>

            {message && (
                <div className="friends-notice is-success">
                    {message}
                </div>
            )}
            {error && (
                <div className="friends-notice is-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="friends-loading">
                    Loading friend information...
                </div>
            ) : (
                <div className="friends-panel">
                    {activeTab === "find" && (
                        <section>
                            <form
                                className="friends-search"
                                onSubmit={handleSearch}
                            >
                                <div>
                                    <FiSearch aria-hidden="true" />
                                    <input
                                        id="friend-search"
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Search username"
                                        aria-label="Search username"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={searching}
                                >
                                    {searching
                                        ? "Searching..."
                                        : "Search"}
                                </button>
                            </form>

                            {users.length === 0 ? (
                                <div className="friends-empty">
                                    <FiUsers aria-hidden="true" />
                                    <h2>No users found</h2>
                                    <p>
                                        Try another username.
                                    </p>
                                </div>
                            ) : (
                                <div className="friend-list">
                                    {users.map((user) => {
                                        const button =
                                            getUserButton(
                                                user
                                            );

                                        return (
                                            <article
                                                className="friend-row"
                                                key={user.id}
                                            >
                                                <div className="friend-avatar">
                                                    {getInitial(
                                                        user.username
                                                    )}
                                                </div>
                                                <strong>
                                                    {user.username}
                                                </strong>
                                                <button
                                                    type="button"
                                                    className={
                                                        "friend-action " +
                                                        button.className
                                                    }
                                                    onClick={() =>
                                                        handleSendRequest(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        button.disabled
                                                    }
                                                >
                                                    {button.label}
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "requests" && (
                        <section>
                            {friendRequests.length === 0 ? (
                                <div className="friends-empty">
                                    <FiUsers aria-hidden="true" />
                                    <h2>No friend requests</h2>
                                    <p>
                                        New requests will
                                        appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="friend-list">
                                    {friendRequests.map(
                                        (request) => {
                                            const accepted =
                                                acceptedRequestIds.has(
                                                    request.id
                                                );
                                            const accepting =
                                                acceptingId ===
                                                request.id;

                                            return (
                                                <article
                                                    className="friend-row"
                                                    key={
                                                        request.id
                                                    }
                                                >
                                                    <div className="friend-avatar">
                                                        {getInitial(
                                                            request.requester_username
                                                        )}
                                                    </div>
                                                    <strong>
                                                        {
                                                            request.requester_username
                                                        }
                                                    </strong>
                                                    <button
                                                        type="button"
                                                        className={
                                                            "friend-action " +
                                                            (accepted
                                                                ? "is-muted"
                                                                : "is-primary")
                                                        }
                                                        onClick={() =>
                                                            handleAcceptRequest(
                                                                request.id
                                                            )
                                                        }
                                                        disabled={
                                                            accepted ||
                                                            accepting
                                                        }
                                                    >
                                                        {accepting
                                                            ? "Confirming..."
                                                            : accepted
                                                              ? "Accepted"
                                                              : "Confirm"}
                                                    </button>
                                                </article>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "friends" && (
                        <section>
                            {friends.length === 0 ? (
                                <div className="friends-empty">
                                    <FiUsers aria-hidden="true" />
                                    <h2>No friends yet</h2>
                                    <p>
                                        Find someone and send
                                        your first request.
                                    </p>
                                </div>
                            ) : (
                                <div className="friend-list">
                                    {friends.map((friend) => (
                                        <article
                                            className="friend-row friend-row-static"
                                            key={friend.id}
                                        >
                                            <div className="friend-avatar">
                                                {getInitial(
                                                    friend.username
                                                )}
                                            </div>
                                            <strong>
                                                {friend.username}
                                            </strong>
                                            <span className="friend-status">
                                                Friends
                                            </span>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            )}
        </section>
    );
}
