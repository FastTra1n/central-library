import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_ORIGIN } from "../api/client.js";
import { getBooks, rateBook } from "../api/books.js";
import { getGenres } from "../api/genres.js";
import BookCard from "../components/BookCard.jsx";
import Pagination from "../components/Pagination.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isAuthenticated } from "../utils/auth.js";

const placeholderCover =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=600&q=80";

const PAGE_SIZE = 8;

const resolveCover = (coverUrl) => {
  if (!coverUrl) return null;
  if (coverUrl.startsWith("http")) return coverUrl;
  return `${API_ORIGIN}${coverUrl}`;
};

const mapBook = (book) => {
  const totalCopies = book.copies?.length ?? 0;
  const availableCopies =
    book.copies?.filter((copy) => copy.status === "Available").length ?? 0;
  const statusType = availableCopies > 0 ? "available" : "borrowed";
  const status = availableCopies > 0 ? "В наличии" : "Выдана";
  const author = book.authors?.map((item) => item.full_name).join(", ");
  const genre = book.genre?.name || "Без жанра";

  return {
    ...book,
    rating: Number(book.rating || 0),
    author: author || "—",
    genre,
    status,
    statusType,
    totalCopies,
    availableCopies,
    cover: resolveCover(book.cover_url),
    description: `Жанр: ${genre}. Автор: ${author || "не указан"}.`,
  };
};

const CatalogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role_name || user?.role?.name || null;
  const canManageBooks = role === "Librarian" || role === "Admin";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingError, setRatingError] = useState("");
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    available: true,
    borrowed: true,
    genreId: "",
    ratingMin: 0,
  });
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError("");
      try {
        const availability =
          filters.available && !filters.borrowed
            ? true
            : !filters.available && filters.borrowed
              ? false
              : undefined;

        const data = await getBooks(
          {
            search: debouncedSearch || undefined,
            genre_id: filters.genreId || undefined,
            rating_min: filters.ratingMin || undefined,
            available: availability,
            page,
            limit: PAGE_SIZE,
          },
          { meta: true },
        );

        setBooks(data.items.map(mapBook));
        setTotal(data.total);
      } catch (err) {
        setError(err.message || "Не удалось загрузить каталог");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedSearch, filters, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpenDetails = (book) => {
    setSelectedBook(book);
    setRatingValue(0);
    setHoverRating(0);
    setRatingError("");
  };

  const handleCloseDetails = () => {
    setSelectedBook(null);
  };

  const handleRateBook = async () => {
    if (!selectedBook) return;
    if (!isAuthenticated()) {
      navigate("/auth", { state: { from: "/catalog" } });
      return;
    }
    try {
      const updated = await rateBook(selectedBook.id, ratingValue);
      const mapped = mapBook(updated);
      setBooks((prev) =>
        prev.map((item) => (item.id === mapped.id ? mapped : item)),
      );
      setSelectedBook(mapped);
      setRatingValue(0);
      setHoverRating(0);
      setRatingError("");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth", { state: { from: "/catalog" } });
        return;
      }
      setRatingError(err.message || "Не удалось отправить оценку");
    }
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
  };

  const handleResetFilters = () => {
    const next = {
      available: true,
      borrowed: true,
      genreId: "",
      ratingMin: 0,
    };
    setDraftFilters(next);
    setFilters(next);
  };

  const activeRating = hoverRating || ratingValue;
  const totalLabel = total;

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar
          searchPlaceholder="Поиск книг или авторов..."
          searchValue={search}
          onSearchChange={setSearch}
        />
        <main className="layout__content">
          <section className="catalog">
            <div className="catalog__header">
              <div className="catalog__titles">
                <h1 className="catalog__title">Каталог книг</h1>
                <p className="catalog__subtitle">
                  {loading
                    ? "Загружаем каталог..."
                    : `Исследуйте нашу коллекцию из ${totalLabel} книг`}
                </p>
              </div>
              <div className="catalog__actions">
                <button
                  className={`button button--light catalog__filters-toggle ${
                    filtersOpen ? "catalog__filters-toggle--active" : ""
                  }`}
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <i className="bi bi-funnel"></i>
                  Фильтры
                </button>
                {canManageBooks && (
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={() => navigate("/books")}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Добавить книгу
                  </button>
                )}
              </div>
            </div>

            {filtersOpen && (
              <div className="catalog__filters">
                <div className="catalog-filters">
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Статус</span>
                    <label className="catalog-filters__check">
                      <input
                        type="checkbox"
                        checked={draftFilters.available}
                        onChange={(event) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            available: event.target.checked,
                          }))
                        }
                      />
                      В наличии
                    </label>
                    <label className="catalog-filters__check">
                      <input
                        type="checkbox"
                        checked={draftFilters.borrowed}
                        onChange={(event) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            borrowed: event.target.checked,
                          }))
                        }
                      />
                      Выдана
                    </label>
                  </div>
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Жанр</span>
                    <select
                      className="catalog-filters__select"
                      value={draftFilters.genreId}
                      onChange={(event) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          genreId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Все жанры</option>
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Рейтинг</span>
                    <input
                      className="catalog-filters__range"
                      type="range"
                      min="0"
                      max="5"
                      value={draftFilters.ratingMin}
                      onChange={(event) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          ratingMin: Number(event.target.value),
                        }))
                      }
                    />
                    <span className="catalog-filters__check">
                      от {draftFilters.ratingMin}
                    </span>
                  </div>
                  <div className="catalog-filters__actions">
                    <button
                      className="button button--light"
                      type="button"
                      onClick={handleResetFilters}
                    >
                      Сбросить
                    </button>
                    <button
                      className="button button--primary"
                      type="button"
                      onClick={handleApplyFilters}
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="catalog__subtitle">{error}</div>}

            <div className="catalog__grid">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDetails={handleOpenDetails}
                />
              ))}
            </div>

            <div className="catalog__footer">
              <span className="catalog__meta">
                Показано {books.length} из {total} книг
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </section>
        </main>

        {selectedBook && (
          <div className="details-panel" onClick={handleCloseDetails}>
            <aside
              className="details-panel__drawer"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="details-panel__close"
                type="button"
                onClick={handleCloseDetails}
                aria-label="Закрыть"
              >
                <i className="bi bi-x"></i>
              </button>
              <div
                className="details-panel__cover"
                style={{
                  backgroundImage: `url(${selectedBook.cover || placeholderCover})`,
                }}
              ></div>
              <h2 className="details-panel__title">{selectedBook.title}</h2>
              <p className="details-panel__author">{selectedBook.author}</p>
              <div className="details-panel__rating">
                <div className="details-panel__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi ${
                        star <= Math.round(selectedBook.rating)
                          ? "bi-star-fill"
                          : "bi-star"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="details-panel__rating-value">
                  {selectedBook.rating.toFixed(1)}
                </span>
              </div>
              <div className="details-panel__stats">
                <div className="details-panel__stat">
                  <span className="details-panel__stat-value">
                    {selectedBook.year || "—"}
                  </span>
                  <span className="details-panel__stat-label">год</span>
                </div>
                <div className="details-panel__divider"></div>
                <div className="details-panel__stat">
                  <span className="details-panel__stat-value">
                    {selectedBook.availableCopies}
                  </span>
                  <span className="details-panel__stat-label">в наличии</span>
                </div>
              </div>
              <div className="details-panel__section">
                <h3 className="details-panel__section-title">О книге</h3>
                <p className="details-panel__text">
                  {selectedBook.description}
                </p>
              </div>
              <div className="details-panel__section">
                <h3 className="details-panel__section-title">Ваша оценка</h3>
                <div
                  className="details-panel__rate"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <div className="details-panel__rate-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`details-panel__rate-star ${
                          star <= activeRating
                            ? "details-panel__rate-star--active"
                            : ""
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRatingValue(star)}
                      >
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                  </div>
                  <button
                    className="button button--primary details-panel__rate-button"
                    type="button"
                    disabled={!ratingValue}
                    onClick={handleRateBook}
                  >
                    Оценить
                  </button>
                </div>
                {ratingError && (
                  <div className="details-panel__rate-error">{ratingError}</div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
