import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  initCometChat,
  loginUser,
  logoutUser,
  getLoggedInUser,
} from "../services/cometchat";

interface AuthContextType {
  user: CometChat.User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CometChat.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initCometChat();
        setInitialized(true);
        const loggedIn = await getLoggedInUser();
        if (loggedIn) setUser(loggedIn);
      } catch (err: any) {
        setError(err?.message || "Failed to initialize CometChat");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await loginUser(uid.toLowerCase().trim());
      setUser(loggedUser);
    } catch (err: any) {
      const msg =
        err?.message ||
        (err?.code === "ERR_UID_NOT_FOUND"
          ? "User not found. Please check the UID."
          : "Login failed. Please try again.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, initialized, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
