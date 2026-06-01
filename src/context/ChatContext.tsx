import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { ActiveConversation } from "../types";

interface ChatContextType {
  activeConversation: ActiveConversation | null;
  setActiveConversation: (c: ActiveConversation | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ChatContext.Provider
      value={{
        activeConversation,
        setActiveConversation,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
