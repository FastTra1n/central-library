import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe } from "../api/auth.js";
import { getFreeSeats } from "../api/analytics.js";
import { getBooks } from "../api/books.js";
import { getHalls } from "../api/halls.js";
import { getTransactions } from "../api/transactions.js";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import {
  calcProgress,
  formatDateTime,
  formatDueDateLabel,
  isOverdue,
} from "../utils/date.js";

const placeholderCover =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=200&q=80";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [halls, setHalls] = useState([]);
  const [freeSeats, setFreeSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const meData = await getMe();
        setMe(meData);

        const [booksData, transactionsData, hallsData] = await Promise.all([
          getBooks(),
          getTransactions().catch(() => []),
          getHalls(),
        ]);
        setBooks(booksData);
        setTransactions(transactionsData);
        setHalls(hallsData);

        try {
          const freeSeatsData = await getFreeSeats();
          setFreeSeats(freeSeatsData);
        } catch (err) {
          setFreeSeats([]);
        }
      } catch (err) {
        if (err.status === 401) {
          navigate("/auth");
          return;
        }
        setError(err.message || "Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const booksMap = useMemo(() => {
    const map = new Map();
    books.forEach((book) => map.set(book.id, book));
    return map;
  }, [books]);

  const issuedBooks = useMemo(() => {
    return transactions.filter((item) => !item.return_date);
  }, [transactions]);

  const bookCards = useMemo(() => {
    return issuedBooks.map((transaction) => {
      const book = booksMap.get(transaction.copy?.book_id);
      const overdue = isOverdue(transaction.due_date);
      return {
        id: transaction.id,
        title: book?.title || "Книга",
        author: book?.authors?.map((item) => item.full_name).join(", ") || "—",
        statusLabel: overdue
          ? `Просрочено (${formatDueDateLabel(transaction.due_date)})`
          : formatDueDateLabel(transaction.due_date),
        statusType: overdue ? "overdue" : "ok",
        progress: calcProgress(transaction.issue_date, transaction.due_date),
        cover: placeholderCover,
      };
    });
  }, [issuedBooks, booksMap]);

  const activityItems = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const aDate = new Date(a.return_date || a.issue_date).getTime();
        const bDate = new Date(b.return_date || b.issue_date).getTime();
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((transaction) => {
        const book = booksMap.get(transaction.copy?.book_id);
        const title = book?.title || "Книга";
        const returned = Boolean(transaction.return_date);
        const overdue = isOverdue(transaction.due_date);
        return {
          id: transaction.id,
          title: returned
            ? `Возврат книги: «${title}»`
            : `Выдача книги: «${title}»`,
          subtitle: returned
            ? "Сдана в библиотеку"
            : overdue
              ? "Срок сдачи просрочен"
              : "В работе у читателя",
          time: formatDateTime(
            transaction.return_date || transaction.issue_date,
          ),
          icon: returned
            ? "bi-check-circle"
            : overdue
              ? "bi-exclamation-triangle"
              : "bi-bookmark",
          tone: returned ? "success" : overdue ? "warning" : "info",
        };
      });
  }, [transactions, booksMap]);

  const hallsMap = useMemo(() => {
    const map = new Map();
    halls.forEach((hall) => map.set(hall.id, hall));
    return map;
  }, [halls]);

  const freeSeatsMap = useMemo(() => {
    const map = new Map();
    freeSeats.forEach((item) => map.set(item.hall_id, item));
    return map;
  }, [freeSeats]);

  const myHall = me?.hall_id ? hallsMap.get(me.hall_id) : null;
  const hallFreeInfo = myHall ? freeSeatsMap.get(myHall.id) : null;
  const hallCards = myHall
    ? [
        {
          id: myHall.id,
          name: myHall.name,
          specialization: myHall.specialization,
          free: hallFreeInfo?.free ?? null,
          capacity: myHall.seats ?? null,
          status: hallFreeInfo?.free === 0 ? "Закрыто" : "Открыто",
          statusType: hallFreeInfo?.free === 0 ? "closed" : "open",
          actionLabel: "Информация",
        },
      ]
    : [];

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск книг или авторов..." />
        <main className="layout__content">
          <section className="profile">
            <div className="profile__header">
              <h1 className="profile__title">
                {me ? `Добро пожаловать, ${me.full_name}` : "Добро пожаловать"}
              </h1>
              <p className="profile__subtitle">
                {loading
                  ? "Загружаем ваш профиль..."
                  : error
                    ? error
                    : "Сегодня отличный день, чтобы погрузиться в новую историю."}
              </p>
            </div>

            <div className="profile__body">
              <div className="profile__main">
                <div className="profile__section">
                  <div className="profile__section-header">
                    <h2 className="profile__section-title">Мои книги</h2>
                    <button className="profile__section-link" type="button">
                      Все займы
                    </button>
                  </div>
                  <div className="profile-books">
                    {bookCards.length === 0 && !loading && (
                      <div className="profile__subtitle">Нет активных книг</div>
                    )}
                    {bookCards.map((book) => {
                      const isOverdueFlag = book.statusType === "overdue";
                      return (
                        <div key={book.id} className="profile-books__card">
                          <div
                            className="profile-books__cover"
                            style={{ backgroundImage: `url(${book.cover})` }}
                          ></div>
                          <div className="profile-books__details">
                            <h3 className="profile-books__title">
                              {book.title}
                            </h3>
                            <p className="profile-books__author">
                              {book.author}
                            </p>
                            <div className="profile-books__meta">
                              <i
                                className={`bi ${
                                  isOverdueFlag
                                    ? "bi-exclamation-triangle"
                                    : "bi-calendar-event"
                                }`}
                              ></i>
                              <span
                                className={`profile-books__status ${
                                  isOverdueFlag
                                    ? "profile-books__status--overdue"
                                    : ""
                                }`}
                              >
                                {book.statusLabel}
                              </span>
                            </div>
                            <div className="profile-books__progress">
                              <span
                                className={`profile-books__progress-bar ${
                                  isOverdueFlag
                                    ? "profile-books__progress-bar--overdue"
                                    : ""
                                }`}
                                style={{ width: `${book.progress}%` }}
                              ></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="profile__section">
                  <div className="profile__section-header">
                    <h2 className="profile__section-title">
                      История активности
                    </h2>
                  </div>
                  <div className="profile-activity">
                    {activityItems.length === 0 && !loading && (
                      <div className="profile__subtitle">
                        История пока пуста
                      </div>
                    )}
                    {activityItems.map((activity) => (
                      <div key={activity.id} className="profile-activity__item">
                        <div className="profile-activity__left">
                          <div
                            className={`profile-activity__icon ${
                              activity.tone === "success"
                                ? "profile-activity__icon--success"
                                : activity.tone === "warning"
                                  ? "profile-activity__icon--warning"
                                  : ""
                            }`}
                          >
                            <i className={`bi ${activity.icon}`}></i>
                          </div>
                          <div className="profile-activity__content">
                            <p className="profile-activity__title">
                              {activity.title}
                            </p>
                            <p className="profile-activity__subtitle">
                              {activity.subtitle}
                            </p>
                          </div>
                        </div>
                        <span className="profile-activity__time">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="profile__aside">
                <div className="profile__section">
                  <div className="profile__section-header">
                    <h2 className="profile__section-title">
                      Библиотечные залы
                    </h2>
                  </div>
                  <div className="profile-halls">
                    {hallCards.length === 0 && !loading && (
                      <div className="profile__subtitle">
                        Зал пока не назначен
                      </div>
                    )}
                    {hallCards.map((hall) => {
                      const isClosed = hall.statusType === "closed";
                      return (
                        <div key={hall.id} className="profile-halls__card">
                          <div className="profile-halls__info">
                            <h3 className="profile-halls__name">{hall.name}</h3>
                            <p className="profile-halls__subtitle">
                              {hall.specialization || "Общий"}
                            </p>
                            <div className="profile-halls__seats">
                              <strong>{hall.free ?? "—"}</strong> /{" "}
                              {hall.capacity ?? "—"} свободных мест
                            </div>
                          </div>
                          <div className="profile-halls__meta">
                            <span
                              className={`profile-halls__status ${
                                isClosed ? "profile-halls__status--closed" : ""
                              }`}
                            >
                              {hall.status}
                            </span>
                            <button
                              className={`profile-halls__button ${
                                isClosed
                                  ? "profile-halls__button--disabled"
                                  : ""
                              }`}
                              type="button"
                              disabled={isClosed}
                            >
                              {hall.actionLabel}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
