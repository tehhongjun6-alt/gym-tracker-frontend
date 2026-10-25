import {
    useEffect,
    useState,
} from "react";

import { apiFetch } from "../api";

export default function Friends({ token }) {
    const [users, setUsers] = useState([]);
    const [friendRequests, setFriendRequests] =
        useState([]);
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] =
        useState(false);
    const [sendingId, setSendingId] =
        useState(null);
    const [acceptingId, setAcceptingId] =
        useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadUsers(searchValue = "") {
        let path = "/users";

        if (searchValue.trim()) {
            path = `/users?search=${searchValue.trim()}`;
        }

        const data = await apiFetch(path, {
            token,
        });

        setUsers(data);
    }

    async function loadFriendRequests() {
        const data = await apiFetch(
            "/friend-requests",
            {
                token,
            }
        );

        setFriendRequests(data);
    }

    async function loadFriends() {
        const data = await apiFetch("/friends", {
            token,
        });

        setFriends(data);
    }

    async function loadPage() {
        setLoading(true);
        setError("");

        try {
            await loadUsers();
            await loadFriendRequests();
            await loadFriends();
        } catch (error) {
            setError(error.message);
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
        } catch (error) {
            setError(error.message);
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
                body: {
                    receiver_id: receiverId,
                },
                token,
            });

            setMessage(
                "Friend request sent successfully"
            );

            await loadUsers(search);
        } catch (error) {
            setError(error.message);
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
                `/friend-requests/${requestId}/accept`,
                {
                    method: "PATCH",
                    token,
                }
            );

            setMessage(
                "Friend request accepted successfully"
            );

            await loadUsers(search);
            await loadFriendRequests();
            await loadFriends();
        } catch (error) {
            setError(error.message);
        } finally {
            setAcceptingId(null);
        }
    }

    return (
        <section>
            <h2>Friends</h2>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            {loading && (
                <p>Loading friend information...</p>
            )}

            {!loading && (
                <div>
                    <section>
                        <h3>Find Users</h3>

                        <form onSubmit={handleSearch}>
                            <label htmlFor="search">
                                Search Username
                            </label>

                            <br />

                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                type="submit"
                                disabled={searching}
                            >
                                {searching
                                    ? "Searching..."
                                    : "Search"}
                            </button>
                        </form>

                        {users.length === 0 && (
                            <p>No users found.</p>
                        )}

                        {users.length > 0 && (
                            <ul>
                                {users.map((user) => (
                                    <li key={user.id}>
                                        <p>
                                            Username:{" "}
                                            {user.username}
                                        </p>

                                        {user.friendship_status ===
                                            "none" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSendRequest(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        sendingId ===
                                                        user.id
                                                    }
                                                >
                                                    {sendingId ===
                                                        user.id
                                                        ? "Sending..."
                                                        : "Add Friend"}
                                                </button>
                                            )}

                                        {user.friendship_status ===
                                            "request-sent" && (
                                                <p>
                                                    Friend request
                                                    sent
                                                </p>
                                            )}

                                        {user.friendship_status ===
                                            "request-received" && (
                                                <p>
                                                    This user sent
                                                    you a friend
                                                    request
                                                </p>
                                            )}

                                        {user.friendship_status ===
                                            "friends" && (
                                                <p>
                                                    You are friends
                                                </p>
                                            )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <hr />

                    <section>
                        <h3>Friend Requests</h3>

                        {friendRequests.length ===
                            0 && (
                                <p>
                                    You do not have any pending
                                    friend requests.
                                </p>
                            )}

                        {friendRequests.length > 0 && (
                            <ul>
                                {friendRequests.map(
                                    (request) => (
                                        <li
                                            key={
                                                request.id
                                            }
                                        >
                                            <p>
                                                {
                                                    request.requester_username
                                                }{" "}
                                                sent you a
                                                friend request.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAcceptRequest(
                                                        request.id
                                                    )
                                                }
                                                disabled={
                                                    acceptingId ===
                                                    request.id
                                                }
                                            >
                                                {acceptingId ===
                                                    request.id
                                                    ? "Accepting..."
                                                    : "Accept"}
                                            </button>
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </section>

                    <hr />

                    <section>
                        <h3>Your Friends</h3>

                        {friends.length === 0 && (
                            <p>
                                You do not have any friends yet.
                            </p>
                        )}

                        {friends.length > 0 && (
                            <ul>
                                {friends.map((friend) => (
                                    <li key={friend.id}>
                                        {friend.username}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}