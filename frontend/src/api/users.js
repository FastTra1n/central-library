import { buildQuery, request } from "./client.js";

export const getUsers = (params = {}) =>
  request(`/users${buildQuery(params)}`, { method: "GET" });

export const updateUser = (id, payload) =>
  request(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateUserRole = (id, roleId) =>
  request(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role_id: roleId }),
  });
