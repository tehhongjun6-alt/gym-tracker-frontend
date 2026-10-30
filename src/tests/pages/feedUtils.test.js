import {
    describe,
    expect,
    it,
} from "vitest";

import {
    formatRelativeTime,
    getFriendshipLabel,
} from "../../pages/feedUtils";

describe("formatRelativeTime", () => {
    const now = new Date("2026-10-25T12:00:00.000Z");

    it("formats recent posts in minutes", () => {
        expect(
            formatRelativeTime(
                "2026-10-25T11:55:00.000Z",
                now
            )
        ).toBe("5m");
    });

    it("formats older posts in days and weeks", () => {
        expect(
            formatRelativeTime(
                "2026-10-22T12:00:00.000Z",
                now
            )
        ).toBe("3d");

        expect(
            formatRelativeTime(
                "2026-10-04T12:00:00.000Z",
                now
            )
        ).toBe("3w");
    });

    it("returns a safe fallback for invalid dates", () => {
        expect(
            formatRelativeTime("not-a-date", now)
        ).toBe("");
    });
});

describe("getFriendshipLabel", () => {
    it.each([
        ["none", "Add Friend"],
        ["request-sent", "Requested"],
        ["request-received", "Respond"],
        ["friends", "Friends"],
    ])("maps %s to %s", (status, label) => {
        expect(getFriendshipLabel(status)).toBe(label);
    });
});
