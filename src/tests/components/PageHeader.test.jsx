// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageHeader from "../../components/PageHeader";

describe("PageHeader", () => {
    it("renders shared branded copy and an optional page action", () => {
        render(
            <PageHeader
                eyebrow="TRAINING"
                title="Recent"
                accent="Workouts"
                titleId="recent-workouts-title"
                action={<button type="button">Log Workout</button>}
            />
        );

        expect(screen.getByText("TRAINING")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Recent Workouts" })).toHaveAttribute("id", "recent-workouts-title");
        expect(screen.getByRole("button", { name: "Log Workout" })).toBeInTheDocument();
    });
});
