import React, { useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useContacts } from "../../hooks/useContacts";
import { ActiveConversation } from "../../types";
import CreateGroupModal from "../Modals/CreateGroupModal";
import styles from "./Sidebar.module.css";

type Tab = "dms" | "groups";

const Avatar = ({
  name,
  avatar,
  size = 32,
  online,
}: {
  name: string;
  avatar?: string;
  size?: number;
  online?: boolean;
}) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "#00e5ff", "#7c3aed", "#00ff88", "#ff6b00",
    "#ff0066", "#0077ff", "#ffd700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={styles.avatarWrap} style={{ width: size, height: size }}>
      {avatar ? (
        <img src={avatar} alt={name} className={styles.avatarImg} />
      ) : (
        <div
          className={styles.avatarInitials}
          style={{ background: `${color}22`, color, border: `1.5px solid ${color}44` }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`${styles.presence} ${online ? styles.online : styles.offline}`} />
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { activeConversation, setActiveConversation } = useChat();
  const { users, groups, loadingUsers, loadingGroups, createGroup } = useContacts();
  const [tab, setTab] = useState<Tab>("dms");
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const selectConversation = (conv: ActiveConversation) => {
    setActiveConversation(conv);
  };

  const filteredUsers = users.filter((u) =>
    u.getName().toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.getName().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-3l-5 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="url(#sideGrad)"/>
                <defs>
                  <linearGradient id="sideGrad" x1="4" y1="4" x2="24" y2="28">
                    <stop stopColor="#00e5ff"/><stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className={styles.brandName}>CometChat</span>
          </div>
        </div>

        {/* Me */}
        <div className={styles.meSection}>
          <Avatar name={user?.getName() || "You"} avatar={user?.getAvatar()} size={36} online />
          <div className={styles.meInfo}>
            <span className={styles.meName}>{user?.getName()}</span>
            <span className={styles.meUid}>@{user?.getUid()}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.search}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "dms" ? styles.tabActive : ""}`}
            onClick={() => setTab("dms")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 14c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M11 10c1.5.3 3 1.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Direct
          </button>
          <button
            className={`${styles.tab} ${tab === "groups" ? styles.tabActive : ""}`}
            onClick={() => setTab("groups")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Groups
          </button>
        </div>

        {/* List */}
        <div className={styles.list}>
          {tab === "dms" && (
            <>
              <div className={styles.sectionHeader}>
                <span>Direct Messages</span>
                <span className={styles.count}>{filteredUsers.length}</span>
              </div>
              {loadingUsers ? (
                <div className={styles.skeletons}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.skeleton} />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.empty}>
                  <span>No users found</span>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isActive =
                    activeConversation?.id === u.getUid() &&
                    activeConversation?.type === "user";
                  const isOnline = u.getStatus() === "online";
                  return (
                    <button
                      key={u.getUid()}
                      className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                      onClick={() =>
                        selectConversation({
                          id: u.getUid(),
                          name: u.getName(),
                          type: "user",
                          avatar: u.getAvatar(),
                        })
                      }
                    >
                      <Avatar
                        name={u.getName()}
                        avatar={u.getAvatar()}
                        size={34}
                        online={isOnline}
                      />
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{u.getName()}</span>
                        <span className={`${styles.itemSub} ${isOnline ? styles.onlineText : ""}`}>
                          {isOnline ? "● online" : "offline"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}

          {tab === "groups" && (
            <>
              <div className={styles.sectionHeader}>
                <span>Channels</span>
                <button
                  className={styles.addBtn}
                  onClick={() => setShowCreateGroup(true)}
                  title="Create channel"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              {loadingGroups ? (
                <div className={styles.skeletons}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.skeleton} />
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className={styles.empty}>
                  <span>No channels yet</span>
                  <button
                    className={styles.emptyCreate}
                    onClick={() => setShowCreateGroup(true)}
                  >
                    + Create one
                  </button>
                </div>
              ) : (
                filteredGroups.map((g) => {
                  const isActive =
                    activeConversation?.id === g.getGuid() &&
                    activeConversation?.type === "group";
                  return (
                    <button
                      key={g.getGuid()}
                      className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                      onClick={() =>
                        selectConversation({
                          id: g.getGuid(),
                          name: g.getName(),
                          type: "group",
                          description: g.getDescription(),
                          membersCount: g.getMembersCount(),
                        })
                      }
                    >
                      <div className={styles.groupIcon}>
                        <span>#</span>
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{g.getName()}</span>
                        <span className={styles.itemSub}>
                          {g.getMembersCount()} member{g.getMembersCount() !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      </aside>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (name, desc, type) => {
            const group = await createGroup(name, desc, type);
            setShowCreateGroup(false);
            setActiveConversation({
              id: group.getGuid(),
              name: group.getName(),
              type: "group",
              description: group.getDescription(),
              membersCount: group.getMembersCount(),
            });
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
