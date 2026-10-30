// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Login from "../../pages/Login";

function renderLogin() {
    return render(
        <MemoryRouter>
            <Login onLogin={() => {}} />
        </MemoryRouter>
    );
}

describe("WESET login page", () => {
    it("renders the selected brand and login form", () => {
        renderLogin();

        expect(
            screen.getByRole("img", {
                name: "WESET social connection logo",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText("Train. Share. Together.")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "Welcome back",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText("Email address")
        ).toBeRequired();
        expect(
            screen.getByLabelText("Password")
        ).toBeRequired();
    });

    it("offers Google sign-in and removes Facebook", () => {
        renderLogin();

        const googleButton = screen.getByRole("button", {
            name: /continue with google/i,
        });

        expect(googleButton).toHaveAttribute("type", "button");
        expect(googleButton).toBeEnabled();
        expect(
            screen.queryByText(/facebook/i)
        ).not.toBeInTheDocument();
    });

    it("renders the three-step WESET feature story", () => {
        const { container } = renderLogin();

        expect(
            container.querySelector(".feature-blend")
        ).toHaveAttribute("aria-hidden", "true");

        expect(
            screen.getByRole("img", { name: "Athlete tracking a strength workout" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: "Training partners learning an exercise" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: "Friends sharing an active journey" })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Track Every Workout And See Your Progress")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Discover New Exercises And Train With Confidence")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Share Your Journey And Grow Stronger Together")
        ).toBeInTheDocument();
    });
});
