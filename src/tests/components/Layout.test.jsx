// @vitest-environment jsdom

import {
    fireEvent,
    render,
    screen,
} from "@testing-library/react";
import {
    MemoryRouter,
    Route,
    Routes,
} from "react-router-dom";
import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import Layout from "../../components/Layout";

function renderLayout(onLogout = vi.fn()) {
    return render(
        <MemoryRouter initialEntries={["/feed"]}>
            <Routes>
                <Route
                    element={<Layout onLogout={onLogout} />}
                >
                    <Route
                        path="/feed"
                        element={<p>Fit content</p>}
                    />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("WESET authenticated layout", () => {
    it("renders the Fit navigation with accessible icon labels", () => {
        renderLayout();

        expect(
            screen.getByRole("img", {
                name: "WESET",
            })
        ).toBeInTheDocument();

        for (const name of [
            "Fit",
            "Workouts",
            "Exercises",
            "Friends",
            "Profile",
        ]) {
            expect(
                screen.getByRole("link", { name })
            ).toBeInTheDocument();
        }

        expect(
            screen.getByRole("button", {
                name: "Create post",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: "Logout",
            })
        ).toBeInTheDocument();
    });

    it("announces post creation from the separate plus button", () => {
        const handleOpen = vi.fn();
        document.addEventListener(
            "weset:open-create-post",
            handleOpen,
            { once: true }
        );

        renderLayout();
        fireEvent.click(
            screen.getByRole("button", {
                name: "Create post",
            })
        );

        expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it("logs out from the navigation", () => {
        const onLogout = vi.fn();
        renderLayout(onLogout);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Logout",
            })
        );

        expect(onLogout).toHaveBeenCalledTimes(1);
    });
});
