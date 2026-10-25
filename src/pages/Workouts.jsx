import {
    useEffect,
    useState,
} from "react";

import { apiFetch } from "../api";

export default function Workouts({ token }) {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] =
        useState(null);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        workout_date: "",
        exercise_name: "",
        sets: "",
        reps: "",
        weight: "",
    });

    async function loadWorkouts() {
        setLoading(true);
        setError("");

        try {
            const data = await apiFetch("/workouts", {
                token,
            });

            setWorkouts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWorkouts();
    }, [token]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value,
        });
    }

    function resetForm() {
        setForm({
            workout_date: "",
            exercise_name: "",
            sets: "",
            reps: "",
            weight: "",
        });

        setEditingId(null);
    }

    function startEditing(workout) {
        setEditingId(workout.id);

        setForm({
            workout_date: workout.workout_date.slice(0, 10),
            exercise_name: workout.exercise_name,
            sets: workout.sets,
            reps: workout.reps,
            weight: workout.weight,
        });

        setMessage("");
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        const workoutData = {
            workout_date: form.workout_date,
            exercise_name: form.exercise_name,
            sets: Number(form.sets),
            reps: Number(form.reps),
            weight: Number(form.weight),
        };

        const isEditing = editingId !== null;

        try {
            if (isEditing) {
                await apiFetch(
                    `/workouts/${editingId}`,
                    {
                        method: "PATCH",
                        body: workoutData,
                        token,
                    }
                );
            } else {
                await apiFetch("/workouts", {
                    method: "POST",
                    body: workoutData,
                    token,
                });
            }

            if (isEditing) {
                setMessage(
                    "Workout updated successfully"
                );
            } else {
                setMessage(
                    "Workout created successfully"
                );
            }

            resetForm();
            await loadWorkouts();
        } catch (error) {
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
            await apiFetch(`/workouts/${id}`, {
                method: "DELETE",
                token,
            });

            setMessage(
                "Workout deleted successfully"
            );

            if (editingId === id) {
                resetForm();
            }

            setDeleteConfirmId(null);
            await loadWorkouts();
        } catch (error) {
            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section>
            <h2>Workouts</h2>

            <h3>
                {editingId
                    ? "Edit Workout"
                    : "Add Workout"}
            </h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="workout_date">
                        Workout Date
                    </label>

                    <br />

                    <input
                        id="workout_date"
                        name="workout_date"
                        type="date"
                        value={form.workout_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="exercise_name">
                        Exercise Name
                    </label>

                    <br />

                    <input
                        id="exercise_name"
                        name="exercise_name"
                        type="text"
                        value={form.exercise_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="sets">
                        Sets
                    </label>

                    <br />

                    <input
                        id="sets"
                        name="sets"
                        type="number"
                        min="1"
                        step="1"
                        value={form.sets}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="reps">
                        Reps
                    </label>

                    <br />

                    <input
                        id="reps"
                        name="reps"
                        type="number"
                        min="1"
                        step="1"
                        value={form.reps}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="weight">
                        Weight
                    </label>

                    <br />

                    <input
                        id="weight"
                        name="weight"
                        type="number"
                        min="0"
                        max="99999.99"
                        step="0.01"
                        value={form.weight}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Workout"
                            : "Add Workout"}
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

            <h3>Your Workout History</h3>

            {loading && <p>Loading workouts...</p>}

            {!loading &&
                !error &&
                workouts.length === 0 && (
                    <p>
                        You do not have any workout records yet.
                    </p>
                )}

            {!loading && workouts.length > 0 && (
                <ul>
                    {workouts.map((workout) => (
                        <li key={workout.id}>
                            <p>
                                Date:{" "}
                                {workout.workout_date.slice(
                                    0,
                                    10
                                )}
                            </p>

                            <p>
                                Exercise:{" "}
                                {workout.exercise_name}
                            </p>

                            <p>
                                Sets: {workout.sets}
                            </p>

                            <p>
                                Reps: {workout.reps}
                            </p>

                            <p>
                                Weight: {workout.weight}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    startEditing(workout)
                                }
                            >
                                Edit
                            </button>

                            {deleteConfirmId ===
                                workout.id ? (
                                <div>
                                    <p>
                                        Are you sure you want
                                        to delete this workout?
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                workout.id
                                            )
                                        }
                                        disabled={
                                            deletingId ===
                                            workout.id
                                        }
                                    >
                                        {deletingId ===
                                            workout.id
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
                                            workout.id
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
                                            workout.id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}