import { useState } from "react";

import { apiFetch } from "../api";

export default function Exercises({ token }) {
    const [name, setName] = useState("");
    const [muscle, setMuscle] = useState("");
    const [type, setType] = useState("");
    const [difficulty, setDifficulty] =
        useState("");

    const [exercises, setExercises] =
        useState([]);
    const [exerciseImages, setExerciseImages] =
        useState([]);

    const [loading, setLoading] =
        useState(false);
    const [hasSearched, setHasSearched] =
        useState(false);

    const [exerciseError, setExerciseError] =
        useState("");
    const [imageError, setImageError] =
        useState("");

    function getEquipment(exercise) {
        // API Ninjas 现在返回 equipments 数组
        if (Array.isArray(exercise.equipments)) {
            return exercise.equipments.join(", ");
        }

        // 兼容旧版的 equipment 字段
        if (exercise.equipment) {
            return exercise.equipment;
        }

        return "Not provided";
    }

    async function handleSearch(event) {
        event.preventDefault();

        const filters = [];

        if (name.trim()) {
            filters.push(
                `name=${encodeURIComponent(
                    name.trim()
                )}`
            );
        }

        if (muscle) {
            filters.push(
                `muscle=${encodeURIComponent(muscle)}`
            );
        }

        if (type) {
            filters.push(
                `type=${encodeURIComponent(type)}`
            );
        }

        if (difficulty) {
            filters.push(
                `difficulty=${encodeURIComponent(
                    difficulty
                )}`
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

        // 搜索 API Ninjas 的文字资料
        try {
            const exerciseData = await apiFetch(
                `/exercise-suggestions?${query}`,
                {
                    token,
                }
            );

            setExercises(exerciseData);
        } catch (error) {
            setExerciseError(error.message);
        }

        // 搜索 free-exercise-db 的图片资料
        // 即使 API Ninjas 失败，这部分仍然会继续
        try {
            const imageData = await apiFetch(
                `/exercise-images?${query}`,
                {
                    token,
                }
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
    }

    return (
        <section>
            <h2>Exercise Suggestions</h2>

            <p>
                Search for exercise information and
                example images.
            </p>

            <form onSubmit={handleSearch}>
                <div>
                    <label htmlFor="exercise-name">
                        Exercise name
                    </label>

                    <input
                        id="exercise-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Example: bench press"
                    />
                </div>

                <div>
                    <label htmlFor="muscle">
                        Muscle
                    </label>

                    <select
                        id="muscle"
                        value={muscle}
                        onChange={(event) =>
                            setMuscle(event.target.value)
                        }
                    >
                        <option value="">
                            All muscles
                        </option>

                        <option value="abdominals">
                            Abdominals
                        </option>

                        <option value="biceps">
                            Biceps
                        </option>

                        <option value="calves">
                            Calves
                        </option>

                        <option value="chest">
                            Chest
                        </option>

                        <option value="forearms">
                            Forearms
                        </option>

                        <option value="glutes">
                            Glutes
                        </option>

                        <option value="hamstrings">
                            Hamstrings
                        </option>

                        <option value="lats">
                            Lats
                        </option>

                        <option value="lower_back">
                            Lower back
                        </option>

                        <option value="middle_back">
                            Middle back
                        </option>

                        <option value="quadriceps">
                            Quadriceps
                        </option>

                        <option value="traps">
                            Traps
                        </option>

                        <option value="triceps">
                            Triceps
                        </option>
                    </select>
                </div>

                <div>
                    <label htmlFor="exercise-type">
                        Exercise type
                    </label>

                    <select
                        id="exercise-type"
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value)
                        }
                    >
                        <option value="">
                            All types
                        </option>

                        <option value="cardio">
                            Cardio
                        </option>

                        <option value="olympic_weightlifting">
                            Olympic weightlifting
                        </option>

                        <option value="plyometrics">
                            Plyometrics
                        </option>

                        <option value="powerlifting">
                            Powerlifting
                        </option>

                        <option value="strength">
                            Strength
                        </option>

                        <option value="stretching">
                            Stretching
                        </option>

                        <option value="strongman">
                            Strongman
                        </option>
                    </select>
                </div>

                <div>
                    <label htmlFor="difficulty">
                        Difficulty
                    </label>

                    <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(event) =>
                            setDifficulty(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All difficulties
                        </option>

                        <option value="beginner">
                            Beginner
                        </option>

                        <option value="intermediate">
                            Intermediate
                        </option>

                        <option value="expert">
                            Expert
                        </option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Searching..."
                        : "Search"}
                </button>

                <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                >
                    Clear
                </button>
            </form>

            {loading && (
                <p>
                    Loading exercise information and
                    images...
                </p>
            )}

            {hasSearched && !loading && (
                <div>
                    <hr />

                    <section>
                        <h3>
                            Exercise Images
                        </h3>

                        <p>
                            Exercises with images are shown
                            first. Images are provided by
                            free-exercise-db.
                        </p>

                        {imageError && (
                            <p>{imageError}</p>
                        )}

                        {!imageError &&
                            exerciseImages.length === 0 && (
                                <p>
                                    No exercise images found.
                                </p>
                            )}

                        {!imageError &&
                            exerciseImages.map(
                                (exercise) => (
                                    <article
                                        key={exercise.id}
                                    >
                                        <h4>
                                            {exercise.name}
                                        </h4>

                                        <p>
                                            Category:{" "}
                                            {
                                                exercise.category
                                            }
                                        </p>

                                        <p>
                                            Level:{" "}
                                            {exercise.level}
                                        </p>

                                        <p>
                                            Equipment:{" "}
                                            {exercise.equipment ||
                                                "Not provided"}
                                        </p>

                                        <p>
                                            Primary muscles:{" "}
                                            {exercise.primaryMuscles.join(
                                                ", "
                                            )}
                                        </p>

                                        <div>
                                            {exercise.images.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <img
                                                        key={image}
                                                        src={image}
                                                        alt={`${exercise.name} step ${index + 1}`}
                                                        width="300"
                                                    />
                                                )
                                            )}
                                        </div>

                                        <h5>
                                            Instructions
                                        </h5>

                                        <ol>
                                            {exercise.instructions.map(
                                                (
                                                    instruction,
                                                    index
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            instruction
                                                        }
                                                    </li>
                                                )
                                            )}
                                        </ol>

                                        <hr />
                                    </article>
                                )
                            )}

                        <p>
                            Image source:{" "}
                            <a
                                href="https://github.com/yuhonas/free-exercise-db"
                                target="_blank"
                                rel="noreferrer"
                            >
                                free-exercise-db
                            </a>
                        </p>
                    </section>

                    <section>
                        <h3>
                            More Exercise Information
                        </h3>

                        <p>
                            Additional text results provided
                            by API Ninjas.
                        </p>

                        {exerciseError && (
                            <p>{exerciseError}</p>
                        )}

                        {!exerciseError &&
                            exercises.length === 0 && (
                                <p>
                                    No additional exercise
                                    information found.
                                </p>
                            )}

                        {!exerciseError &&
                            exercises.map(
                                (exercise, index) => (
                                    <article
                                        key={`${exercise.name}-${index}`}
                                    >
                                        <h4>
                                            {exercise.name}
                                        </h4>

                                        <p>
                                            Type:{" "}
                                            {exercise.type}
                                        </p>

                                        <p>
                                            Muscle:{" "}
                                            {exercise.muscle}
                                        </p>

                                        <p>
                                            Equipment:{" "}
                                            {getEquipment(
                                                exercise
                                            )}
                                        </p>

                                        <p>
                                            Difficulty:{" "}
                                            {
                                                exercise.difficulty
                                            }
                                        </p>

                                        <p>
                                            Instructions:{" "}
                                            {
                                                exercise.instructions
                                            }
                                        </p>

                                        {exercise.safety_info && (
                                            <p>
                                                Safety:{" "}
                                                {
                                                    exercise.safety_info
                                                }
                                            </p>
                                        )}

                                        <hr />
                                    </article>
                                )
                            )}
                    </section>
                </div>
            )}
        </section>
    );
}
