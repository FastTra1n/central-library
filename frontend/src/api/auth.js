import { request } from "./client.js";

export const login = ({ identifier, password, rememberMe = false }) =>
  request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        identifier,
        password,
        remember_me: rememberMe,
      }),
    },
    { auth: false },
  );

export const register = ({
  fullName,
  email,
  phone,
  password,
  birthDate,
  education,
  hallId,
}) =>
  request(
    "/auth/register",
    {
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
    },
    { auth: false },
  );

export const refresh = () =>
  request("/auth/refresh", { method: "POST" }, { auth: false });

export const logout = () => request("/auth/logout", { method: "POST" });

export const getMe = () => request("/auth/me");
