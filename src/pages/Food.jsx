import { useEffect, useState } from "react";
import {
    FiChevronDown,
    FiSearch,
} from "react-icons/fi";

import { apiFetch } from "../api";
import PageHeader from "../components/PageHeader";
import "../styles/pages/Food.css";

const FOOD_TOOLS = {
    meals: {
        eyebrow: "Discover",
        title: "Healthy Meals",
        description: "Find recipes, ingredients, instructions, and cooking videos.",
    },
    calories: {
        eyebrow: "Understand",
        title: "Food Calories",
        description: "Search calories and nutrition information for everyday foods.",
    },
};

const MEAL_CATEGORIES = [
    { id: "all", label: "All", query: "a" },
    { id: "breakfast", label: "Breakfast", query: "breakfast" },
    { id: "snack", label: "Snack", query: "snack" },
    { id: "soup", label: "Soup", query: "soup" },
    { id: "pasta", label: "Pasta", query: "pasta" },
    { id: "main-course", label: "Main Course", query: "chicken" },
];

export default function Food({ token }) {
    const [activeTool, setActiveTool] = useState("meals");
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [foodQuery, setFoodQuery] = useState("");
    const [foods, setFoods] = useState([]);
    const [foodLoading, setFoodLoading] = useState(false);
    const [foodError, setFoodError] = useState("");
    const [foodSearched, setFoodSearched] = useState(false);

    const [mealQuery, setMealQuery] = useState("");
    const [meals, setMeals] = useState([]);
    const [mealLoading, setMealLoading] = useState(false);
    const [mealError, setMealError] = useState("");
    const [mealSearched, setMealSearched] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (!selectedItem) return undefined;

        function closeWithEscape(event) {
            if (event.key === "Escape") setSelectedItem(null);
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeWithEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeWithEscape);
        };
    }, [selectedItem]);

    useEffect(() => {
        runMealSearch(MEAL_CATEGORIES[0].query);
    }, [token]);

    function handleImageError(event) {
        event.currentTarget.style.display = "none";
        const card = event.currentTarget.closest(".food-result-card");

        if (card) {
            card.classList.add("is-image-missing");
        } else {
            event.currentTarget.parentElement.style.display = "none";
        }
    }

    async function handleFoodSearch(event) {
        event.preventDefault();

        if (!foodQuery.trim()) {
            setFoodError("Enter a food to search");
            return;
        }

        setFoodLoading(true);
        setFoodError("");
        setFoodSearched(true);

        try {
            const data = await apiFetch(
                `/food-calories?query=${encodeURIComponent(foodQuery.trim())}`,
                { token }
            );

            setFoods(data);
        } catch (error) {
            setFoods([]);
            setFoodError(error.message);
        } finally {
            setFoodLoading(false);
        }
    }

    async function runMealSearch(query) {
        const cleanQuery = query.trim();

        if (!cleanQuery) {
            setMealError("Enter a meal to search");
            return;
        }

        setMealLoading(true);
        setMealError("");
        setMealSearched(true);

        try {
            const data = await apiFetch(
                `/meal-ideas?search=${encodeURIComponent(cleanQuery)}`,
                { token }
            );

            const shuffledMeals = [...data];

            for (
                let index = shuffledMeals.length - 1;
                index > 0;
                index--
            ) {
                const randomIndex = Math.floor(
                    Math.random() * (index + 1)
                );

                [shuffledMeals[index], shuffledMeals[randomIndex]] =
                    [shuffledMeals[randomIndex], shuffledMeals[index]];
            }

            setMeals(shuffledMeals);
        } catch (error) {
            setMeals([]);
            setMealError(error.message);
        } finally {
            setMealLoading(false);
        }
    }

    function handleMealSearch(event) {
        event.preventDefault();
        setActiveCategory("all");
        runMealSearch(mealQuery);
    }

    function handleCategorySearch(category) {
        setActiveCategory(category.id);

        if (category.id === "all") {
            setMealQuery("");
            runMealSearch(category.query);
            return;
        }

        setMealQuery(category.query);
        runMealSearch(category.query);
    }

    function chooseTool(tool) {
        setActiveTool(tool);
        setMenuOpen(false);
    }

    return (
        <section className="food-page">
            <PageHeader
                eyebrow={FOOD_TOOLS[activeTool].eyebrow}
                title={activeTool === "meals" ? "Healthy" : "Food"}
                accent={activeTool === "meals" ? "Meals" : "Calories"}
                action={<div className="food-tool-menu-wrap">
                    <button
                        className="food-menu-button"
                        type="button"
                        aria-label="Choose food tool"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span>{activeTool === "meals" ? "Meals" : "Nutrition"}</span>
                        <FiChevronDown aria-hidden="true" />
                    </button>

                    {menuOpen && (
                        <div className="food-tool-menu">
                            <button className={activeTool === "meals" ? "is-active" : ""} type="button" onClick={() => chooseTool("meals")}>
                                <span>Healthy Meals</span>
                                <small>Recipes and cooking ideas</small>
                            </button>
                            <button className={activeTool === "calories" ? "is-active" : ""} type="button" onClick={() => chooseTool("calories")}>
                                <span>Food Calories</span>
                                <small>Calories and macros</small>
                            </button>
                        </div>
                    )}
                </div>}
            />

            {activeTool === "calories" ? (
                <section className="food-tool-section">
                    <form className="food-search-form" onSubmit={handleFoodSearch}>
                        <label className="food-visually-hidden" htmlFor="food-search">Food name</label>
                        <FiSearch aria-hidden="true" />
                        <input
                            id="food-search"
                            type="text"
                            value={foodQuery}
                            onChange={(event) => setFoodQuery(event.target.value)}
                            placeholder="Search food calories..."
                        />
                        <button type="submit" disabled={foodLoading}>
                            {foodLoading ? "Searching" : "Search"}
                        </button>
                    </form>

                    {foodError && <p className="food-status food-status-error" role="alert">{foodError}</p>}
                    {foodSearched && !foodLoading && !foodError && foods.length === 0 && (
                        <p className="food-status">No food results found.</p>
                    )}

                    <div className="food-card-grid">
                        {foods.map((food) => (
                            <button className={`food-result-card food-calorie-card${food.image_url ? "" : " is-image-missing"}`} key={food.id} type="button" onClick={() => setSelectedItem({ type: "food", data: food })}>
                                <span className="food-card-image">
                                    {food.image_url && <img src={food.image_url} alt={food.name} onError={handleImageError} />}
                                </span>
                                <span className="food-card-copy">
                                    <strong>{food.name}</strong>
                                    <small>{food.brand || "Nutrition result"}</small>
                                    <span className="food-card-meta">
                                        <span>{food.calories ?? "—"} {food.calories_unit || "kcal"}</span>
                                        <span>{food.protein ?? "—"}{food.protein_unit || "g"} protein</span>
                                    </span>
                                </span>
                                <span className="food-card-arrow">↗</span>
                            </button>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="food-tool-section">
                    <form className="food-search-form" onSubmit={handleMealSearch}>
                        <label className="food-visually-hidden" htmlFor="meal-search">Meal name</label>
                        <FiSearch aria-hidden="true" />
                        <input
                            id="meal-search"
                            type="text"
                            value={mealQuery}
                            onChange={(event) => setMealQuery(event.target.value)}
                            placeholder="Search healthy meals..."
                        />
                        <button type="submit" disabled={mealLoading}>
                            {mealLoading ? "Searching" : "Search"}
                        </button>
                    </form>

                    <div className="meal-category-strip" aria-label="Meal categories">
                        {MEAL_CATEGORIES.map((category) => (
                            <button
                                className={activeCategory === category.id ? "is-active" : ""}
                                key={category.id}
                                type="button"
                                onClick={() => handleCategorySearch(category)}
                                disabled={mealLoading}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {mealError && <p className="food-status food-status-error" role="alert">{mealError}</p>}
                    {mealSearched && !mealLoading && !mealError && meals.length === 0 && (
                        <p className="food-status">No meal results found.</p>
                    )}

                    <div className="food-card-grid">
                        {meals.map((meal) => (
                            <button className="food-result-card food-meal-card" key={meal.id} type="button" onClick={() => setSelectedItem({ type: "meal", data: meal })}>
                                <span className="food-card-image"><img src={meal.image_url} alt={meal.name} onError={handleImageError} /></span>
                                <span className="food-card-copy">
                                    <strong>{meal.name}</strong>
                                    <small>{meal.country || "Meal idea"}</small>
                                    <span className="food-card-meta">
                                        <span>{meal.category || "Recipe"}</span>
                                        <span>{meal.ingredients.length} ingredients</span>
                                    </span>
                                </span>
                                <span className="food-card-arrow">↗</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {selectedItem && (
                <div className="food-detail-backdrop" role="presentation" onClick={() => setSelectedItem(null)}>
                    <article className={`food-detail-panel food-detail-${selectedItem.type}`} role="dialog" aria-modal="true" aria-labelledby="food-detail-title" onClick={(event) => event.stopPropagation()}>
                        <button className="food-detail-close" type="button" aria-label="Close details" onClick={() => setSelectedItem(null)}>×</button>
                        <div className="food-detail-content">
                            <h2 id="food-detail-title">{selectedItem.data.name}</h2>
                            <p className="food-detail-summary">
                                {selectedItem.type === "food"
                                    ? selectedItem.data.brand || "Nutrition result"
                                    : `${selectedItem.data.category} · ${selectedItem.data.country}`}
                            </p>

                            {selectedItem.data.image_url && (
                                <div className="food-detail-image">
                                    <img src={selectedItem.data.image_url} alt={selectedItem.data.name} onError={handleImageError} />
                                </div>
                            )}

                            {selectedItem.type === "food" ? (
                                <>
                                    <h3>Nutrition</h3>
                                    <div className="nutrition-grid">
                                        <span><small>Serving</small><strong>{selectedItem.data.serving_size} {selectedItem.data.serving_unit}</strong></span>
                                        <span><small>Calories</small><strong>{selectedItem.data.calories} {selectedItem.data.calories_unit}</strong></span>
                                        <span><small>Protein</small><strong>{selectedItem.data.protein} {selectedItem.data.protein_unit}</strong></span>
                                        <span><small>Carbs</small><strong>{selectedItem.data.carbohydrates} {selectedItem.data.carbohydrates_unit}</strong></span>
                                        <span><small>Fat</small><strong>{selectedItem.data.fat} {selectedItem.data.fat_unit}</strong></span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>Ingredients</h3>
                                    <ul className="ingredient-list">
                                        {selectedItem.data.ingredients.map((ingredient, index) => (
                                            <li key={`${selectedItem.data.id}-${ingredient.name}-${index}`}><span>{ingredient.name}</span><strong>{ingredient.measure}</strong></li>
                                        ))}
                                    </ul>
                                    <h3>Instructions</h3>
                                    <p className="meal-instructions">{selectedItem.data.instructions}</p>
                                    {selectedItem.data.video_url && <a className="meal-video-link" href={selectedItem.data.video_url} target="_blank" rel="noreferrer">Watch cooking video ↗</a>}
                                </>
                            )}
                        </div>
                    </article>
                </div>
            )}
        </section>
    );
}
