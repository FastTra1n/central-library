import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import Pagination from "../components/Pagination.jsx";

const users = [
  {
    id: 1,
    name: "Александр Петров",
    email: "a.petrov@library.ru",
    role: "Читатель",
    roleType: "reader",
    registeredAt: "12 Окт 2023",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Марина Соколова",
    email: "m.sokolova@library.ru",
    role: "Библиотекарь",
    roleType: "librarian",
    registeredAt: "05 Июл 2022",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    name: "Игорь Волков",
    email: "i.volkov@library.ru",
    role: "Читатель",
    roleType: "reader",
    registeredAt: "18 Мар 2023",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 4,
    name: "Елена Кузнецова",
    email: "e.kuznetsova@library.ru",
    role: "Библиотекарь",
    roleType: "librarian",
    registeredAt: "22 Ноя 2021",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
  },
];

const UsersManagementPage = () => {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск пользователей или ролей..." />
        <main className="layout__content">
          <section className="users">
            <div className="users__summary">
              <div className="users-card">
                <span className="users-card__label">Всего пользователей</span>
                <span className="users-card__value">1,482</span>
                <span className="users-card__trend">+12% в этом месяце</span>
                <span className="users-card__icon">
                  <i className="bi bi-people"></i>
                </span>
              </div>
              <div className="users-card">
                <span className="users-card__label">Библиотекари</span>
                <span className="users-card__value">24</span>
                <span className="users-card__trend">3 новых за неделю</span>
                <span className="users-card__icon">
                  <i className="bi bi-person-badge"></i>
                </span>
              </div>
              <div className="users-help">
                <div className="users-help__content">
                  <h3 className="users-help__title">Нужна помощь в управлении?</h3>
                  <p className="users-help__subtitle">
                    Ознакомьтесь с новыми инструкциями по распределению прав
                    доступа.
                  </p>
                  <button className="button button--light users-help__button" type="button">
                    Читать мануал
                  </button>
                </div>
                <div className="users-help__decor" aria-hidden="true">
                  <i className="bi bi-question-circle"></i>
                </div>
              </div>
            </div>

            <div className="users__table-card">
              <div className="users__table-header">
                <div className="users__table-title">Список пользователей</div>
                <div className="users__table-actions">
                  <button className="button button--light" type="button">
                    <i className="bi bi-filter"></i>
                    Фильтр
                  </button>
                  <button className="button button--primary" type="button">
                    <i className="bi bi-plus-lg"></i>
                    Добавить
                  </button>
                </div>
              </div>
              <div className="users__table-subtitle">
                Управляйте ролями и разрешениями в реальном времени
              </div>
              <div className="users-table">
                <div className="users-table__row users-table__row--head">
                  <span>Пользователь</span>
                  <span>Роль</span>
                  <span>Дата регистрации</span>
                  <span>Действие</span>
                </div>
                {users.map((user) => (
                  <div key={user.id} className="users-table__row">
                    <div className="users-table__user">
                      <div
                        className="users-table__avatar"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                      ></div>
                      <div className="users-table__info">
                        <span className="users-table__name">{user.name}</span>
                        <span className="users-table__email">{user.email}</span>
                      </div>
                    </div>
                    <span
                      className={`users-table__role users-table__role--${user.roleType}`}
                    >
                      {user.role}
                    </span>
                    <span className="users-table__date">{user.registeredAt}</span>
                    <button className="users-table__action" type="button">
                      Изменить роль
                    </button>
                  </div>
                ))}
              </div>
              <div className="users__table-footer">
                <span className="users__table-meta">Показано 1-4 из 1,482</span>
                <Pagination />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UsersManagementPage;
