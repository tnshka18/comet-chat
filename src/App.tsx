import React from "react";
import { useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./components/Auth/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWindow from "./components/Chat/ChatWindow";
import "./styles/globals.css";
import styles from "./App.module.css";

const AppShell = () => (
  <div className={styles.shell}>
    <Sidebar />
    <ChatWindow />
  </div>
);

const App = () => {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <div className={styles.initScreen}>
        <div className={styles.initLogo}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-3l-5 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="url(#initGrad)"/>
            <defs>
              <linearGradient id="initGrad" x1="4" y1="4" x2="24" y2="28">
                <stop stopColor="#00e5ff"/><stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.initName}>CometChat</span>
        </div>
        <div className={styles.initSpinner} />
        <p className={styles.initText}>Connecting…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <ChatProvider>
      <AppShell />
    </ChatProvider>
  );
};

export default App;
