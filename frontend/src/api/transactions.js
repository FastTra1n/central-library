import { buildQuery, request } from "./client.js";

export const getTransactions = (params = {}) =>
  request(`/transactions${buildQuery(params)}`, { method: "GET" });

export const issueBook = (payload) =>
  request("/transactions/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const returnBook = (transactionId) =>
  request(`/transactions/${transactionId}/return`, { method: "POST" });
