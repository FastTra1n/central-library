import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/auth.js";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data?.access_token) {
    setAccessToken(data.access_token);
    return data.access_token;
  }

  return null;
};

export const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const request = async (
  path,
  options = {},
  { auth = true, retry = true, meta = false } = {},
) => {
  const headers = { ...(options.headers || {}) };
  const body = options.body;

  if (!(body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (response.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request(path, options, { auth, retry: false });
    }
    clearAccessToken();
  }

  if (!response.ok) {
    let message = "Ошибка запроса";
    try {
      const errorData = await response.json();
      message = errorData?.detail || errorData?.message || message;
    } catch (error) {
      // ignore JSON parse errors
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const data = await parseResponse(response);
  if (meta) {
    const totalHeader = Number(response.headers.get("x-total-count"));
    const pageHeader = Number(response.headers.get("x-page"));
    const limitHeader = Number(response.headers.get("x-limit"));

    return {
      items: Array.isArray(data) ? data : [],
      total: Number.isNaN(totalHeader)
        ? Array.isArray(data)
          ? data.length
          : 0
        : totalHeader,
      page: Number.isNaN(pageHeader) ? 1 : pageHeader,
      limit: Number.isNaN(limitHeader)
        ? Array.isArray(data)
          ? data.length
          : 0
        : limitHeader,
    };
  }

  return data;
};
