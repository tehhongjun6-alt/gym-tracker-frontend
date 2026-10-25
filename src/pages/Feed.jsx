import {
    useEffect,
    useState,
} from "react";

import { apiFetch } from "../api";
import {
    createStorageClient,
} from "../supabaseStorage";

export default function Feed({ token }) {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] =
        useState(null);
    const [imageFile, setImageFile] =
        useState(null);
    const [loading, setLoading] =
        useState(true);
    const [saving, setSaving] =
        useState(false);
    const [deletingId, setDeletingId] =
        useState(null);
    const [
        deleteConfirmId,
        setDeleteConfirmId,
    ] = useState(null);
    const [editingId, setEditingId] =
        useState(null);
    const [message, setMessage] =
        useState("");
    const [error, setError] =
        useState("");

    const [form, setForm] = useState({
        content: "",
        visibility: "public",
    });

    async function loadFeed() {
        setLoading(true);
        setError("");

        try {
            const userData = await apiFetch(
                "/whoami",
                {
                    token,
                }
            );

            const postData = await apiFetch(
                "/posts",
                {
                    token,
                }
            );

            setCurrentUser(userData);
            setPosts(postData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFeed();
    }, [token]);

    function handleChange(event) {
        const { name, value } =
            event.target;

        setForm({
            ...form,
            [name]: value,
        });
    }

    function handleImageChange(event) {
        const file =
            event.target.files[0];

        setError("");

        if (!file) {
            setImageFile(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            event.target.value = "";
            setImageFile(null);
            setError(
                "Only JPEG, PNG, and WebP images are allowed."
            );
            return;
        }

        const maximumSize =
            2 * 1024 * 1024;

        if (file.size > maximumSize) {
            event.target.value = "";
            setImageFile(null);
            setError(
                "The image must be 2 MB or smaller."
            );
            return;
        }

        setImageFile(file);
    }

    function resetForm() {
        setForm({
            content: "",
            visibility: "public",
        });

        setImageFile(null);
        setEditingId(null);
    }

    function startEditing(post) {
        setEditingId(post.id);

        setForm({
            content: post.content,
            visibility: post.visibility,
        });

        setImageFile(null);
        setDeleteConfirmId(null);
        setMessage("");
        setError("");
    }

    async function uploadImage() {
        if (!imageFile) {
            return null;
        }

        if (!currentUser) {
            throw new Error(
                "User profile is not ready."
            );
        }

        const extension =
            imageFile.type.split("/")[1];

        const imagePath =
            `${currentUser.id}/` +
            `${Date.now()}.${extension}`;

        const storageClient =
            createStorageClient(token);

        const {
            error: uploadError,
        } = await storageClient.storage
            .from("post-images")
            .upload(
                imagePath,
                imageFile,
                {
                    contentType:
                        imageFile.type,
                    upsert: false,
                }
            );

        if (uploadError) {
            throw new Error(
                uploadError.message
            );
        }

        return imagePath;
    }

    async function cleanUpImage(
        imagePath
    ) {
        try {
            await apiFetch(
                "/post-images/cleanup",
                {
                    method: "DELETE",
                    body: {
                        image_path:
                            imagePath,
                    },
                    token,
                }
            );
        } catch (cleanupError) {
            console.error(
                "Unable to clean up image:",
                cleanupError.message
            );
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const formElement =
            event.currentTarget;

        setSaving(true);
        setMessage("");
        setError("");

        const isEditing =
            editingId !== null;

        let uploadedImagePath = null;

        try {
            if (
                !isEditing &&
                imageFile
            ) {
                uploadedImagePath =
                    await uploadImage();
            }

            const postData = {
                content: form.content,
                visibility:
                    form.visibility,
            };

            if (uploadedImagePath) {
                postData.image_path =
                    uploadedImagePath;
            }

            if (isEditing) {
                await apiFetch(
                    `/posts/${editingId}`,
                    {
                        method: "PATCH",
                        body: postData,
                        token,
                    }
                );
            } else {
                await apiFetch("/posts", {
                    method: "POST",
                    body: postData,
                    token,
                });
            }

            if (isEditing) {
                setMessage(
                    "Post updated successfully"
                );
            } else {
                setMessage(
                    "Post created successfully"
                );
            }

            resetForm();
            formElement.reset();
            await loadFeed();
        } catch (error) {
            if (uploadedImagePath) {
                await cleanUpImage(
                    uploadedImagePath
                );
            }

            setError(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);
        setMessage("");
        setError("");

        try {
            await apiFetch(
                `/posts/${id}`,
                {
                    method: "DELETE",
                    token,
                }
            );

            setMessage(
                "Post deleted successfully"
            );

            if (editingId === id) {
                resetForm();
            }

            setDeleteConfirmId(null);
            await loadFeed();
        } catch (error) {
            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section>
            <h2>Feed</h2>

            <h3>
                {editingId
                    ? "Edit Post"
                    : "Create Post"}
            </h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="content">
                        Post Content
                    </label>

                    <br />

                    <textarea
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={
                            handleChange
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="visibility">
                        Visibility
                    </label>

                    <br />

                    <select
                        id="visibility"
                        name="visibility"
                        value={
                            form.visibility
                        }
                        onChange={
                            handleChange
                        }
                    >
                        <option value="public">
                            Public
                        </option>

                        <option value="friends-only">
                            Friends Only
                        </option>
                    </select>
                </div>

                {!editingId && (
                    <div>
                        <label htmlFor="post-image">
                            Gym photo
                            (optional)
                        </label>

                        <br />

                        <input
                            id="post-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                                handleImageChange
                            }
                        />

                        {imageFile && (
                            <p>
                                Selected:{" "}
                                {
                                    imageFile.name
                                }
                            </p>
                        )}
                    </div>
                )}

                {editingId && (
                    <p>
                        The existing photo
                        will not be changed.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        saving || loading
                    }
                >
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Post"
                            : "Create Post"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={saving}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <hr />

            <h3>Posts</h3>

            {loading && (
                <p>Loading posts...</p>
            )}

            {!loading &&
                !error &&
                posts.length === 0 && (
                    <p>
                        There are no posts yet.
                    </p>
                )}

            {!loading &&
                posts.length > 0 && (
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id}>
                                <p>
                                    Author:{" "}
                                    {post.author}
                                </p>

                                <p>
                                    {post.content}
                                </p>

                                {post.image_url && (
                                    <img
                                        src={
                                            post.image_url
                                        }
                                        alt={`Post by ${post.author}`}
                                        width="300"
                                    />
                                )}

                                {post.image_path &&
                                    !post.image_url && (
                                        <p>
                                            Image is
                                            unavailable.
                                        </p>
                                    )}

                                <p>
                                    Visibility:{" "}
                                    {
                                        post.visibility
                                    }
                                </p>

                                <p>
                                    Created:{" "}
                                    {post.created_at.slice(
                                        0,
                                        10
                                    )}
                                </p>

                                {currentUser &&
                                    post.author_id ===
                                    currentUser.id && (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditing(
                                                        post
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            {deleteConfirmId ===
                                                post.id ? (
                                                <div>
                                                    <p>
                                                        Are you
                                                        sure you
                                                        want to
                                                        delete
                                                        this
                                                        post?
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                post.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            post.id
                                                        }
                                                    >
                                                        {deletingId ===
                                                            post.id
                                                            ? "Deleting..."
                                                            : "Confirm Delete"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteConfirmId(
                                                                null
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            post.id
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteConfirmId(
                                                            post.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                            </li>
                        ))}
                    </ul>
                )}
        </section>
    );
}
