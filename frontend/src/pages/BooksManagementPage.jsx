import { useEffect, useMemo, useState } from "react";

import { createAuthor, getAuthors } from "../api/authors.js";
import { createBook, getBooks, uploadBookCover } from "../api/books.js";
import { getGenres } from "../api/genres.js";
import { getHalls } from "../api/halls.js";
import { issueBook, getTransactions } from "../api/transactions.js";
import { getUsers } from "../api/users.js";
import Pagination from "../components/Pagination.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { formatDateTime, isOverdue, toInputDate } from "../utils/date.js";

const PAGE_SIZE = 6;

const BooksManagementPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [inventoryBooks, setInventoryBooks] = useState([]);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    year: "",
    genreId: "",
    cipher: "",
  });
  const [authorCountry, setAuthorCountry] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [issueForm, setIssueForm] = useState({
    userId: "",
    bookId: "",
    dueDate: "",
  });

  const normalizeName = (value) =>
    value.toLowerCase().replace(/\s+/g, " ").trim();
  const [formError, setFormError] = useState("");
  const [issueError, setIssueError] = useState("");

  const resetAddForm = () => {
    setBookForm({ title: "", author: "", year: "", genreId: "", cipher: "" });
    setAuthorCountry("");
    setSelectedAuthorId(null);
    setCoverFile(null);
    setFormError("");
  };

  const readers = useMemo(() => {
    return users.filter((user) => {
      if (user.role?.name) {
        return user.role.name === "Reader";
      }
      return true;
    });
  }, [users]);

  const hallsMap = useMemo(() => {
    const map = new Map();
    halls.forEach((hall) => map.set(hall.id, hall));
    return map;
  }, [halls]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        booksData,
        authorsData,
        genresData,
        transactionsData,
        usersData,
        hallsData,
      ] = await Promise.all([
        getBooks(),
        getAuthors(),
        getGenres(),
        getTransactions().catch(() => []),
        getUsers().catch(() => []),
        getHalls(),
      ]);

      setBooks(booksData);
      setAuthors(authorsData);
      setGenres(genresData);
      setTransactions(transactionsData);
      setUsers(usersData);
      setHalls(hallsData);
      await fetchInventoryPage(1);
      setPage(1);
    } catch (err) {
      setError(err.message || "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryPage = async (targetPage) => {
    try {
      const result = await getBooks(
        { page: targetPage, limit: PAGE_SIZE },
        { meta: true },
      );
      setInventoryBooks(result.items);
      setInventoryTotal(result.total || 0);
    } catch (err) {
      setInventoryBooks([]);
      setInventoryTotal(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchInventoryPage(page);
  }, [page]);

  useEffect(() => {
    if (isIssueOpen) {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setIssueForm((prev) => ({
        ...prev,
        dueDate: prev.dueDate || toInputDate(defaultDue),
      }));
    }
  }, [isIssueOpen]);

  const inventoryRows = useMemo(() => {
    return inventoryBooks.map((book) => {
      const copies = book.copies || [];
      const available = copies.filter(
        (copy) => copy.status === "Available",
      ).length;
      const borrowed = copies.filter(
        (copy) => copy.status === "Borrowed",
      ).length;
      const statusType =
        available > 0 ? "available" : borrowed > 0 ? "borrowed" : "reserved";
      const status =
        available > 0
          ? "В наличии"
          : borrowed > 0
            ? "Выдана"
            : "Нет экземпляров";
      const author = book.authors?.map((item) => item.full_name).join(", ");

      return {
        id: book.id,
        isbn: copies[0]?.cipher || "—",
        title: book.title,
        author: author || "—",
        category: book.genre?.name || "Без жанра",
        status,
        statusType,
      };
    });
  }, [inventoryBooks]);

  const totalPages = Math.max(1, Math.ceil(inventoryTotal / PAGE_SIZE));

  const issuedTransactions = transactions.filter((item) => !item.return_date);
  const booksOnHands = issuedTransactions.length;
  const overdueCount = issuedTransactions.filter((item) =>
    isOverdue(item.due_date),
  ).length;

  const booksMap = useMemo(() => {
    const map = new Map();
    books.forEach((book) => map.set(book.id, book));
    return map;
  }, [books]);

  const activityItems = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const aDate = new Date(a.return_date || a.issue_date).getTime();
        const bDate = new Date(b.return_date || b.issue_date).getTime();
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((item) => {
        const copy = item.copy;
        const book = booksMap.get(copy?.book_id);
        const title = book?.title || "Книга";
        const isReturned = Boolean(item.return_date);
        return {
          id: item.id,
          title: isReturned
            ? `Возврат книги: «${title}»`
            : `Выдача книги: «${title}»`,
          subtitle: item.user ? `Читатель: ${item.user.full_name}` : "",
          time: formatDateTime(item.return_date || item.issue_date),
          tone: isReturned ? "success" : "primary",
        };
      });
  }, [transactions, booksMap]);

  const handleBookFormChange = (field) => (event) => {
    const value = event.target.value;
    setBookForm((prev) => ({ ...prev, [field]: value }));
    if (field === "author") {
      setSelectedAuthorId(null);
    }
  };

  const authorMatches = useMemo(() => {
    const query = normalizeName(bookForm.author);
    if (!query) return [];
    return authors.filter((author) =>
      normalizeName(author.full_name).includes(query),
    );
  }, [authors, bookForm.author]);

  const exactAuthor = useMemo(() => {
    const query = normalizeName(bookForm.author);
    if (!query) return null;
    return authors.find((author) => normalizeName(author.full_name) === query);
  }, [authors, bookForm.author]);

  const isNewAuthor =
    bookForm.author.trim().length > 0 && !exactAuthor && !selectedAuthorId;

  const handleAuthorSelect = (author) => {
    setSelectedAuthorId(author.id);
    setBookForm((prev) => ({ ...prev, author: author.full_name }));
    setAuthorCountry("");
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    setCoverFile(file || null);
  };

  const handleAddBook = async () => {
    setFormError("");

    if (!bookForm.title.trim()) {
      setFormError("Введите название книги");
      return;
    }

    let authorId = selectedAuthorId;
    const authorName = bookForm.author.trim();
    if (authorName && !authorId) {
      const normalized = normalizeName(authorName);
      const exact = authors.find(
        (item) => normalizeName(item.full_name) === normalized,
      );
      if (exact) {
        authorId = exact.id;
      } else if (authorMatches.length > 0) {
        setFormError("Похоже, автор уже есть в базе. Выберите из списка.");
        return;
      } else {
        try {
          const created = await createAuthor({
            full_name: authorName,
            country: authorCountry?.trim() || null,
          });
          authorId = created.id;
          setAuthors((prev) => [...prev, created]);
        } catch (err) {
          setFormError(err.message || "Не удалось создать автора");
          return;
        }
      }
    }

    const genreId = bookForm.genreId ? Number(bookForm.genreId) : null;

    const payload = {
      title: bookForm.title.trim(),
      genre_id: genreId || null,
      year: bookForm.year ? Number(bookForm.year) : null,
      rating: 0,
      author_ids: authorId ? [authorId] : undefined,
      copy_ciphers: bookForm.cipher ? [bookForm.cipher.trim()] : undefined,
    };

    try {
      const createdBook = await createBook(payload);
      if (coverFile) {
        await uploadBookCover(createdBook.id, coverFile);
      }
      setIsAddOpen(false);
      resetAddForm();
      await fetchData();
    } catch (err) {
      setFormError(err.message || "Не удалось добавить книгу");
    }
  };

  const handleIssueChange = (field) => (event) => {
    setIssueForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const selectedReader = readers.find(
    (reader) => reader.id === Number(issueForm.userId),
  );
  const selectedBook = books.find(
    (book) => book.id === Number(issueForm.bookId),
  );
  const selectedHall = selectedReader
    ? hallsMap.get(selectedReader.hall_id)
    : null;
  const availableCopies = selectedBook?.copies?.filter(
    (copy) => copy.status === "Available",
  ).length;

  const handleIssueBook = async () => {
    setIssueError("");

    if (!issueForm.userId || !issueForm.bookId) {
      setIssueError("Выберите читателя и книгу");
      return;
    }

    if (!selectedReader?.hall_id) {
      setIssueError("Читатель не закреплён за залом");
      return;
    }

    if (!availableCopies) {
      setIssueError("Нет доступных экземпляров выбранной книги");
      return;
    }

    try {
      await issueBook({
        user_id: Number(issueForm.userId),
        book_id: Number(issueForm.bookId),
        due_date: issueForm.dueDate
          ? new Date(issueForm.dueDate).toISOString()
          : undefined,
      });
      setIsIssueOpen(false);
      setIssueForm({ userId: "", bookId: "", dueDate: "" });
      await fetchData();
    } catch (err) {
      setIssueError(err.message || "Не удалось оформить выдачу");
    }
  };

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск книг или авторов..." />
        <main className="layout__content">
          <section className="inventory">
            <div className="inventory__hero">
              <div className="inventory__hero-content">
                <h1 className="inventory__hero-title">
                  Панель управления инвентарем
                </h1>
                <p className="inventory__hero-subtitle">
                  {loading
                    ? "Загружаем данные..."
                    : error
                      ? error
                      : `В каталоге ${books.length} книг, на руках ${booksOnHands}.`}
                </p>
                <div className="inventory__hero-actions">
                  <button
                    className="button button--light"
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Добавить книгу
                  </button>
                  <button
                    className="button button--dark"
                    type="button"
                    onClick={() => setIsIssueOpen(true)}
                  >
                    <i className="bi bi-journal-arrow-up"></i>
                    Оформить выдачу
                  </button>
                </div>
              </div>
              <div className="inventory__hero-decor" aria-hidden="true">
                <i className="bi bi-book"></i>
              </div>
            </div>

            <div className="inventory__table-card">
              <div className="inventory__table-header">
                <div className="inventory__table-title">
                  Управление инвентарем
                </div>
                <button className="inventory__filter" type="button">
                  <i className="bi bi-filter"></i>
                  Фильтр
                </button>
              </div>
              <div className="inventory-table">
                <div className="inventory-table__row inventory-table__row--head">
                  <span>ISBN</span>
                  <span>Название и автор</span>
                  <span>Категория</span>
                  <span>Статус</span>
                  <span>Действия</span>
                </div>
                {inventoryRows.map((item) => (
                  <div key={item.id} className="inventory-table__row">
                    <span className="inventory-table__isbn">{item.isbn}</span>
                    <div className="inventory-table__book">
                      <span className="inventory-table__title">
                        {item.title}
                      </span>
                      <span className="inventory-table__author">
                        {item.author}
                      </span>
                    </div>
                    <span className="inventory-table__tag">
                      {item.category}
                    </span>
                    <span
                      className={`inventory-table__status inventory-table__status--${item.statusType}`}
                    >
                      <span className="inventory-table__status-dot"></span>
                      {item.status}
                    </span>
                    <button className="inventory-table__action" type="button">
                      <i className="bi bi-three-dots"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="inventory__table-footer">
                <span className="inventory__table-meta">
                  Показано {inventoryRows.length} из {inventoryTotal} книг
                </span>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>

            <div className="inventory__bottom">
              <div className="activity-card">
                <div className="activity-card__title">
                  <span className="activity-card__wave" aria-hidden="true">
                    <svg viewBox="0 0 32 6" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 3c2.5-2 5-2 7 0s5 2 7 0 5-2 7 0 5 2 7 0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  Последняя активность
                </div>
                <div className="activity-card__list">
                  {activityItems.map((item) => (
                    <div
                      key={item.id}
                      className={`activity-card__item activity-card__item--${item.tone}`}
                    >
                      <span
                        className="activity-card__stroke"
                        aria-hidden="true"
                      ></span>
                      <div
                        className={`activity-card__icon activity-card__icon--${item.tone}`}
                      >
                        <i className="bi bi-bell"></i>
                      </div>
                      <div className="activity-card__content">
                        <div className="activity-card__name">{item.title}</div>
                        <div className="activity-card__subtitle">
                          {item.subtitle}
                        </div>
                        <div
                          className={`activity-card__time activity-card__time--${item.tone}`}
                        >
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="inventory__stats">
                <div className="stat-tile">
                  <span className="stat-tile__label">Книг на руках</span>
                  <span className="stat-tile__value">{booksOnHands}</span>
                </div>
                <div className="stat-tile stat-tile--danger">
                  <span className="stat-tile__label">Просрочено</span>
                  <span className="stat-tile__value">{overdueCount}</span>
                  <button className="stat-tile__link" type="button">
                    Смотреть список
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {isAddOpen && (
          <div
            className="modal"
            onClick={() => {
              setIsAddOpen(false);
              resetAddForm();
            }}
          >
            <div
              className="modal__content"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal__header">
                <div>
                  <h2 className="modal__title">Добавить новую книгу</h2>
                  <p className="modal__subtitle">
                    Заполните данные для регистрации издания в системе
                  </p>
                </div>
                <button
                  className="modal__close"
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetAddForm();
                  }}
                  aria-label="Закрыть"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal__body">
                <div className="modal__grid">
                  <div className="upload-card">
                    <span className="upload-card__label">Обложка книги</span>
                    <div className="upload-card__drop">
                      <i className="bi bi-image"></i>
                      <p>
                        {coverFile
                          ? `Выбрано: ${coverFile.name}`
                          : "Перетащите изображение или нажмите для выбора"}
                      </p>
                      <input
                        className="upload-card__input"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                    </div>
                  </div>
                  <div className="modal-form">
                    <label className="modal-form__label">
                      Название
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="Введите название книги"
                        value={bookForm.title}
                        onChange={handleBookFormChange("title")}
                      />
                    </label>
                    <label className="modal-form__label">
                      Автор
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="Имя и фамилия автора"
                        value={bookForm.author}
                        onChange={handleBookFormChange("author")}
                      />
                    </label>
                    {selectedAuthorId && (
                      <div className="modal-form__hint">
                        Автор выбран из базы.
                      </div>
                    )}
                    {authorMatches.length > 0 && !selectedAuthorId && (
                      <div className="author-suggestions">
                        {authorMatches.map((author) => (
                          <button
                            key={author.id}
                            className="author-suggestion"
                            type="button"
                            onClick={() => handleAuthorSelect(author)}
                          >
                            {author.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                    {isNewAuthor && (
                      <label className="modal-form__label">
                        Страна автора
                        <input
                          className="modal-form__input"
                          type="text"
                          placeholder="Например, Россия"
                          value={authorCountry}
                          onChange={(event) =>
                            setAuthorCountry(event.target.value)
                          }
                        />
                      </label>
                    )}
                    <div className="modal-form__row">
                      <label className="modal-form__label">
                        Год издания
                        <input
                          className="modal-form__input"
                          type="number"
                          placeholder="2024"
                          value={bookForm.year}
                          onChange={handleBookFormChange("year")}
                        />
                      </label>
                      <label className="modal-form__label">
                        Категория
                        <select
                          className="modal-form__input"
                          value={bookForm.genreId}
                          onChange={handleBookFormChange("genreId")}
                        >
                          <option value="">Выбрать...</option>
                          {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                              {genre.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="modal-form__label">
                      ISBN / Шифр экземпляра
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="978-5-..."
                        value={bookForm.cipher}
                        onChange={handleBookFormChange("cipher")}
                      />
                    </label>

                    {formError && (
                      <div className="modal-form__error">{formError}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  className="button button--light"
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetAddForm();
                  }}
                >
                  Отмена
                </button>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleAddBook}
                >
                  Добавить книгу
                </button>
              </div>
            </div>
          </div>
        )}

        {isIssueOpen && (
          <div className="modal" onClick={() => setIsIssueOpen(false)}>
            <div
              className="modal__content modal__content--wide"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal__header">
                <div>
                  <h2 className="modal__title">Оформить выдачу</h2>
                  <p className="modal__subtitle">
                    Заполните данные для регистрации выдачи книги
                  </p>
                </div>
                <button
                  className="modal__close"
                  type="button"
                  onClick={() => setIsIssueOpen(false)}
                  aria-label="Закрыть"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal__body">
                <div className="issue-form">
                  <label className="modal-form__label">
                    Читатель
                    <div className="modal-form__input modal-form__input--icon">
                      <i className="bi bi-search"></i>
                      <select
                        value={issueForm.userId}
                        onChange={handleIssueChange("userId")}
                      >
                        <option value="">Выберите читателя</option>
                        {readers.map((reader) => (
                          <option key={reader.id} value={reader.id}>
                            {reader.full_name} (ID {reader.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <div className="issue-form__chips">
                    <span className="issue-form__chip issue-form__chip--active">
                      История активна
                    </span>
                    <span className="issue-form__chip">Долгов нет</span>
                  </div>

                  <label className="modal-form__label">
                    Выбор книги
                    <div className="issue-form__book">
                      <i className="bi bi-book"></i>
                      <select
                        className="issue-form__select"
                        value={issueForm.bookId}
                        onChange={handleIssueChange("bookId")}
                      >
                        <option value="">Выберите книгу</option>
                        {books
                          .filter((book) =>
                            book.copies?.some(
                              (copy) => copy.status === "Available",
                            ),
                          )
                          .map((book) => (
                            <option key={book.id} value={book.id}>
                              {book.title}
                            </option>
                          ))}
                      </select>
                      {availableCopies ? (
                        <span className="issue-form__check">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                      ) : null}
                    </div>
                  </label>
                  <div className="issue-form__availability">
                    <i className="bi bi-check-circle"></i>
                    {availableCopies
                      ? `Экземпляров доступно: ${availableCopies}`
                      : "Экземпляров нет"}
                  </div>

                  <div className="issue-form__row">
                    <label className="modal-form__label">
                      Срок выдачи
                      <div className="modal-form__input modal-form__input--icon">
                        <i className="bi bi-calendar"></i>
                        <input
                          type="date"
                          value={issueForm.dueDate}
                          onChange={handleIssueChange("dueDate")}
                        />
                      </div>
                    </label>
                    <label className="modal-form__label">
                      Выбор зала
                      <div className="modal-form__input modal-form__input--icon">
                        <i className="bi bi-columns-gap"></i>
                        <input
                          type="text"
                          value={selectedHall?.name || "Не назначен"}
                          readOnly
                        />
                      </div>
                    </label>
                  </div>
                  {issueError && (
                    <div className="modal-form__error">{issueError}</div>
                  )}
                </div>
              </div>
              <div className="modal__footer modal__footer--split">
                <button
                  className="button button--light"
                  type="button"
                  onClick={() => setIsIssueOpen(false)}
                >
                  Отмена
                </button>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleIssueBook}
                >
                  Выдать книгу
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksManagementPage;
