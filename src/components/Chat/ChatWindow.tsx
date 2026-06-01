import React, { useRef, useEffect, useState, useCallback } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useMessages } from "../../hooks/useMessages";
import { sendTypingStarted, sendTypingEnded } from "../../services/cometchat";
import styles from "./ChatWindow.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const formatTime = (ts: number) => {
  const d = new Date(ts * 1000);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${ampm}`;
};

const formatDate = (ts: number) => {
  const d = new Date(ts * 1000);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) => {
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#00e5ff", "#7c3aed", "#00ff88", "#ff6b00", "#ff0066", "#0077ff"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return avatar ? (
    <img src={avatar} alt={name} className={styles.avatarImg} style={{ width: size, height: size }} />
  ) : (
    <div
      className={styles.avatarFallback}
      style={{ width: size, height: size, background: `${color}22`, color, border: `1.5px solid ${color}44` }}
    >
      {initials}
    </div>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────

interface MsgProps {
  msg: CometChat.BaseMessage;
  isMine: boolean;
  showSender: boolean;
  prevMsg?: CometChat.BaseMessage;
}

const MessageBubble = ({ msg, isMine, showSender, prevMsg }: MsgProps) => {
  const sentAt = msg.getSentAt();
  const sender = msg.getSender();
  const senderName = sender?.getName() || "Unknown";
  const senderAvatar = sender?.getAvatar();

  const showDate = !prevMsg || formatDate(prevMsg.getSentAt()) !== formatDate(sentAt);

  const text =
    msg.getType() === "text"
      ? (msg as CometChat.TextMessage).getText()
      : `[${msg.getType()}]`;

  return (
    <>
      {showDate && (
        <div className={styles.dateDivider}>
          <span>{formatDate(sentAt)}</span>
        </div>
      )}
      <div className={`${styles.msgRow} ${isMine ? styles.msgMine : ""}`}>
        {!isMine && (
          <div className={styles.msgAvatar}>
            {showSender ? (
              <Avatar name={senderName} avatar={senderAvatar} size={32} />
            ) : (
              <div style={{ width: 32 }} />
            )}
          </div>
        )}
        <div className={styles.msgContent}>
          {showSender && !isMine && (
            <div className={styles.msgMeta}>
              <span className={styles.msgSender}>{senderName}</span>
              <span className={styles.msgTime}>{formatTime(sentAt)}</span>
            </div>
          )}
          <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
            <span className={styles.bubbleText}>{text}</span>
            {isMine && (
              <span className={styles.msgTimeInline}>{formatTime(sentAt)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator = ({ uids }: { uids: Set<string> }) => {
  const arr = Array.from(uids);
  if (arr.length === 0) return null;
  const names = arr.join(", ");
  return (
    <div className={styles.typing}>
      <div className={styles.typingDots}>
        <span /><span /><span />
      </div>
      <span>{names} {arr.length > 1 ? "are" : "is"} typing…</span>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 12C8 9.79 9.79 8 12 8h24c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4h-6l-8 6v-6h-6c-2.21 0-4-1.79-4-4V12z" stroke="url(#emptyGrad)" strokeWidth="2"/>
        <circle cx="17" cy="20" r="2" fill="url(#emptyGrad)" opacity="0.6"/>
        <circle cx="24" cy="20" r="2" fill="url(#emptyGrad)" opacity="0.6"/>
        <circle cx="31" cy="20" r="2" fill="url(#emptyGrad)" opacity="0.6"/>
        <defs>
          <linearGradient id="emptyGrad" x1="8" y1="8" x2="40" y2="40">
            <stop stopColor="#00e5ff"/><stop offset="1" stopColor="#7c3aed"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <h3>Select a conversation</h3>
    <p>Choose a contact or channel from the sidebar to start chatting</p>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const ChatWindow = () => {
  const { user } = useAuth();
  const { activeConversation } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const receiverType = activeConversation?.type === "group"
    ? CometChat.RECEIVER_TYPE.GROUP
    : CometChat.RECEIVER_TYPE.USER;

  const { messages, loading, sending, typingUsers, sendMessage } = useMessages(
    activeConversation?.id || null,
    activeConversation ? receiverType : null
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeConversation) return;
    const text = input.trim();
    setInput("");
    if (isTyping.current) {
      sendTypingEnded(activeConversation.id, receiverType);
      isTyping.current = false;
    }
    try { await sendMessage(text); } catch (e) { console.error(e); }
  }, [input, activeConversation, sendMessage, receiverType]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!activeConversation) return;
    if (!isTyping.current) {
      isTyping.current = true;
      sendTypingStarted(activeConversation.id, receiverType);
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      sendTypingEnded(activeConversation.id, receiverType);
      isTyping.current = false;
    }, 2000);
  };

  if (!activeConversation) return <div className={styles.window}><EmptyState /></div>;

  const groupedMessages = messages.map((msg, idx) => {
    const prev = messages[idx - 1];
    const showSender =
      !prev ||
      prev.getSender()?.getUid() !== msg.getSender()?.getUid() ||
      msg.getSentAt() - prev.getSentAt() > 300;
    return { msg, showSender };
  });

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {activeConversation.type === "group" ? (
            <div className={styles.channelIcon}>#</div>
          ) : (
            <div className={styles.dmDot} />
          )}
          <div>
            <div className={styles.headerName}>{activeConversation.name}</div>
            {activeConversation.type === "group" && activeConversation.membersCount && (
              <div className={styles.headerSub}>{activeConversation.membersCount} members</div>
            )}
            {activeConversation.type === "user" && (
              <div className={styles.headerSub}>Direct Message</div>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.headerBtn} title="Members">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 14c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M11 10c1.5.3 3 1.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loadSpinner} />
            <span>Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.conversationStart}>
            <div className={styles.startIcon}>
              {activeConversation.type === "group" ? "#" : "💬"}
            </div>
            <h3>
              {activeConversation.type === "group"
                ? `Welcome to #${activeConversation.name}`
                : `Start a conversation with ${activeConversation.name}`}
            </h3>
            <p>
              {activeConversation.type === "group"
                ? (activeConversation.description || "This is the beginning of this channel.")
                : "Say hello!"}
            </p>
          </div>
        ) : (
          groupedMessages.map(({ msg, showSender }, idx) => (
            <MessageBubble
              key={String(msg.getId())}
              msg={msg}
              isMine={msg.getSender()?.getUid() === user?.getUid()}
              showSender={showSender}
              prevMsg={messages[idx - 1]}
            />
          ))
        )}
        <TypingIndicator uids={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <textarea
            className={styles.input}
            placeholder={
              activeConversation.type === "group"
                ? `Message #${activeConversation.name}`
                : `Message ${activeConversation.name}`
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <span className={styles.sendSpinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 9l13-7-5 7 5 7-13-7z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
        <div className={styles.inputHint}>
          <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
