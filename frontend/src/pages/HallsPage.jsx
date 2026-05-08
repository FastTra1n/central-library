import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import HallCard from "../components/HallCard.jsx";

const halls = [
  {
    id: 1,
    name: "Главный читальный зал",
    specialization: "Общий",
    status: "Открыто",
    statusType: "open",
    occupied: 42,
    capacity: 120,
    tags: ["Wi-Fi", "Тихая зона"],
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Медиатека",
    specialization: "Мультимедиа",
    status: "Открыто",
    statusType: "open",
    occupied: 15,
    capacity: 40,
    tags: ["Компьютеры", "Печать"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Зал редких книг",
    specialization: "История и редкие издания",
    status: "Ограничено",
    statusType: "limited",
    occupied: 4,
    capacity: 12,
    tags: ["Просмотр по записи", "Полная тишина"],
    image:
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Зал периодики",
    specialization: "Периодические издания",
    status: "Открыто",
    statusType: "open",
    occupied: 28,
    capacity: 60,
    tags: ["Лаунж-зона", "Свежая пресса"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
  },
];

const totalSeats = halls.reduce((sum, hall) => sum + hall.capacity, 0);
const occupiedSeats = halls.reduce((sum, hall) => sum + hall.occupied, 0);
const freeSeats = totalSeats - occupiedSeats;
const utilization = totalSeats
  ? Math.round((occupiedSeats / totalSeats) * 100)
  : 0;

const HallsPage = () => {
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
              <p className="halls__subtitle">
                Исследуйте пространства для работы и чтения. Выберите зал по
                специализации и доступным местам.
              </p>
            </div>

            <div className="halls__body">
              <div className="halls__grid">
                {halls.map((hall) => (
                  <HallCard key={hall.id} hall={hall} />
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
      </div>
    </div>
  );
};

export default HallsPage;
