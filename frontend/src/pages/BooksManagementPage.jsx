import { useState } from "react";
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
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

        {isAddOpen && (
          <div className="modal" onClick={() => setIsAddOpen(false)}>
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
                  onClick={() => setIsAddOpen(false)}
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
                      <p>Перетащите изображение или нажмите для выбора</p>
                      <button className="button button--light" type="button">
                        Загрузить обложку
                      </button>
                    </div>
                  </div>
                  <div className="modal-form">
                    <label className="modal-form__label">
                      Название
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="Введите название книги"
                      />
                    </label>
                    <label className="modal-form__label">
                      Автор
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="Имя и фамилия автора"
                      />
                    </label>
                    <div className="modal-form__row">
                      <label className="modal-form__label">
                        Год издания
                        <input
                          className="modal-form__input"
                          type="text"
                          placeholder="2024"
                        />
                      </label>
                      <label className="modal-form__label">
                        Категория
                        <select className="modal-form__input">
                          <option>Выбрать...</option>
                          <option>Классика</option>
                          <option>Детектив</option>
                          <option>Фантастика</option>
                        </select>
                      </label>
                    </div>
                    <label className="modal-form__label">
                      ISBN
                      <input
                        className="modal-form__input"
                        type="text"
                        placeholder="978-5-..."
                      />
                    </label>
                    <label className="modal-form__label">
                      Описание
                      <textarea
                        className="modal-form__textarea"
                        placeholder="Краткое описание сюжета или содержания..."
                        rows="4"
                      ></textarea>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  className="button button--light"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                >
                  Отмена
                </button>
                <button className="button button--primary" type="button">
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
                    Читатель (ФИО или ID)
                    <div className="modal-form__input modal-form__input--icon">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        placeholder="Введите имя или номер билета..."
                      />
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
                      Мастер и Маргарита, М. Булгаков
                      <span className="issue-form__check">
                        <i className="bi bi-check-circle-fill"></i>
                      </span>
                    </div>
                  </label>
                  <div className="issue-form__availability">
                    <i className="bi bi-check-circle"></i>
                    Экземпляр в наличии (Зал №4, Стеллаж A-12)
                  </div>

                  <div className="issue-form__row">
                    <label className="modal-form__label">
                      Срок выдачи
                      <div className="modal-form__input modal-form__input--icon">
                        <i className="bi bi-calendar"></i>
                        <input type="text" placeholder="11/15/2023" />
                      </div>
                    </label>
                    <label className="modal-form__label">
                      Выбор зала
                      <div className="modal-form__input modal-form__input--icon">
                        <i className="bi bi-columns-gap"></i>
                        <select>
                          <option>Абонемент (на дом)</option>
                          <option>Главный читальный зал</option>
                          <option>Медиатека</option>
                        </select>
                      </div>
                    </label>
                  </div>
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
                <button className="button button--primary" type="button">
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
