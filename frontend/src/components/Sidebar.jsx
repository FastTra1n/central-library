import { NavLink } from "react-router-dom";

const navItems = [
  { key: "catalog", label: "Каталог", icon: "bi-grid", path: "/catalog" },
  { key: "halls", label: "Залы", icon: "bi-door-open", path: "/halls" },
  {
    key: "books",
    label: "Управление книгами",
    icon: "bi-book",
    path: "/books",
  },
  {
    key: "users",
    label: "Управление пользователями",
    icon: "bi-people",
    path: "/users",
  },
  { key: "profile", label: "Профиль", icon: "bi-person", path: "/profile" },
];

const Sidebar = () => {
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
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
            }
          >
            <i className={`sidebar__icon bi ${item.icon}`}></i>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
