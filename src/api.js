const API_URL =
    import.meta.env.VITE_API_URL || "https://gym-backed-production.up.railway.app";

export async function apiFetch(path, options = {}) {
    const {
        method = "GET",
        body,
        token,
    } = options;

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}
