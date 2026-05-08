import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";

const PlaceholderPage = ({ title }) => {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск книг или авторов..." />
        <main className="layout__content">
          <section className="placeholder">
            <h1 className="placeholder__title">{title}</h1>
            <p className="placeholder__subtitle">Раздел в разработке...</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PlaceholderPage;
