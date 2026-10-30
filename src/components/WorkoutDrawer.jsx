import { useEffect, useState } from "react";
import { FiActivity, FiCalendar, FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

import armImage from "../assets/muscle-arm.png";
import backImage from "../assets/muscle-back.png";
import chestImage from "../assets/muscle-chest.png";
import coreImage from "../assets/muscle-core.png";
import legImage from "../assets/muscle-leg.png";
import shoulderImage from "../assets/muscle-shoulder.png";
import "../styles/components/WorkoutDrawer.css";

const BODY_PARTS = [
    { value: "chest", label: "Chest", image: chestImage },
    { value: "shoulder", label: "Shoulder", image: shoulderImage },
    { value: "arm", label: "Arm", image: armImage },
    { value: "leg", label: "Leg", image: legImage },
    { value: "core", label: "Core", image: coreImage },
    { value: "back", label: "Back", image: backImage },
];

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dateFromValue(value) {
    if (!value) return new Date();
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function dateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function displayDate(value) {
    if (!value) return "Choose a date";
    return dateFromValue(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function WorkoutDrawer({ form, isEditing, saving, error, onChange, onSelectBodyPart, onClose, onSubmit }) {
    const [showBodyParts, setShowBodyParts] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => dateFromValue(form.workout_date));
    const selected = BODY_PARTS.find((part) => part.value === form.body_part);
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1 - monthStart.getDay());
    const calendarDays = Array.from({ length: 42 }, (_, index) => {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + index);
        return day;
    });

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        function handleKeyDown(event) {
            if (event.key === "Escape" && !saving) onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, saving]);

    return (
        <div className="workout-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
            <aside className="workout-drawer" role="dialog" aria-modal="true" aria-labelledby="workout-drawer-title">
                <header className="workout-drawer-header">
                    <div><span className="workout-drawer-kicker">WESET TRAINING</span><h2 id="workout-drawer-title">{isEditing ? "Edit Workout" : "Log Workout"}</h2></div>
                    <button className="workout-close-button" type="button" onClick={onClose} disabled={saving} aria-label="Close Log Workout"><FiX aria-hidden="true" /></button>
                </header>

                <form className="workout-form" onSubmit={onSubmit}>
                    <div className="workout-field workout-date-field">
                        <span>Workout Date</span>
                        <button className="workout-input-shell workout-date-trigger" type="button" onClick={() => { setShowCalendar((current) => !current); setShowBodyParts(false); }} aria-expanded={showCalendar}>
                            <span className="workout-field-icon"><FiCalendar aria-hidden="true" /></span>
                            <span className={form.workout_date ? "" : "is-placeholder"}>{displayDate(form.workout_date)}</span>
                            <FiChevronDown className="workout-field-chevron" aria-hidden="true" />
                        </button>
                        <input type="hidden" id="workout_date" name="workout_date" value={form.workout_date} />
                        {showCalendar && <div className="workout-calendar">
                            <div className="workout-calendar-header">
                                <div><small>SELECT DATE</small><strong>{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong></div>
                                <div className="workout-calendar-controls">
                                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} aria-label="Previous month"><FiChevronLeft /></button>
                                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} aria-label="Next month"><FiChevronRight /></button>
                                </div>
                            </div>
                            <div className="workout-calendar-weekdays">{WEEK_DAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
                            <div className="workout-calendar-days">
                                {calendarDays.map((day) => {
                                    const value = dateValue(day);
                                    const isOutside = day.getMonth() !== calendarMonth.getMonth();
                                    const isSelected = value === form.workout_date;
                                    const isToday = value === dateValue(new Date());
                                    return <button className={`${isOutside ? "is-outside " : ""}${isSelected ? "is-selected " : ""}${isToday ? "is-today" : ""}`} type="button" key={value} onClick={() => {
                                        onChange({ target: { name: "workout_date", value } });
                                        setCalendarMonth(day);
                                        setShowCalendar(false);
                                    }} aria-label={day.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} aria-pressed={isSelected}>{day.getDate()}</button>;
                                })}
                            </div>
                        </div>}
                    </div>

                    <div className="workout-field">
                        <span>Body Part</span>
                        <button className="workout-body-trigger" type="button" onClick={() => { setShowBodyParts((current) => !current); setShowCalendar(false); }} aria-expanded={showBodyParts}>
                            <span className="workout-body-trigger-copy">{selected && <img src={selected.image} alt="" />}<span>{selected ? selected.label : "Select body part"}</span></span><FiChevronDown aria-hidden="true" />
                        </button>
                        {showBodyParts && <div className="workout-body-grid">
                            {BODY_PARTS.map((part) => <button className={`workout-body-card${form.body_part === part.value ? " is-selected" : ""}`} type="button" key={part.value} onClick={() => { onSelectBodyPart(part.value); setShowBodyParts(false); }} aria-label={`Select ${part.label} body part`} aria-pressed={form.body_part === part.value}>
                                <span className="workout-body-image"><img src={part.image} alt="" /></span><strong>{part.label}</strong>{form.body_part === part.value && <FiCheck className="workout-body-check" aria-hidden="true" />}
                            </button>)}
                        </div>}
                    </div>

                    <label className="workout-field" htmlFor="exercise_name"><span>Exercise</span><span className="workout-input-shell workout-exercise-shell"><span className="workout-field-icon"><FiActivity aria-hidden="true" /></span><input id="exercise_name" name="exercise_name" type="text" value={form.exercise_name} onChange={onChange} placeholder="Name your movement" required /></span></label>

                    <div className="workout-number-grid">
                        <label className="workout-field" htmlFor="sets"><span>Sets</span><input id="sets" name="sets" type="number" min="1" step="1" value={form.sets} onChange={onChange} required /></label>
                        <label className="workout-field" htmlFor="reps"><span>Reps</span><input id="reps" name="reps" type="number" min="1" step="1" value={form.reps} onChange={onChange} required /></label>
                        <label className="workout-field" htmlFor="weight"><span>Weight</span><span className="workout-weight-shell"><input id="weight" name="weight" type="number" min="0" max="99999.99" step="0.01" value={form.weight} onChange={onChange} aria-label="Weight" required /><small aria-hidden="true">KG</small></span></label>
                    </div>

                    {error && <p className="workout-form-error" role="alert">{error}</p>}
                    <button className="workout-save-button" type="submit" disabled={saving || !form.body_part}>{saving ? "Saving..." : isEditing ? "Update Workout" : "Save Workout"}</button>
                </form>
            </aside>
        </div>
    );
}
