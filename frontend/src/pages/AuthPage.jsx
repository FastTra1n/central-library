import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { login, register } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { isAuthenticated, setAccessToken } from "../utils/auth.js";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const redirectTo = location.state?.from || "/profile";

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const handleLoginChange = (field) => (event) => {
    const value =
      field === "rememberMe" ? event.target.checked : event.target.value;
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterChange = (field) => (event) => {
    setRegisterForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data =
        mode === "login"
          ? await login({
              identifier: loginForm.identifier.trim(),
              password: loginForm.password,
              rememberMe: loginForm.rememberMe,
            })
          : await register({
              fullName: registerForm.fullName.trim(),
              email: registerForm.email.trim(),
              phone: registerForm.phone.trim(),
              password: registerForm.password,
            });

      setAccessToken(data.access_token);
      await refresh();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="auth">
      <div className="auth-card">
        <section className="auth-promo">
          <div className="auth-promo__brand">
            <div className="auth-promo__icon">
              <i className="bi bi-book"></i>
            </div>
            <span className="auth-promo__name">Библиотека</span>
          </div>
          <div className="auth-promo__content">
            <h1 className="auth-promo__title">Центральная библиотека</h1>
            <p className="auth-promo__subtitle">
              Откройте доступ к тысячам томов мировой литературы и научным
              архивам в один клик.
            </p>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__header">
            <h2 className="auth-panel__title">
              {isLogin ? "Вход в систему" : "Регистрация"}
            </h2>
            <p className="auth-panel__subtitle">
              {isLogin
                ? "Добро пожаловать в интеллектуальное пространство"
                : "Создайте учетную запись читателя"}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <div className="auth-field">
                  <label className="auth-field__label">Номер телефона</label>
                  <div className="auth-field__control">
                    <i className="bi bi-telephone"></i>
                    <input
                      className="auth-field__input"
                      type="text"
                      placeholder="+7 (900) 000-00-00"
                      value={loginForm.identifier}
                      onChange={handleLoginChange("identifier")}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-field__row">
                    <label className="auth-field__label">Пароль</label>
                    <button className="auth-link" type="button">
                      Забыли пароль?
                    </button>
                  </div>
                  <div className="auth-field__control">
                    <i className="bi bi-lock"></i>
                    <input
                      className="auth-field__input"
                      type="password"
                      placeholder="Введите пароль"
                      value={loginForm.password}
                      onChange={handleLoginChange("password")}
                      required
                    />
                  </div>
                </div>

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={handleLoginChange("rememberMe")}
                  />
                  Запомнить меня
                </label>
              </>
            ) : (
              <>
                <div className="auth-field">
                  <label className="auth-field__label">ФИО</label>
                  <div className="auth-field__control">
                    <i className="bi bi-person"></i>
                    <input
                      className="auth-field__input"
                      type="text"
                      placeholder="Иван Иванов"
                      value={registerForm.fullName}
                      onChange={handleRegisterChange("fullName")}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-field__label">Email</label>
                  <div className="auth-field__control">
                    <i className="bi bi-envelope"></i>
                    <input
                      className="auth-field__input"
                      type="email"
                      placeholder="name@example.com"
                      value={registerForm.email}
                      onChange={handleRegisterChange("email")}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-field__label">Номер телефона</label>
                  <div className="auth-field__control">
                    <i className="bi bi-telephone"></i>
                    <input
                      className="auth-field__input"
                      type="text"
                      placeholder="+7 (900) 000-00-00"
                      value={registerForm.phone}
                      onChange={handleRegisterChange("phone")}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-field__label">Пароль</label>
                  <div className="auth-field__control">
                    <i className="bi bi-lock"></i>
                    <input
                      className="auth-field__input"
                      type="password"
                      placeholder="Придумайте пароль"
                      value={registerForm.password}
                      onChange={handleRegisterChange("password")}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Пожалуйста, подождите..."
                : isLogin
                  ? "Войти"
                  : "Зарегистрироваться"}
            </button>
          </form>

          <div className="auth-footer">
            <span>{isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}</span>
            <button
              className="auth-link"
              type="button"
              onClick={() => setMode(isLogin ? "register" : "login")}
            >
              {isLogin ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
