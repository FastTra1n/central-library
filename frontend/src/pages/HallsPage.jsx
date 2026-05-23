import { useEffect, useMemo, useState } from "react";

import { getFreeSeats } from "../api/analytics.js";
import { getHalls } from "../api/halls.js";
import HallCard from "../components/HallCard.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";

const fallbackImage =
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80";

const HallsPage = () => {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      setError("");
      try {
        const [hallsData, freeSeatsData] = await Promise.all([
          getHalls(),
          getFreeSeats().catch(() => []),
        ]);

        const freeMap = new Map(
          (freeSeatsData || []).map((item) => [item.hall_id, item]),
        );

        const mapped = hallsData.map((hall) => {
          const freeInfo = freeMap.get(hall.id);
          const capacity = hall.seats ?? 0;
          const occupied = freeInfo?.occupied ?? 0;
          const free =
            freeInfo?.free ?? (capacity ? Math.max(capacity - occupied, 0) : 0);
          const hasSeats = hall.seats !== null && hall.seats !== undefined;
          const status = hasSeats
            ? free > 0
              ? "Открыто"
              : "Закрыто"
            : "Открыто";
          const statusType = hasSeats ? (free > 0 ? "open" : "closed") : "open";

          return {
            ...hall,
            occupied,
            capacity: capacity || occupied,
            free,
            status,
            statusType,
            tags: hall.specialization ? [hall.specialization] : [],
          };
        });

        setHalls(mapped);
      } catch (err) {
        setError(err.message || "Не удалось загрузить залы");
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const totalSeats = halls.reduce((sum, hall) => sum + (hall.capacity || 0), 0);
  const occupiedSeats = halls.reduce(
    (sum, hall) => sum + (hall.occupied || 0),
    0,
  );
  const freeSeats = Math.max(totalSeats - occupiedSeats, 0);
  const utilization = totalSeats
    ? Math.round((occupiedSeats / totalSeats) * 100)
    : 0;

  const handleOpenDetails = (hall) => {
    setSelectedHall(hall);
  };

  const handleCloseDetails = () => {
    setSelectedHall(null);
  };

  const summaryText = useMemo(() => {
    if (loading) return "Загружаем данные о залах...";
    if (error) return error;
    return "Исследуйте пространства для работы и чтения. Выберите зал по специализации и доступным местам.";
  }, [loading, error]);

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск залов или специализаций..." />
        <main className="layout__content">
          <section className="halls">
            <div className="halls__header">
              <h1 className="halls__title">Библиотечные залы</h1>
              <p className="halls__subtitle">{summaryText}</p>
            </div>

            <div className="halls__body">
              <div className="halls__grid">
                {halls.map((hall) => (
                  <HallCard
                    key={hall.id}
                    hall={hall}
                    onDetails={handleOpenDetails}
                  />
                ))}
              </div>

              <aside className="halls__aside">
                <div className="halls-panel">
                  <div className="halls-panel__title">
                    Сводка по залам
                    <span className="halls-panel__badge">{halls.length}</span>
                  </div>
                  <div className="halls-panel__list">
                    <div className="halls-panel__item">
                      <span className="halls-panel__label">Всего мест</span>
                      <span className="halls-panel__value">{totalSeats}</span>
                    </div>
                    <div className="halls-panel__item">
                      <span className="halls-panel__label">Свободно</span>
                      <span className="halls-panel__value">{freeSeats}</span>
                    </div>
                    <div className="halls-panel__item">
                      <span className="halls-panel__label">Заполненность</span>
                      <span className="halls-panel__value">{utilization}%</span>
                    </div>
                  </div>
                </div>

                <div className="halls-note">
                  <i className="bi bi-info-circle halls-note__icon"></i>
                  <span>
                    Запись в зал оформляется библиотекарем. Для изменения зала
                    обратитесь к сотруднику в холле.
                  </span>
                </div>
              </aside>
            </div>
          </section>
        </main>

        {selectedHall && (
          <div className="details-panel" onClick={handleCloseDetails}>
            <aside
              className="details-panel__drawer details-panel__drawer--hall"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="details-panel__close"
                type="button"
                onClick={handleCloseDetails}
                aria-label="Закрыть"
              >
                <i className="bi bi-x"></i>
              </button>
              <div
                className="details-panel__cover"
                style={{
                  backgroundImage: `url(${selectedHall.image || fallbackImage})`,
                }}
              >
                <span
                  className={`details-panel__badge details-panel__badge--${selectedHall.statusType}`}
                >
                  {selectedHall.status}
                </span>
              </div>
              <h2 className="details-panel__title">{selectedHall.name}</h2>
              <p className="details-panel__author">
                {selectedHall.specialization || "Общий"}
              </p>
              <div className="details-panel__stats">
                <div className="details-panel__stat">
                  <span className="details-panel__stat-value">
                    {selectedHall.free ?? "—"}
                  </span>
                  <span className="details-panel__stat-label">
                    свободных мест
                  </span>
                </div>
                <div className="details-panel__divider"></div>
                <div className="details-panel__stat">
                  <span className="details-panel__stat-value">
                    {selectedHall.capacity || "—"}
                  </span>
                  <span className="details-panel__stat-label">всего мест</span>
                </div>
              </div>
              <div className="details-panel__section">
                <h3 className="details-panel__section-title">О зале</h3>
                <p className="details-panel__text">
                  {selectedHall.description ||
                    "Комфортное пространство для работы и чтения."}
                </p>
              </div>
              <div className="details-panel__section">
                <h3 className="details-panel__section-title">Особенности</h3>
                <div className="details-panel__tags">
                  {(selectedHall.tags?.length
                    ? selectedHall.tags
                    : ["Тихая зона"]
                  ).map((tag) => (
                    <span key={tag} className="details-panel__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallsPage;
