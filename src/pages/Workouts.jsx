import { useCallback, useEffect, useState } from "react";
import {
    FiChevronDown,
    FiEdit3,
    FiPlus,
    FiTrash2,
} from "react-icons/fi";

import { apiFetch } from "../api";
import armImage from "../assets/muscle-arm.png";
import backImage from "../assets/muscle-back.png";
import chestImage from "../assets/muscle-chest.png";
import coreImage from "../assets/muscle-core.png";
import legImage from "../assets/muscle-leg.png";
import shoulderImage from "../assets/muscle-shoulder.png";
import PageHeader from "../components/PageHeader";
import WorkoutDrawer from "../components/WorkoutDrawer";
import "../styles/pages/Workouts.css";

const EMPTY_FORM = { workout_date: "", body_part: "", exercise_name: "", sets: "", reps: "", weight: "" };

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

export default function Workouts({ token }) {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [expandedDates, setExpandedDates] = useState(new Set());
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);

    const loadWorkouts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setWorkouts(await apiFetch("/workouts", { token }));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const timer = window.setTimeout(loadWorkouts, 0);
        return () => window.clearTimeout(timer);
    }, [loadWorkouts]);

    function openCreateDrawer() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError("");
        setMessage("");
        setIsDrawerOpen(true);
    }

    function closeDrawer() {
        if (saving) return;
        setIsDrawerOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError("");
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    function startEditing(workout) {
        setEditingId(workout.id);
        setForm({
            workout_date: workout.workout_date.slice(0, 10),
            body_part: workout.body_part || "",
            exercise_name: workout.exercise_name,
            sets: workout.sets,
            reps: workout.reps,
            weight: workout.weight,
        });
        setMessage("");
        setError("");
        setIsDrawerOpen(true);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.body_part) {
            setError("Choose a body part.");
            return;
        }
        setSaving(true);
        setMessage("");
        setError("");
        const workoutData = {
            workout_date: form.workout_date,
            body_part: form.body_part,
            exercise_name: form.exercise_name,
            sets: Number(form.sets),
            reps: Number(form.reps),
            weight: Number(form.weight),
        };
        try {
            await apiFetch(editingId === null ? "/workouts" : `/workouts/${editingId}`, {
                method: editingId === null ? "POST" : "PATCH",
                body: workoutData,
                token,
            });
            setMessage(editingId === null ? "Workout created successfully" : "Workout updated successfully");
            setIsDrawerOpen(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            await loadWorkouts();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);
        setMessage("");
        setError("");
        try {
            await apiFetch(`/workouts/${id}`, { method: "DELETE", token });
            setMessage("Workout deleted successfully");
            setDeleteConfirmId(null);
            await loadWorkouts();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setDeletingId(null);
        }
    }

    function toggleDate(date) {
        setExpandedDates((current) => {
            const next = new Set(current);
            if (next.has(date)) {
                next.delete(date);
            } else {
                next.add(date);
            }
            return next;
        });
    }

    const workoutGroups = Object.entries(
        workouts.reduce((groups, workout) => {
            const date = workout.workout_date.slice(0, 10);
            if (!groups[date]) groups[date] = [];
            groups[date].push(workout);
            return groups;
        }, {})
    ).sort(([firstDate], [secondDate]) => secondDate.localeCompare(firstDate));

    return (
        <section className="workouts-page" aria-labelledby="recent-workouts-title">
            <PageHeader
                eyebrow="Training"
                title="Recent"
                accent="Workouts"
                titleId="recent-workouts-title"
                action={<button className="log-workout-button" type="button" onClick={openCreateDrawer}><FiPlus aria-hidden="true" /><span>Log Workout</span></button>}
            />

            {message && <p className="workouts-notice is-success">{message}</p>}
            {!isDrawerOpen && error && <p className="workouts-notice is-error" role="alert">{error}</p>}
            {loading && (
                <div className="workouts-loading" aria-label="Loading workouts">
                    <span />
                    <span />
                    <span />
                </div>
            )}

            {!loading && !error && workouts.length === 0 && (
                <div className="workouts-empty">
                    <FiPlus aria-hidden="true" />
                    <h2>Your training log is empty</h2>
                    <p>Log your first workout to start building your history.</p>
                    <button type="button" onClick={openCreateDrawer}>Log Workout</button>
                </div>
            )}

            {!loading && workoutGroups.length > 0 && (
                <div className="workout-date-list">
                    {workoutGroups.map(([date, dateWorkouts]) => {
                        const dateParts = getDateParts(date);
                        const isExpanded = expandedDates.has(date);
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
                                className={`workout-date-card${isExpanded ? " is-expanded" : ""}`}
                                key={date}
                            >
                                <button
                                    className="workout-date-summary"
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`workout-date-${date}`}
                                >
                                    <span className="workout-date-number">{dateParts.day}</span>
                                    <span className="workout-date-copy">
                                        <strong>{dateParts.month} {dateParts.year}</strong>
                                        <small>{dateParts.weekday}</small>
                                    </span>

                                    <span className="workout-date-muscles" aria-label="Body parts trained">
                                        {bodyParts.slice(0, 4).map((bodyPart) => (
                                            <span key={bodyPart}>
                                                {BODY_PARTS[bodyPart]?.label || bodyPart}
                                            </span>
                                        ))}
                                    </span>

                                    <span className="workout-date-count">
                                        <strong>{dateWorkouts.length}</strong>
                                        <small>{dateWorkouts.length === 1 ? "exercise" : "exercises"}</small>
                                    </span>
                                    <FiChevronDown className="workout-date-chevron" aria-hidden="true" />
                                </button>

                                {isExpanded && (
                                    <div className="workout-date-details" id={`workout-date-${date}`}>
                                        {bodyPartGroups.map(([bodyPartName, bodyPartWorkouts]) => {
                                            const bodyPart = BODY_PARTS[bodyPartName];

                                            return (
                                                <section className="workout-body-group" key={bodyPartName}>
                                                    <div className="workout-entry-image">
                                                        {bodyPart ? (
                                                            <img src={bodyPart.image} alt={`${bodyPart.label} muscles`} />
                                                        ) : (
                                                            <span>W</span>
                                                        )}
                                                    </div>

                                                    <div className="workout-body-workouts">
                                                        <span className="workout-body-label">
                                                            {bodyPart?.label || "Workout"}
                                                        </span>

                                                        {bodyPartWorkouts.map((workout) => (
                                                            <article className="workout-entry" key={workout.id}>
                                                                <div className="workout-entry-copy">
                                                                    <h2>{workout.exercise_name}</h2>
                                                                    <div className="workout-metrics">
                                                                        <span><strong>{workout.sets}</strong><small>SETS</small></span>
                                                                        <span><strong>{workout.reps}</strong><small>REPS</small></span>
                                                                        <span><strong>{workout.weight}</strong><small>KG</small></span>
                                                                    </div>
                                                                </div>

                                                                <div className="workout-entry-actions">
                                                                    <button type="button" onClick={() => startEditing(workout)} aria-label={`Edit ${workout.exercise_name}`}>
                                                                        <FiEdit3 aria-hidden="true" />
                                                                    </button>

                                                                    {deleteConfirmId === workout.id ? (
                                                                        <div className="workout-delete-confirm">
                                                                            <span>Delete?</span>
                                                                            <button type="button" onClick={() => handleDelete(workout.id)} disabled={deletingId === workout.id}>
                                                                                {deletingId === workout.id ? "..." : "Yes"}
                                                                            </button>
                                                                            <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deletingId === workout.id}>No</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button className="workout-delete-button" type="button" onClick={() => setDeleteConfirmId(workout.id)} aria-label={`Delete ${workout.exercise_name}`}>
                                                                            <FiTrash2 aria-hidden="true" />
                                                                        </button>
                                                                    )}
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

            {isDrawerOpen && <WorkoutDrawer
                form={form}
                isEditing={editingId !== null}
                saving={saving}
                error={error}
                onChange={handleChange}
                onSelectBodyPart={(bodyPart) => setForm((current) => ({ ...current, body_part: bodyPart }))}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
            />}
        </section>
    );
}
