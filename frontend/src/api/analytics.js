import { buildQuery, request } from "./client.js";

export const getIssuedBooksByReader = (readerId) =>
  request(`/analytics/readers/${readerId}/issued-books`, { method: "GET" });

export const getFreeSeats = () =>
  request("/analytics/halls/free-seats", { method: "GET" });

export const getBookAvailability = (bookId) =>
  request(`/analytics/books/availability${buildQuery({ book_id: bookId })}`, {
    method: "GET",
  });

export const getHallAuthorBooks = (hallId, authorId) =>
  request(
    `/analytics/halls/${hallId}/author-books${buildQuery({ author_id: authorId })}`,
    { method: "GET" }
  );

export const getSingleCopyBorrowers = () =>
  request("/analytics/books/single-copy/borrowers", { method: "GET" });

export const getTopRatedBooks = (limit = 10) =>
  request(`/analytics/books/top-rated${buildQuery({ limit })}`, {
    method: "GET",
  });
