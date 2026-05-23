import { buildQuery, request } from "./client.js";

export const getUsers = (params = {}, options = {}) =>
  request(
    `/users${buildQuery(params)}`,
    { method: "GET" },
    {
      meta: options.meta,
    },
  );

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
