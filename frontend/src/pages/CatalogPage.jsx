import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import BookCard from "../components/BookCard.jsx";
import Pagination from "../components/Pagination.jsx";

const placeholderCover =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=600&q=80";

const books = [
  {
    id: 1,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    genre: "Классика",
    rating: 4.8,
    status: "В наличии",
    statusType: "available",
    pages: 480,
    description:
      "Культовый роман Михаила Булгакова. Действие разворачивается в Москве 1930-х годов, которую посещает Воланд со своей свитой.",
  },
  {
    id: 2,
    title: "Убийство в Восточном экспрессе",
    author: "Агата Кристи",
    genre: "Детектив",
    rating: 4.9,
    status: "Выдана",
    statusType: "borrowed",
    pages: 256,
    description:
      "Пуаро расследует убийство в поезде, который застрял в снегах. Классическая загадка Агаты Кристи.",
  },
  {
    id: 3,
    title: "Дюна",
    author: "Фрэнк Герберт",
    genre: "Фантастика",
    rating: 5.0,
    status: "В наличии",
    statusType: "available",
    pages: 544,
    description:
      "Эпическая сага о пустынной планете Арракис, борьбе за власть и пророчествах.",
  },
  {
    id: 4,
    title: "1984",
    author: "Джордж Оруэлл",
    genre: "Классика",
    rating: 4.7,
    status: "В наличии",
    statusType: "available",
    pages: 328,
    description:
      "Антиутопия о тотальном контроле и борьбе за свободу личности в мире Большого Брата.",
  },
  {
    id: 5,
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    genre: "Классика",
    rating: 4.7,
    status: "В наличии",
    statusType: "available",
    pages: 608,
    description:
      "Роман о моральных поисках и трагедии Раскольникова, исследование природы преступления.",
  },
  {
    id: 6,
    title: "Война и мир",
    author: "Лев Толстой",
    genre: "Классика",
    rating: 4.8,
    status: "В наличии",
    statusType: "available",
    pages: 1225,
    description:
      "Масштабная хроника российской жизни на фоне войны 1812 года и истории семей Ростовых и Болконских.",
  },
  {
    id: 7,
    title: "Медный всадник",
    author: "Александр Пушкин",
    genre: "Классика",
    rating: 4.5,
    status: "В наличии",
    statusType: "available",
    pages: 160,
    description: "Поэма о Петербурге, судьбе Евгения и величии города на Неве.",
  },
  {
    id: 8,
    title: "Вий",
    author: "Николай Гоголь",
    genre: "Классика",
    rating: 4.9,
    status: "В наличии",
    statusType: "available",
    pages: 224,
    description:
      "Мистическая история, где страх и вера переплетаются в гоголевском стиле.",
  },
];

const CatalogPage = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleOpenDetails = (book) => {
    setSelectedBook(book);
    setRatingValue(0);
    setHoverRating(0);
  };

  const handleCloseDetails = () => {
    setSelectedBook(null);
  };

  const activeRating = hoverRating || ratingValue;
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск книг или авторов..." />
        <main className="layout__content">
          <section className="catalog">
            <div className="catalog__header">
              <div className="catalog__titles">
                <h1 className="catalog__title">Каталог книг</h1>
                <p className="catalog__subtitle">
                  Исследуйте нашу коллекцию из 12,450 произведений
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
                <button className="button button--primary" type="button">
                  <i className="bi bi-plus-lg"></i>
                  Добавить книгу
                </button>
              </div>
            </div>

            {filtersOpen && (
              <div className="catalog__filters">
                <div className="catalog-filters">
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Статус</span>
                    <label className="catalog-filters__check">
                      <input type="checkbox" defaultChecked />В наличии
                    </label>
                    <label className="catalog-filters__check">
                      <input type="checkbox" />
                      Выдана
                    </label>
                  </div>
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Жанр</span>
                    <select className="catalog-filters__select" defaultValue="">
                      <option value="">Все жанры</option>
                      <option value="classic">Классика</option>
                      <option value="detective">Детектив</option>
                      <option value="fantasy">Фантастика</option>
                    </select>
                  </div>
                  <div className="catalog-filters__group">
                    <span className="catalog-filters__label">Рейтинг</span>
                    <input
                      className="catalog-filters__range"
                      type="range"
                      min="1"
                      max="5"
                      defaultValue="4"
                    />
                  </div>
                  <div className="catalog-filters__actions">
                    <button className="button button--light" type="button">
                      Сбросить
                    </button>
                    <button className="button button--primary" type="button">
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            )}

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
              <span className="catalog__meta">Показано 8 из 12,450 книг</span>
              <Pagination />
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
                    {selectedBook.pages}
                  </span>
                  <span className="details-panel__stat-label">страниц</span>
                </div>
                <div className="details-panel__divider"></div>
                <div className="details-panel__stat">
                  <span className="details-panel__stat-value">
                    {selectedBook.rating.toFixed(1)}
                  </span>
                  <span className="details-panel__stat-label">рейтинг</span>
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
                  >
                    Оценить
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
