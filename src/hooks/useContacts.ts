import { useState, useEffect, useCallback } from "react";
import {
  CometChat,
  fetchUsers,
  fetchGroups,
  createGroup,
  joinGroup,
  fetchGroupMembers,
} from "../services/cometchat";
import { useAuth } from "../context/AuthContext";

const PRESENCE_LISTENER_ID = "PRESENCE_" + Date.now();

export const useContacts = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<CometChat.User[]>([]);
  const [groups, setGroups] = useState<CometChat.Group[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const list = await fetchUsers();
      setUsers(list.filter((u) => u.getUid() !== user.getUid()));
    } catch (e) {
      console.error("fetchUsers error:", e);
    } finally {
      setLoadingUsers(false);
    }
  }, [user]);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    setLoadingGroups(true);
    try {
      const list = await fetchGroups();
      setGroups(list);
    } catch (e) {
      console.error("fetchGroups error:", e);
    } finally {
      setLoadingGroups(false);
    }
  }, [user]);

  useEffect(() => {
    loadUsers();
    loadGroups();
  }, [loadUsers, loadGroups]);

  // Presence listener
  useEffect(() => {
    if (!user) return;
    CometChat.addUserListener(
      PRESENCE_LISTENER_ID,
      new CometChat.UserListener({
        onUserOnline: (onlineUser: CometChat.User) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.getUid() === onlineUser.getUid() ? onlineUser : u
            )
          );
        },
        onUserOffline: (offlineUser: CometChat.User) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.getUid() === offlineUser.getUid() ? offlineUser : u
            )
          );
        },
      })
    );
    return () => CometChat.removeUserListener(PRESENCE_LISTENER_ID);
  }, [user]);

  const handleCreateGroup = async (
    name: string,
    description: string,
    type: string
  ) => {
    const guid =
      "group_" + name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const group = await createGroup(guid, name, type, description);
    setGroups((prev) => [...prev, group]);
    return group;
  };

  const handleJoinGroup = async (guid: string, type: string) => {
    const group = await joinGroup(guid, type);
    setGroups((prev) => prev.map((g) => (g.getGuid() === guid ? group : g)));
    return group;
  };

  const getGroupMembers = async (guid: string) => {
    return fetchGroupMembers(guid);
  };

  return {
    users,
    groups,
    loadingUsers,
    loadingGroups,
    reloadUsers: loadUsers,
    reloadGroups: loadGroups,
    createGroup: handleCreateGroup,
    joinGroup: handleJoinGroup,
    getGroupMembers,
  };
};
