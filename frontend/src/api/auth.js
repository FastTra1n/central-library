const API_URL = "http://127.0.0.1:8000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    let message = "Ошибка запроса";
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch (error) {
      // ignore json parsing error
    }
    throw new Error(message);
  }

  return response.json();
};

export const login = ({ identifier, password, rememberMe = false }) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      remember_me: rememberMe,
    }),
  });

export const register = ({
  fullName,
  email,
  phone,
  password,
  birthDate,
  education,
  hallId,
}) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName,
      email,
      phone: phone || null,
      password,
      birth_date: birthDate || null,
      education: education || null,
      hall_id: hallId || null,
    }),
  });

export const refresh = () =>
  request("/auth/refresh", {
    method: "POST",
  });

export const logout = () =>
  request("/auth/logout", {
    method: "POST",
  });

export const getMe = () => request("/auth/me");
