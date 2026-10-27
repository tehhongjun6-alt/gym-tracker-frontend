export function formatRelativeTime(createdAt, now = new Date()) {
    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
        return "";
    }

    const seconds = Math.max(
        0,
        Math.floor((now.getTime() - createdDate.getTime()) / 1000)
    );

    if (seconds < 60) {
        return "now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days}d`;
    }

    if (days < 365) {
        return `${Math.floor(days / 7)}w`;
    }

    return `${Math.floor(days / 365)}y`;
}

export function getFriendshipLabel(status) {
    const labels = {
        none: "Add Friend",
        "request-sent": "Requested",
        "request-received": "Respond",
        friends: "Friends",
    };

    return labels[status] || "Add Friend";
}
