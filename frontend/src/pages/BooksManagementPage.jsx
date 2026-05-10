import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import Pagination from "../components/Pagination.jsx";

const inventory = [
  {
    id: 1,
    isbn: "978-5-699-12014-7",
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    category: "Классика",
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 2,
    isbn: "978-5-17-080115-2",
    title: "1984",
    author: "Джордж Оруэлл",
    category: "Антиутопия",
    status: "Выдана",
    statusType: "borrowed",
  },
  {
    id: 3,
    isbn: "978-5-389-06256-6",
    title: "Цветы для Элджернона",
    author: "Дэниел Киз",
    category: "Роман",
    status: "Забронирована",
    statusType: "reserved",
  },
];

const activity = [
  {
    id: 1,
    title: "Новое поступление в каталог",
    subtitle:
      "«Цифровая крепость» Дэна Брауна была добавлена в фонд читального зала №1.",
    time: "15 минут назад",
    tone: "primary",
  },
  {
    id: 2,
    title: "Регистрация нового пользователя",
    subtitle: "Иван Иванов (ID: 6432) получил читательский билет.",
    time: "1 час назад",
    tone: "warning",
  },
];

const BooksManagementPage = () => {
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
                  Добро пожаловать, Никита. Сегодня в каталоге 12 новых
                  поступлений и 5 заявок на бронирование.
                </p>
                <div className="inventory__hero-actions">
                  <button className="button button--light" type="button">
                    <i className="bi bi-plus-lg"></i>
                    Добавить книгу
                  </button>
                  <button className="button button--dark" type="button">
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
                {inventory.map((item) => (
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
                  Показано 3 из 1,248 книг
                </span>
                <Pagination />
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
                  {activity.map((item) => (
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
                  <span className="stat-tile__value">342</span>
                </div>
                <div className="stat-tile stat-tile--danger">
                  <span className="stat-tile__label">Просрочено</span>
                  <span className="stat-tile__value">12</span>
                  <button className="stat-tile__link" type="button">
                    Смотреть список
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BooksManagementPage;
