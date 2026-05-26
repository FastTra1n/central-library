import { buildQuery, request } from "./client.js";

export const getBooks = (params = {}, options = {}) =>
  request(
    `/books${buildQuery(params)}`,
    { method: "GET" },
    {
      auth: false,
      meta: options.meta,
    },
  );

export const getBook = (id) =>
  request(`/books/${id}`, { method: "GET" }, { auth: false });

export const createBook = (payload) =>
  request("/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const uploadBookCover = (bookId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return request(`/books/${bookId}/cover`, {
    method: "POST",
    body: formData,
  });
};

export const rateBook = (bookId, value) =>
  request(`/books/${bookId}/ratings`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });

export const updateBook = (id, payload) =>
  request(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteBook = (id) => request(`/books/${id}`, { method: "DELETE" });

export const getBookCopies = (bookId) =>
  request(`/books/${bookId}/copies`, { method: "GET" });

export const createBookCopy = (bookId, payload) =>
  request(`/books/${bookId}/copies`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
