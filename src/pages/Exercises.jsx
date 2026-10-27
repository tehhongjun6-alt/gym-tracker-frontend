import { useEffect, useRef, useState } from "react";
import {
    FiArrowUpRight,
    FiCheck,
    FiChevronDown,
    FiImage,
    FiSearch,
    FiX,
} from "react-icons/fi";

import { apiFetch } from "../api";
import PageHeader from "../components/PageHeader";
import "./Exercises.css";

const muscleOptions = [
    "abdominals", "biceps", "calves", "chest",
    "forearms", "glutes", "hamstrings", "lats",
    "lower_back", "middle_back", "quadriceps",
    "traps", "triceps",
];

const typeOptions = [
    "cardio", "olympic_weightlifting", "plyometrics",
    "powerlifting", "strength", "stretching", "strongman",
];

function formatLabel(value) {
    if (!value) return "Not provided";
    return value.replaceAll("_", " ");
}

function normalizeName(value) {
    return value?.trim().toLowerCase() || "";
}

function getEquipment(exercise) {
    if (Array.isArray(exercise.equipments)) {
        return exercise.equipments.join(", ");
    }

    return exercise.equipment || "Not provided";
}

function getInstructions(exercise) {
    if (Array.isArray(exercise.instructions)) {
        return exercise.instructions;
    }

    if (exercise.instructions) {
        return [exercise.instructions];
    }

    return ["Instructions are not available for this exercise."];
}

