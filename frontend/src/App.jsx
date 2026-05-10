import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import HallsPage from "./pages/HallsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import BooksManagementPage from "./pages/BooksManagementPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/halls" element={<HallsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<PlaceholderPage title="История" />} />
        <Route path="/books" element={<BooksManagementPage />} />
        <Route
          path="/users"
          element={<PlaceholderPage title="Управление пользователями" />}
        />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
