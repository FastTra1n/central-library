import { buildQuery, request } from "./client.js";

export const getGenres = (params = {}) =>
  request(`/genres${buildQuery(params)}`, { method: "GET" }, { auth: false });

export const createGenre = (payload) =>
  request("/genres", {
    method: "POST",
    body: JSON.stringify(payload),
  });
