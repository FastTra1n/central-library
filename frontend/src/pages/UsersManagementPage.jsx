import { useEffect, useMemo, useState } from "react";

import { getRoles } from "../api/roles.js";
import { getUsers, updateUserRole } from "../api/users.js";
import Pagination from "../components/Pagination.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { formatDate } from "../utils/date.js";

const PAGE_SIZE = 4;
const placeholderAvatar =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [librariansCount, setLibrariansCount] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [roles, setRoles] = useState([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const rolesData = await getRoles().catch(() => []);
        setRoles(rolesData);

        const librarianRoleId = rolesData.find(
          (role) => role.name === "Librarian",
        )?.id;

        const totalResponse = await getUsers(
          { page: 1, limit: 1 },
          { meta: true },
        ).catch(() => ({ items: [], total: 0 }));
        setTotalUsers(totalResponse.total || 0);

        if (librarianRoleId) {
          const librarianResponse = await getUsers(
            { page: 1, limit: 1, role_id: librarianRoleId },
            { meta: true },
          ).catch(() => ({ items: [], total: 0 }));
          setLibrariansCount(librarianResponse.total || 0);
        } else {
          setLibrariansCount(0);
        }

        const listResponse = await getUsers(
          {
            search: debouncedSearch || undefined,
            role_id: roleFilter || undefined,
            page,
            limit: PAGE_SIZE,
          },
          { meta: true },
        ).catch(() => ({ items: [], total: 0 }));

        setUsers(listResponse.items);
        setFilteredTotal(listResponse.total || 0);
      } catch (err) {
        setError(err.message || "Не удалось загрузить пользователей");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch, roleFilter, page]);

  const roleMap = useMemo(() => {
    const map = new Map();
    roles.forEach((role) => map.set(role.id, role.name));
    return map;
  }, [roles]);

  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  const canManageRoles = roles.length > 0;

  const handleRoleChange = async (userId, roleId) => {
    if (!roleId) return;
    try {
      await updateUserRole(userId, Number(roleId));
      const listResponse = await getUsers(
        {
          search: debouncedSearch || undefined,
          role_id: roleFilter || undefined,
          page,
          limit: PAGE_SIZE,
        },
        { meta: true },
      ).catch(() => ({ items: [], total: 0 }));
      setUsers(listResponse.items);
      setFilteredTotal(listResponse.total || 0);

      const totalResponse = await getUsers(
        { page: 1, limit: 1 },
        { meta: true },
      ).catch(() => ({ items: [], total: 0 }));
      setTotalUsers(totalResponse.total || 0);

      const librarianRoleId = roles.find(
        (role) => role.name === "Librarian",
      )?.id;
      if (librarianRoleId) {
        const librarianResponse = await getUsers(
          { page: 1, limit: 1, role_id: librarianRoleId },
          { meta: true },
        ).catch(() => ({ items: [], total: 0 }));
        setLibrariansCount(librarianResponse.total || 0);
      }
    } catch (err) {
      setError(err.message || "Не удалось изменить роль");
    }
  };

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar
          searchPlaceholder="Поиск пользователей или ролей..."
          searchValue={search}
          onSearchChange={setSearch}
        />
        <main className="layout__content">
          <section className="users">
            <div className="users__summary">
              <div className="users-card">
                <span className="users-card__label">Всего пользователей</span>
                <span className="users-card__value">
                  {loading ? "..." : totalUsers}
                </span>
                <span className="users-card__trend">+0% в этом месяце</span>
                <span className="users-card__icon">
                  <i className="bi bi-people"></i>
                </span>
              </div>
              <div className="users-card">
                <span className="users-card__label">Библиотекари</span>
                <span className="users-card__value">
                  {loading ? "..." : librariansCount}
                </span>
                <span className="users-card__trend">Активных сотрудников</span>
                <span className="users-card__icon">
                  <i className="bi bi-person-badge"></i>
                </span>
              </div>
              <div className="users-help">
                <div className="users-help__content">
                  <h3 className="users-help__title">
                    Нужна помощь в управлении?
                  </h3>
                  <p className="users-help__subtitle">
                    Ознакомьтесь с новыми инструкциями по распределению прав
                    доступа.
                  </p>
                  <button
                    className="button button--light users-help__button"
                    type="button"
                  >
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
                  <select
                    className="users__role-filter"
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                  >
                    <option value="">Все роли</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
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
              {error && <div className="users__table-subtitle">{error}</div>}
              <div className="users-table">
                <div className="users-table__row users-table__row--head">
                  <span>Пользователь</span>
                  <span>Роль</span>
                  <span>Дата регистрации</span>
                  <span>Действие</span>
                </div>
                {users.map((user) => {
                  const roleName = user.role?.name || roleMap.get(user.role_id);
                  const roleType = roleName ? roleName.toLowerCase() : "reader";
                  return (
                    <div key={user.id} className="users-table__row">
                      <div className="users-table__user">
                        <div
                          className="users-table__avatar"
                          style={{
                            backgroundImage: `url(${placeholderAvatar})`,
                          }}
                        ></div>
                        <div className="users-table__info">
                          <span className="users-table__name">
                            {user.full_name}
                          </span>
                          <span className="users-table__email">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`users-table__role users-table__role--${roleType}`}
                      >
                        {roleName || "—"}
                      </span>
                      <span className="users-table__date">
                        {formatDate(user.created_at) || "—"}
                      </span>
                      <div className="users-table__action-group">
                        {canManageRoles ? (
                          <select
                            className="users-table__select"
                            value={user.role_id}
                            onChange={(event) =>
                              handleRoleChange(user.id, event.target.value)
                            }
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            className="users-table__action"
                            type="button"
                            disabled
                          >
                            Недоступно
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="users__table-footer">
                <span className="users__table-meta">
                  Показано {users.length} из {filteredTotal}
                </span>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UsersManagementPage;
