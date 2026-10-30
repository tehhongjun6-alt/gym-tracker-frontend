// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Signup from "../../pages/Signup";

function renderSignup() {
    return render(
        <MemoryRouter>
            <Signup onLogin={() => {}} />
        </MemoryRouter>
    );
}

describe("WESET signup page", () => {
    it("renders the approved brand and complete signup form", () => {
        renderSignup();

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
                name: "Create your account",
            })
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeRequired();
        expect(screen.getByLabelText("Email address")).toBeRequired();
        expect(screen.getByLabelText("Password")).toHaveAttribute(
            "minLength",
            "6"
        );
    });

    it("keeps Google visual-only and links existing users to login", () => {
        renderSignup();

        const googleButton = screen.getByRole("button", {
            name: /continue with google/i,
        });

        expect(googleButton).toHaveAttribute("type", "button");
        expect(googleButton).toBeDisabled();
        expect(
            screen.getAllByRole("link", { name: /login/i })[0]
        ).toHaveAttribute("href", "/login");
    });
});
