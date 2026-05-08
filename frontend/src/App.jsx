import { useState } from "react";
import CatalogPage from "./pages/CatalogPage.jsx";
import HallsPage from "./pages/HallsPage.jsx";

const pages = {
  catalog: CatalogPage,
  halls: HallsPage,
};

const App = () => {
  const [activePage, setActivePage] = useState("catalog");
  const CurrentPage = pages[activePage] ?? CatalogPage;

  const handleNavigate = (page) => {
    if (pages[page]) {
      setActivePage(page);
    }
  };

  return <CurrentPage onNavigate={handleNavigate} />;
};

export default App;
