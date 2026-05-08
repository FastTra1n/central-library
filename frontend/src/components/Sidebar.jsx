const navItems = [
  { key: "catalog", label: "Каталог", icon: "bi-grid" },
  { key: "history", label: "История", icon: "bi-clock-history" },
  { key: "halls", label: "Залы", icon: "bi-columns-gap" },
  { key: "books", label: "Управление книгами", icon: "bi-book" },
  { key: "users", label: "Управление пользователями", icon: "bi-people" },
  { key: "profile", label: "Профиль", icon: "bi-person" },
];

const Sidebar = ({ activeKey = "catalog", onSelect }) => {
  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <i className="bi bi-book"></i>
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-title">Библиотека</span>
          <span className="sidebar__brand-subtitle">библиотечная система</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar__item ${
              activeKey === item.key ? "sidebar__item--active" : ""
            }`}
            type="button"
            onClick={() => onSelect?.(item.key)}
          >
            <i className={`sidebar__icon bi ${item.icon}`}></i>
            <span className="sidebar__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
