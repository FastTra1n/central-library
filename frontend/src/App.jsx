import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import HallsPage from "./pages/HallsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import BooksManagementPage from "./pages/BooksManagementPage.jsx";
import UsersManagementPage from "./pages/UsersManagementPage.jsx";

import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/halls" element={<HallsPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/books"
          element={
            <ProtectedRoute roles={["Librarian", "Admin"]}>
              <BooksManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
