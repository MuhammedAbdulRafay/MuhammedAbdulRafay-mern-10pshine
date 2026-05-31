import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const applyUser = useCallback((nextUser) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/users/me");
      applyUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [applyUser]);

  const updateUser = useCallback(
    async (payload) => {
      const response = await api.put("/users/profile", payload);
      applyUser(response.data.user);
      return response.data.user;
    },
    [applyUser]
  );

  const clearUser = useCallback(() => {
    setUser(null);
    setStoredUser(null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        refreshUser,
        updateUser,
        applyUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
