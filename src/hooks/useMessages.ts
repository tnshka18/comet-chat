import { useState, useEffect, useCallback, useRef } from "react";
import {
  CometChat,
  fetchMessages,
  sendTextMessage,
  markAsRead,
} from "../services/cometchat";
import { useAuth } from "../context/AuthContext";

const LISTENER_ID = "MSG_LISTENER_" + Date.now();

export const useMessages = (
  receiverID: string | null,
  receiverType: string | null
) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CometChat.BaseMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!receiverID || !receiverType) { setMessages([]); return; }
    setMessages([]);
    setLoading(true);
    fetchMessages(receiverID, receiverType)
      .then((msgs) => {
        setMessages(msgs);
        if (msgs.length > 0 && user) {
          const last = msgs[msgs.length - 1];
          const lastId = last.getId();
          if (typeof lastId === "number" && last.getSender()?.getUid() !== user.getUid()) {
            markAsRead(lastId, receiverID, receiverType, last.getSender()?.getUid() || "").catch(() => {});
          }
        }
      })
      .catch((e) => console.error("fetchMessages error:", e))
      .finally(() => setLoading(false));
  }, [receiverID, receiverType, user]);

  useEffect(() => {
    if (!receiverID || !receiverType || !user) return;
    const id = `${LISTENER_ID}_${receiverID}`;

    CometChat.addMessageListener(
      id,
      new CometChat.MessageListener({
        onTextMessageReceived: (msg: CometChat.TextMessage) => {
          const isRelevant =
            receiverType === CometChat.RECEIVER_TYPE.GROUP
              ? msg.getReceiverId() === receiverID
              : msg.getSender()?.getUid() === receiverID || msg.getReceiverId() === receiverID;
          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
            const id = msg.getId();
            if (typeof id === "number") {
              markAsRead(id, receiverID, receiverType, msg.getSender()?.getUid() || "").catch(() => {});
            }
          }
        },
        onTypingStarted: (indicator: CometChat.TypingIndicator) => {
          if (indicator.getReceiverId() === receiverID) {
            const uid = indicator.getSender().getUid();
            setTypingUsers((prev) => prev.includes(uid) ? prev : [...prev, uid]);
          }
        },
        onTypingEnded: (indicator: CometChat.TypingIndicator) => {
          if (indicator.getReceiverId() === receiverID) {
            const uid = indicator.getSender().getUid();
            setTypingUsers((prev) => prev.filter((u) => u !== uid));
          }
        },
      })
    );

    return () => { CometChat.removeMessageListener(id); };
  }, [receiverID, receiverType, user]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!receiverID || !receiverType || !text.trim()) return;
      setSending(true);
      try {
        const msg = await sendTextMessage(receiverID, receiverType, text.trim());
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error("sendMessage error:", e);
        throw e;
      } finally {
        setSending(false);
      }
    },
    [receiverID, receiverType]
  );

  const typingUsersSet = new Set(typingUsers);

  return { messages, loading, sending, typingUsers: typingUsersSet, sendMessage };
};
