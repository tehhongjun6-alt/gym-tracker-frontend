// @vitest-environment jsdom

import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { apiFetch } from "../../api";
import Feed from "../../pages/Feed";

vi.mock("../../api", () => ({
    apiFetch: vi.fn(),
}));

vi.mock("../../supabaseStorage", () => ({
    createStorageClient: vi.fn(),
}));

const currentUser = {
    id: "user-1",
    username: "hongjun",
};

const posts = [
    {
        id: "post-1",
        author_id: "user-2",
        author: "mika",
        content: "Leg day complete.",
        visibility: "public",
        image_url: "https://example.com/leg-day.jpg",
        created_at: "2026-10-22T12:00:00.000Z",
    },
    {
        id: "post-2",
        author_id: "user-1",
        author: "hongjun",
        content: "Recovery day notes.",
        visibility: "friends-only",
        image_url: null,
        created_at: "2026-10-24T12:00:00.000Z",
    },
];

const users = [
    {
        id: "user-2",
        username: "mika",
        friendship_status: "none",
    },
];

function mockSuccessfulLoad() {
    apiFetch.mockImplementation((path, options = {}) => {
        if (path === "/whoami") {
            return Promise.resolve(currentUser);
        }

        if (path === "/posts") {
            return Promise.resolve(posts);
        }

        if (path === "/users") {
            return Promise.resolve(users);
        }

        if (
            path === "/friend-requests" &&
            options.method === "POST"
        ) {
            return Promise.resolve({ id: "request-1" });
        }

        return Promise.reject(new Error(`Unexpected ${path}`));
    });
}

describe("WESET Fit feed", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it("renders Instagram-inspired posts without unsupported actions", async () => {
        mockSuccessfulLoad();
        const { container } = render(<Feed token="token" />);

        expect(
            await screen.findByRole("region", {
                name: "WESET Fit feed",
            })
        ).toBeInTheDocument();
        expect(await screen.findAllByText("mika")).toHaveLength(2);
        expect(
            screen.getByText("Leg day complete.")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("img", {
                name: "Post by mika",
            })
        ).toHaveClass("fit-post-image");
        expect(
            container.querySelectorAll("article.fit-post")
        ).toHaveLength(2);

        expect(
            screen.queryByRole("button", { name: /like/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /comment/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /delete/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /edit/i })
        ).not.toBeInTheDocument();
    });

    it("shows friendship controls only for another user's post", async () => {
        mockSuccessfulLoad();
        render(<Feed token="token" />);

        const addFriend = await screen.findByRole("button", {
            name: "Add Friend",
        });

        expect(addFriend).toBeInTheDocument();
        expect(
            screen.getAllByRole("button", {
                name: "Add Friend",
            })
        ).toHaveLength(1);

        fireEvent.click(addFriend);

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith(
                "/friend-requests",
                {
                    method: "POST",
                    body: {
                        receiver_id: "user-2",
                    },
                    token: "token",
                }
            );
        });

        expect(
            await screen.findByRole("button", {
                name: "Requested",
            })
        ).toBeDisabled();
    });

    it("renders a useful empty state", async () => {
        apiFetch.mockImplementation((path) => {
            if (path === "/whoami") {
                return Promise.resolve(currentUser);
            }

            return Promise.resolve([]);
        });

        render(<Feed token="token" />);

        expect(
            await screen.findByText(
                "Your Fit feed is ready for its first post."
            )
        ).toBeInTheDocument();
    });

    it("renders loading and API failure states", async () => {
        let rejectRequest;
        apiFetch.mockImplementation(
            () =>
                new Promise((resolve, reject) => {
                    rejectRequest = reject;
                })
        );

        render(<Feed token="token" />);
        expect(
            screen.getByText("Loading your Fit feed...")
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledTimes(3);
        });

        rejectRequest(new Error("Feed unavailable"));

        expect(
            await screen.findByText("Feed unavailable")
        ).toBeInTheDocument();
    });

    it("opens the separate Create Post modal from navigation", async () => {
        mockSuccessfulLoad();
        render(<Feed token="token" />);
        await screen.findByRole("region", { name: "WESET Fit feed" });

        document.dispatchEvent(
            new CustomEvent("weset:open-create-post")
        );

        expect(
            await screen.findByRole("dialog", {
                name: "Create post",
            })
        ).toBeInTheDocument();
    });
});
