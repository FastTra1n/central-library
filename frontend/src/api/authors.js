import { buildQuery, request } from "./client.js";

export const getAuthors = (params = {}) =>
  request(`/authors${buildQuery(params)}`, { method: "GET" }, { auth: false });

export const createAuthor = (payload) =>
  request("/authors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
