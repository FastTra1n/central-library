import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMe } from "../api/auth.js";
import { clearAccessToken, isAuthenticated } from "../utils/auth.js";

const AuthContext = createContext({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const data = await getMe();
      setUser(data);
      return data;
    } catch (err) {
      clearAccessToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
