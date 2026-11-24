
import { API_BASE_URL } from "../config/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data?: unknown
): Promise<T | null> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        ...(data !== undefined && {
            body: JSON.stringify(data),
        }),
    });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(
            responseText ||
            `Error HTTP ${response.status}: ${response.statusText}`
        );
    }

    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText) as T;
    } catch {
        return responseText as T;
    }
}

export function apiGet<T>(endpoint: string): Promise<T | null> {
    return apiRequest<T>(endpoint, "GET");
}

export function apiPost<T>(
    endpoint: string,
    data: unknown
): Promise<T | null> {
    return apiRequest<T>(endpoint, "POST", data);
}

export function apiPut<T>(
    endpoint: string,
    data: unknown
): Promise<T | null> {
    return apiRequest<T>(endpoint, "PUT", data);
}

export function apiDelete<T>(
    endpoint: string
): Promise<T | null> {
    return apiRequest<T>(endpoint, "DELETE");
}
