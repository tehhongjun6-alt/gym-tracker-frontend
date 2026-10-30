// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "../../api";
import Workouts from "../../pages/Workouts";

vi.mock("../../api", () => ({ apiFetch: vi.fn() }));

const workout = {
    id: 7,
    workout_date: "2026-10-25",
    body_part: "back",
    exercise_name: "Lat Pulldown",
    sets: 4,
    reps: 10,
    weight: 35,
};

function mockLoad(items = []) {
    apiFetch.mockImplementation((path, options = {}) => {
        if (path === "/workouts" && !options.method) {
            return Promise.resolve(items);
        }

        if (path === "/workouts" && options.method === "POST") {
            return Promise.resolve({ id: 8, ...options.body });
        }

        if (path === "/workouts/7" && options.method === "PATCH") {
            return Promise.resolve({ ...workout, ...options.body });
        }

        if (path === "/workouts/7" && options.method === "DELETE") {
            return Promise.resolve({ message: "Workout deleted" });
        }

        return Promise.reject(new Error(`Unexpected ${path}`));
    });
}

describe("Log Workout", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it("opens a separate drawer with six body-part cards", async () => {
        mockLoad();
        render(<Workouts token="token" />);
        await screen.findByText("Your training log is empty");

        fireEvent.click(screen.getAllByRole("button", { name: "Log Workout" })[0]);

        expect(screen.getByRole("dialog", { name: "Log Workout" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Select body part" }));
        expect(screen.getAllByRole("button", { name: /select .* body part/i })).toHaveLength(6);
    });

    it("requires and submits the selected body part", async () => {
        mockLoad();
        render(<Workouts token="token" />);
        await screen.findByText("Your training log is empty");
        fireEvent.click(screen.getAllByRole("button", { name: "Log Workout" })[0]);

        fireEvent.click(screen.getByRole("button", { name: "Choose a date" }));
        fireEvent.click(screen.getByRole("button", { name: "October 25, 2026" }));
        fireEvent.click(screen.getByRole("button", { name: "Select body part" }));
        fireEvent.click(screen.getByRole("button", { name: "Select Chest body part" }));
        fireEvent.change(screen.getByLabelText("Exercise"), { target: { value: "Bench Press" } });
        fireEvent.change(screen.getByLabelText("Sets"), { target: { value: "5" } });
        fireEvent.change(screen.getByLabelText("Reps"), { target: { value: "12" } });
        fireEvent.change(screen.getByLabelText("Weight"), { target: { value: "40" } });
        fireEvent.click(screen.getByRole("button", { name: "Save Workout" }));

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith("/workouts", {
                method: "POST",
                body: {
                    workout_date: "2026-10-25",
                    body_part: "chest",
                    exercise_name: "Bench Press",
                    sets: 5,
                    reps: 12,
                    weight: 40,
                },
                token: "token",
            });
        });
    });

    it("opens edit mode with the saved body part selected", async () => {
        mockLoad([workout]);
        render(<Workouts token="token" />);
        fireEvent.click(await screen.findByRole("button", { expanded: false }));
        fireEvent.click(await screen.findByRole("button", { name: "Edit Lat Pulldown" }));

        expect(screen.getByRole("dialog", { name: "Edit Workout" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("button", { name: "Select Back body part" })).toHaveAttribute("aria-pressed", "true");
    });

    it("deletes a workout after confirmation", async () => {
        mockLoad([workout]);
        render(<Workouts token="token" />);

        fireEvent.click(await screen.findByRole("button", { expanded: false }));
        fireEvent.click(await screen.findByRole("button", { name: "Delete Lat Pulldown" }));
        fireEvent.click(screen.getByRole("button", { name: "Yes" }));

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith("/workouts/7", {
                method: "DELETE",
                token: "token",
            });
        });
        expect(await screen.findByText("Workout deleted successfully")).toBeInTheDocument();
    });

    it("keeps the drawer open and shows API errors", async () => {
        mockLoad();
        apiFetch.mockImplementation((path, options = {}) => {
            if (path === "/workouts" && !options.method) return Promise.resolve([]);
            return Promise.reject(new Error("Unable to create workout"));
        });

        render(<Workouts token="token" />);
        await screen.findByText("Your training log is empty");
        fireEvent.click(screen.getAllByRole("button", { name: "Log Workout" })[0]);
        fireEvent.click(screen.getByRole("button", { name: "Choose a date" }));
        fireEvent.click(screen.getByRole("button", { name: "October 25, 2026" }));
        fireEvent.click(screen.getByRole("button", { name: "Select body part" }));
        fireEvent.click(screen.getByRole("button", { name: "Select Leg body part" }));
        fireEvent.change(screen.getByLabelText("Exercise"), { target: { value: "Squat" } });
        fireEvent.change(screen.getByLabelText("Sets"), { target: { value: "4" } });
        fireEvent.change(screen.getByLabelText("Reps"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Weight"), { target: { value: "50" } });
        fireEvent.click(screen.getByRole("button", { name: "Save Workout" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Unable to create workout");
        expect(screen.getByRole("dialog", { name: "Log Workout" })).toBeInTheDocument();
    });
});
