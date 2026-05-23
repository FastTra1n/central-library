import { buildQuery, request } from "./client.js";

export const getHalls = (params = {}) =>
  request(`/halls${buildQuery(params)}`, { method: "GET" }, { auth: false });

export const getHall = (id) =>
  request(`/halls/${id}`, { method: "GET" }, { auth: false });
