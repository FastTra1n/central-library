import { useNavigate } from "react-router-dom";

import { isAuthenticated } from "../utils/auth.js";

const TopBar = ({ searchPlaceholder = "Поиск книг или авторов..." }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      navigate("/auth", { state: { from: "/profile" } });
      return;
    }

    navigate("/profile");
  };
  return (
    <header className="topbar">
      <div className="topbar__title">Центральная библиотека</div>
      <div className="topbar__actions">
        <label className="topbar__search">
          <i className="bi bi-search"></i>
          <input
            className="topbar__search-input"
            type="text"
            placeholder={searchPlaceholder}
          />
        </label>
        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Настройки"
        >
          <i className="bi bi-gear"></i>
        </button>
        <button
          className="topbar__icon-button topbar__icon-button--avatar"
          type="button"
          onClick={handleProfileClick}
        >
          <i className="bi bi-person-circle"></i>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
