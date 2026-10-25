const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiFetch(path, options = {}) {
    const {
        method = "GET",
        body,
        token,
    } = options;

    const headers = {
        "Content-Type": "application/json",
    };

    // 有登录 token 时才添加 Authorization
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
