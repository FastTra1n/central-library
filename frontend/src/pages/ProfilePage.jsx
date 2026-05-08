import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";

const books = [
  {
    id: 1,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    statusLabel: "До 24 октября",
    statusType: "ok",
    progress: 70,
    cover:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    title: "1984",
    author: "Джордж Оруэлл",
    statusLabel: "Срок истёк вчера",
    statusType: "overdue",
    progress: 100,
    cover:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=200&q=80",
  },
];

const activities = [
  {
    id: 1,
    title: "Возврат книги: «Цветы для Элджернона»",
    subtitle: "Сдана вовремя в главный зал",
    time: "Вчера, 14:20",
    icon: "bi-check-circle",
    tone: "success",
  },
  {
    id: 2,
    title: "Бронирование: «Дюна»",
    subtitle: "Ожидает получения до 20 октября",
    time: "15 Окт, 09:45",
    icon: "bi-bookmark",
    tone: "info",
  },
  {
    id: 3,
    title: "Бронь места: Зал Медиатеки",
    subtitle: "Место №A2, Сессия 12:00 - 16:00",
    time: "12 Окт, 18:10",
    icon: "bi-lamp",
    tone: "warning",
  },
];

const halls = [
  {
    id: 1,
    name: "Главный читальный зал",
    specialization: "Классическая литература",
    free: 42,
    capacity: 120,
    status: "Открыто",
    statusType: "open",
    actionLabel: "Забронировать",
  },
  {
    id: 2,
    name: "Медиатека",
    specialization: "Компьютерные места",
    free: 8,
    capacity: 25,
    status: "Открыто",
    statusType: "open",
    actionLabel: "Забронировать",
  },
  {
    id: 3,
    name: "Математический зал",
    specialization: "Научно-техническая литература",
    free: 0,
    capacity: 15,
    status: "Закрыто",
    statusType: "closed",
    actionLabel: "Недоступно",
  },
];

const ProfilePage = () => {
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
              <h1 className="profile__title">Добро пожаловать, Никита</h1>
              <p className="profile__subtitle">
                Сегодня отличный день, чтобы погрузиться в новую историю.
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
                    {books.map((book) => {
                      const isOverdue = book.statusType === "overdue";
                      return (
                        <div key={book.id} className="profile-books__card">
                          <div
                            className="profile-books__cover"
                            style={{ backgroundImage: `url(${book.cover})` }}
                          ></div>
                          <div className="profile-books__details">
                            <h3 className="profile-books__title">{book.title}</h3>
                            <p className="profile-books__author">{book.author}</p>
                            <div className="profile-books__meta">
                              <i
                                className={`bi ${
                                  isOverdue
                                    ? "bi-exclamation-triangle"
                                    : "bi-calendar-event"
                                }`}
                              ></i>
                              <span
                                className={`profile-books__status ${
                                  isOverdue ? "profile-books__status--overdue" : ""
                                }`}
                              >
                                {book.statusLabel}
                              </span>
                            </div>
                            <div className="profile-books__progress">
                              <span
                                className={`profile-books__progress-bar ${
                                  isOverdue
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
                    <h2 className="profile__section-title">История активности</h2>
                  </div>
                  <div className="profile-activity">
                    {activities.map((activity) => (
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
                    <h2 className="profile__section-title">Библиотечные залы</h2>
                  </div>
                  <div className="profile-halls">
                    {halls.map((hall) => {
                      const isClosed = hall.statusType === "closed";
                      return (
                        <div key={hall.id} className="profile-halls__card">
                          <div className="profile-halls__info">
                            <h3 className="profile-halls__name">{hall.name}</h3>
                            <p className="profile-halls__subtitle">
                              {hall.specialization}
                            </p>
                            <div className="profile-halls__seats">
                              <strong>{hall.free}</strong> / {hall.capacity} свободных
                              мест
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
                                isClosed ? "profile-halls__button--disabled" : ""
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