function ExerciseFilterSelect({ label, value, options, placeholder, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const selectedLabel = value ? formatLabel(value) : placeholder;

    useEffect(() => {
        function closeDropdown(event) {
            if (!selectRef.current?.contains(event.target)) setIsOpen(false);
        }

        function closeWithEscape(event) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("pointerdown", closeDropdown);
        document.addEventListener("keydown", closeWithEscape);
        return () => {
            document.removeEventListener("pointerdown", closeDropdown);
            document.removeEventListener("keydown", closeWithEscape);
        };
    }, []);

    return (
        <div className="exercise-filter-field" ref={selectRef}>
            <span>{label}</span>
            <button className="exercise-filter-trigger" type="button" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
                <span>{selectedLabel}</span>
                <FiChevronDown aria-hidden="true" />
            </button>
            {isOpen && <div className="exercise-filter-menu" role="listbox" aria-label={label}>
                <button className={!value ? "is-selected" : ""} type="button" role="option" aria-selected={!value} onClick={() => { onChange(""); setIsOpen(false); }}>
                    <span>{placeholder}</span>{!value && <FiCheck aria-hidden="true" />}
                </button>
                {options.map((option) => <button className={value === option ? "is-selected" : ""} type="button" role="option" aria-selected={value === option} key={option} onClick={() => { onChange(option); setIsOpen(false); }}>
                    <span>{formatLabel(option)}</span>{value === option && <FiCheck aria-hidden="true" />}
                </button>)}
            </div>}
        </div>
    );
}

export default function Exercises({ token }) {
    const [name, setName] = useState("");
    const [muscle, setMuscle] = useState("");
    const [type, setType] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [exercises, setExercises] = useState([]);
    const [exerciseImages, setExerciseImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [exerciseError, setExerciseError] = useState("");
    const [imageError, setImageError] = useState("");
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        if (!selectedExercise) return undefined;

        function closeWithEscape(event) {
            if (event.key === "Escape") {
                setSelectedExercise(null);
            }
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeWithEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeWithEscape);
        };
    }, [selectedExercise]);

    async function handleSearch(event) {
        event.preventDefault();
        const filters = [];

        if (name.trim()) {
            filters.push("name=" + encodeURIComponent(name.trim()));
        }
        if (muscle) {
            filters.push("muscle=" + encodeURIComponent(muscle));
        }
        if (type) {
            filters.push("type=" + encodeURIComponent(type));
        }
        if (difficulty) {
            filters.push(
                "difficulty=" + encodeURIComponent(difficulty)
            );
        }

        if (filters.length === 0) {
            setExerciseError(
                "Please enter or select at least one search condition."
            );
            setImageError("");
            return;
        }

        const query = filters.join("&");
        setLoading(true);
        setHasSearched(true);
        setExercises([]);
        setExerciseImages([]);
        setExerciseError("");
        setImageError("");

        try {
            const exerciseData = await apiFetch(
                "/exercise-suggestions?" + query,
                { token }
            );
            setExercises(exerciseData);
        } catch (error) {
            setExerciseError(error.message);
        }

        try {
            const imageData = await apiFetch(
                "/exercise-images?" + query,
                { token }
            );
            setExerciseImages(imageData);
        } catch (error) {
            setImageError(error.message);
        }

        setLoading(false);
    }

    function handleClear() {
        setName("");
        setMuscle("");
        setType("");
        setDifficulty("");
        setExercises([]);
        setExerciseImages([]);
        setHasSearched(false);
        setExerciseError("");
        setImageError("");
        setSelectedExercise(null);
    }

    const imageExerciseNames = new Set(
        exerciseImages.map((exercise) =>
            normalizeName(exercise.name)
        )
    );

    const resultCards = [
        ...exerciseImages.map((exercise) => {
            const matchingExercise = exercises.find(
                (item) =>
                    normalizeName(item.name) ===
                    normalizeName(exercise.name)
            );

            return {
                ...exercise,
                cardId: "image-" + exercise.id,
                images: exercise.images || [],
                type: exercise.category,
                difficulty: exercise.level,
                muscle:
                    exercise.primaryMuscles?.join(", ") ||
                    "Not provided",
                equipment:
                    exercise.equipment || "Not provided",
                safety_info: matchingExercise?.safety_info,
            };
        }),
        ...exercises
            .filter(
                (exercise) =>
                    !imageExerciseNames.has(
                        normalizeName(exercise.name)
                    )
            )
            .map((exercise, index) => ({
                ...exercise,
                cardId:
                    "info-" +
                    normalizeName(exercise.name) +
                    "-" +
                    index,
                images: [],
                equipment: getEquipment(exercise),
            })),
    ];

    return (
        <section className="exercises-page">
            <PageHeader
                eyebrow="Discover"
                title="Exercise"
                accent="Library"
            />

            <form
                className="exercise-search-panel"
                onSubmit={handleSearch}
            >
                <label
                    className="exercise-name-field"
                    htmlFor="exercise-name"
                >
                    <span>Exercise name</span>
                    <div className="exercise-search-input">
                        <FiSearch aria-hidden="true" />
                        <input
                            id="exercise-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Try bench press"
                        />
                    </div>
                </label>

                <ExerciseFilterSelect label="Muscle" value={muscle} options={muscleOptions} placeholder="All muscles" onChange={setMuscle} />

                <ExerciseFilterSelect label="Type" value={type} options={typeOptions} placeholder="All types" onChange={setType} />

                <ExerciseFilterSelect label="Difficulty" value={difficulty} options={["beginner", "intermediate", "expert"]} placeholder="All levels" onChange={setDifficulty} />

                <div className="exercise-search-actions">
                    <button
                        className="exercise-search-button"
                        type="submit"
                        disabled={loading}
                    >
                        <FiSearch aria-hidden="true" />
                        {loading ? "Searching" : "Search"}
                    </button>
                    <button
                        className="exercise-clear-button"
                        type="button"
                        onClick={handleClear}
                        disabled={loading}
                    >
                        Clear
                    </button>
                </div>
            </form>

            <div
                className="exercise-results"
                aria-live="polite"
            >
                {loading && (
                    <div
                        className="exercise-card-grid"
                        aria-label="Loading exercises"
                    >
                        {[1, 2, 3].map((item) => (
                            <div
                                className="exercise-card-skeleton"
                                key={item}
                            />
                        ))}
                    </div>
                )}

                {!loading &&
                    (exerciseError || imageError) && (
                        <div className="exercise-alert">
                            <strong>
                                Some results could not be loaded.
                            </strong>
                            <span>
                                {exerciseError || imageError}
                            </span>
                        </div>
                    )}

                {!loading && !hasSearched && (
                    <div className="exercise-empty-state">
                        <div>
                            <FiSearch aria-hidden="true" />
                        </div>
                        <h2>Find an exercise</h2>
                        <p>
                            Search by name, muscle group,
                            training type, or difficulty.
                        </p>
                    </div>
                )}

                {!loading &&
                    hasSearched &&
                    resultCards.length === 0 && (
                        <div className="exercise-empty-state">
                            <div>
                                <FiImage aria-hidden="true" />
                            </div>
                            <h2>No exercises found</h2>
                            <p>
                                Try removing one filter or
                                using a broader exercise name.
                            </p>
                        </div>
                    )}

                {!loading && resultCards.length > 0 && (
                    <>
                        <div className="exercise-results-header">
                            <div>
                                <span>
                                    {resultCards.length} MOVEMENTS
                                </span>
                                <h2>Movement index</h2>
                            </div>
                        </div>

                        <div className="exercise-card-grid">
                            {resultCards.map((exercise) => (
                                <article
                                    className="exercise-card"
                                    key={exercise.cardId}
                                    role="button"
                                    tabIndex="0"
                                    onClick={() =>
                                        setSelectedExercise(exercise)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {
                                            event.preventDefault();
                                            setSelectedExercise(
                                                exercise
                                            );
                                        }
                                    }}
                                >
                                    <div className="exercise-card-media">
                                        {exercise.images[0] ? (
                                            <img
                                                src={exercise.images[0]}
                                                alt={
                                                    exercise.name +
                                                    " demonstration"
                                                }
                                            />
                                        ) : (
                                            <div className="exercise-image-placeholder">
                                                <FiImage aria-hidden="true" />
                                                <span>Movement guide</span>
                                            </div>
                                        )}
                                        <span
                                            className={
                                                "exercise-level is-" +
                                                (exercise.difficulty ||
                                                    "unknown")
                                            }
                                        >
                                            {formatLabel(
                                                exercise.difficulty
                                            )}
                                        </span>
                                    </div>

                                    <div className="exercise-card-content">
                                        <span className="exercise-card-type">
                                            {formatLabel(exercise.type)}
                                        </span>
                                        <h3>{exercise.name}</h3>
                                        <div className="exercise-card-meta">
                                            <span>
                                                {formatLabel(
                                                    exercise.muscle
                                                )}
                                                <b aria-hidden="true">·</b>
                                                {formatLabel(
                                                    exercise.equipment
                                                )}
                                            </span>
                                        </div>
                                        <span className="exercise-view-link">
                                            DETAILS
                                            <FiArrowUpRight aria-hidden="true" />
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {selectedExercise && (
                <div
                    className="exercise-modal-backdrop"
                    role="presentation"
                    onMouseDown={() =>
                        setSelectedExercise(null)
                    }
                >
                    <section
                        className="exercise-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="exercise-modal-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            className="exercise-modal-close"
                            type="button"
                            onClick={() =>
                                setSelectedExercise(null)
                            }
                            aria-label="Close exercise details"
                        >
                            <FiX aria-hidden="true" />
                        </button>

                        <div className="exercise-modal-heading">
                            <span>
                                {formatLabel(selectedExercise.type)}
                            </span>
                            <h2 id="exercise-modal-title">
                                {selectedExercise.name}
                            </h2>
                            <div>
                                <span>
                                    {formatLabel(
                                        selectedExercise.difficulty
                                    )}
                                </span>
                                <span>
                                    {formatLabel(
                                        selectedExercise.muscle
                                    )}
                                </span>
                                <span>
                                    {formatLabel(
                                        selectedExercise.equipment
                                    )}
                                </span>
                            </div>
                        </div>

                        {selectedExercise.images.length > 0 && (
                            <div className="exercise-modal-images">
                                {selectedExercise.images.map(
                                    (image, index) => (
                                        <img
                                            key={image}
                                            src={image}
                                            alt={
                                                selectedExercise.name +
                                                " step " +
                                                (index + 1)
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                        <div className="exercise-instructions">
                            <h3>How to perform</h3>
                            <ol>
                                {getInstructions(
                                    selectedExercise
                                ).map((instruction, index) => (
                                    <li
                                        key={
                                            instruction +
                                            "-" +
                                            index
                                        }
                                    >
                                        <span>
                                            {String(index + 1).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>
                                        <p>{instruction}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {selectedExercise.safety_info && (
                            <div className="exercise-safety-note">
                                <strong>Safety note</strong>
                                <p>
                                    {selectedExercise.safety_info}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}
