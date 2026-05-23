import { request } from "./client.js";

export const getRoles = () => request("/roles", { method: "GET" });
