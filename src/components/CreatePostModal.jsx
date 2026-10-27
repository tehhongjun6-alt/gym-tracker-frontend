import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    FiImage,
    FiSend,
    FiX,
} from "react-icons/fi";

import { apiFetch } from "../api";
import { createStorageClient } from "../supabaseStorage";
import "./CreatePostModal.css";

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
const maximumSize = 2 * 1024 * 1024;

export default function CreatePostModal({
    token,
    currentUser,
    isOpen,
    onClose,
    onCreated,
}) {
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const resetForm = useCallback(() => {
        setContent("");
        setVisibility("public");
        setImageFile(null);
        setError("");
    }, []);

    const handleClose = useCallback(() => {
        if (saving) {
            return;
        }

        resetForm();
        onClose();
    }, [onClose, resetForm, saving]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function closeFromKeyboard(event) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        document.addEventListener("keydown", closeFromKeyboard);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", closeFromKeyboard);
        };
    }, [handleClose, isOpen]);

    function handleImageChange(event) {
        const file = event.target.files[0];
        setError("");

        if (!file) {
            setImageFile(null);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            event.target.value = "";
            setImageFile(null);
            setError("Use a JPEG, PNG, or WebP image.");
            return;
        }

        if (file.size > maximumSize) {
            event.target.value = "";
            setImageFile(null);
            setError("Your photo must be 2 MB or smaller.");
            return;
        }

        setImageFile(file);
    }

    async function uploadImage() {
        if (!imageFile) {
            return null;
        }

        if (!currentUser) {
            throw new Error("Your profile is not ready yet.");
        }

        const extension = imageFile.type.split("/")[1];
        const imagePath = `${currentUser.id}/${Date.now()}.${extension}`;
        const storageClient = createStorageClient(token);
        const { error: uploadError } = await storageClient.storage
            .from("post-images")
            .upload(imagePath, imageFile, {
                contentType: imageFile.type,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        return imagePath;
    }

    async function cleanUpImage(imagePath) {
        try {
            await apiFetch("/post-images/cleanup", {
                method: "DELETE",
                body: {
                    image_path: imagePath,
                },
                token,
            });
        } catch (cleanupError) {
            console.error(
                "Unable to clean up image:",
                cleanupError.message
            );
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        let uploadedImagePath = null;

        try {
            uploadedImagePath = await uploadImage();

            const postData = {
                content: content.trim(),
                visibility,
            };

            if (uploadedImagePath) {
                postData.image_path = uploadedImagePath;
            }

            await apiFetch("/posts", {
                method: "POST",
                body: postData,
                token,
            });
            await onCreated();
            resetForm();
            onClose();
        } catch (requestError) {
            if (uploadedImagePath) {
                await cleanUpImage(uploadedImagePath);
            }

            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="create-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <section
                className="create-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-post-title"
            >
                <header className="create-modal-header">
                    <div>
                        <p>WESET FIT</p>
                        <h2 id="create-post-title">Create post</h2>
                    </div>
                    <button
                        type="button"
                        className="create-modal-close"
                        aria-label="Close create post"
                        onClick={handleClose}
                        disabled={saving}
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <label className="create-field" htmlFor="create-content">
                        <span>Post content</span>
                        <textarea
                            id="create-content"
                            aria-label="Post content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="What did you train today?"
                            rows="5"
                            maxLength="500"
                            required
                            autoFocus
                        />
                        <small>{content.length}/500</small>
                    </label>

                    <label className="create-field" htmlFor="create-visibility">
                        <span>Who can see this?</span>
                        <select
                            id="create-visibility"
                            aria-label="Who can see this?"
                            value={visibility}
                            onChange={(event) =>
                                setVisibility(event.target.value)
                            }
                        >
                            <option value="public">Everyone</option>
                            <option value="friends-only">Friends only</option>
                        </select>
                    </label>

                    <label
                        className="create-photo-field"
                        htmlFor="create-photo"
                    >
                        <FiImage aria-hidden="true" />
                        <span>
                            <strong>Add one gym photo</strong>
                            <small>JPEG, PNG or WebP, up to 2 MB</small>
                        </span>
                        <input
                            id="create-photo"
                            aria-label="Add one gym photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />
                    </label>

                    {imageFile && (
                        <p className="create-selected-photo">
                            Selected: {imageFile.name}
                        </p>
                    )}

                    {error && (
                        <p className="create-modal-error" role="alert">
                            {error}
                        </p>
                    )}

                    <footer className="create-modal-actions">
                        <button
                            type="button"
                            className="create-cancel"
                            onClick={handleClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-submit"
                            disabled={saving}
                        >
                            <FiSend aria-hidden="true" />
                            {saving ? "Sharing..." : "Share post"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
