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
import { createStorageClient } from "../../supabaseStorage";
import CreatePostModal from "../../components/CreatePostModal";

vi.mock("../../api", () => ({
    apiFetch: vi.fn(),
}));

vi.mock("../../supabaseStorage", () => ({
    createStorageClient: vi.fn(),
}));

const defaultProps = {
    token: "token",
    currentUser: {
        id: "user-1",
        username: "hongjun",
    },
    isOpen: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
};

describe("CreatePostModal", () => {
    beforeEach(() => {
        apiFetch.mockReset();
        createStorageClient.mockReset();
        defaultProps.onClose.mockReset();
        defaultProps.onCreated.mockReset();
    });

    it("renders nothing while closed", () => {
        render(
            <CreatePostModal
                {...defaultProps}
                isOpen={false}
            />
        );

        expect(
            screen.queryByRole("dialog")
        ).not.toBeInTheDocument();
    });

    it("shows the post fields and cancels without saving", () => {
        render(<CreatePostModal {...defaultProps} />);

        expect(
            screen.getByRole("dialog", {
                name: "Create post",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText("Post content")
        ).toBeRequired();
        expect(
            screen.getByLabelText("Who can see this?")
        ).toHaveValue("public");

        fireEvent.click(
            screen.getByRole("button", { name: "Cancel" })
        );
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("rejects files larger than 2 MB", () => {
        render(<CreatePostModal {...defaultProps} />);

        const largeFile = new File(
            [new Uint8Array(2 * 1024 * 1024 + 1)],
            "large.jpg",
            { type: "image/jpeg" }
        );

        fireEvent.change(
            screen.getByLabelText("Add one gym photo"),
            {
                target: {
                    files: [largeFile],
                },
            }
        );

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("2 MB or smaller");
    });

    it("creates a text post and closes after success", async () => {
        apiFetch.mockResolvedValue({ id: "post-3" });
        render(<CreatePostModal {...defaultProps} />);

        fireEvent.change(
            screen.getByLabelText("Post content"),
            {
                target: {
                    value: "A strong session today.",
                },
            }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Share post" })
        );

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith(
                "/posts",
                {
                    method: "POST",
                    body: {
                        content: "A strong session today.",
                        visibility: "public",
                    },
                    token: "token",
                }
            );
        });
        expect(defaultProps.onCreated).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("uploads one valid image before creating the post", async () => {
        const upload = vi.fn().mockResolvedValue({ error: null });
        createStorageClient.mockReturnValue({
            storage: {
                from: vi.fn().mockReturnValue({ upload }),
            },
        });
        apiFetch.mockResolvedValue({ id: "post-4" });

        render(<CreatePostModal {...defaultProps} />);

        const photo = new File(["photo"], "session.png", {
            type: "image/png",
        });
        fireEvent.change(
            screen.getByLabelText("Post content"),
            { target: { value: "New PR." } }
        );
        fireEvent.change(
            screen.getByLabelText("Add one gym photo"),
            { target: { files: [photo] } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Share post" })
        );

        await waitFor(() => {
            expect(upload).toHaveBeenCalledTimes(1);
            expect(apiFetch).toHaveBeenCalledWith(
                "/posts",
                expect.objectContaining({
                    body: expect.objectContaining({
                        image_path: expect.stringContaining(
                            "user-1/"
                        ),
                    }),
                })
            );
        });
    });

    it("keeps the modal open and reports API failures", async () => {
        apiFetch.mockRejectedValue(new Error("Unable to create post"));
        render(<CreatePostModal {...defaultProps} />);

        fireEvent.change(
            screen.getByLabelText("Post content"),
            { target: { value: "A post that fails." } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Share post" })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Unable to create post");
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
});
