import { CometChat } from "@cometchat/chat-sdk-javascript";

export type ConversationType = "user" | "group";

export interface ActiveConversation {
  id: string;
  name: string;
  type: ConversationType;
  avatar?: string;
  description?: string;
  membersCount?: number;
}

export interface AppUser {
  uid: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline";
  lastActiveAt?: number;
}

export interface Message {
  id: number | string;
  text: string;
  senderUID: string;
  senderName: string;
  senderAvatar?: string;
  sentAt: number;
  type: string;
  receiverID: string;
  receiverType: string;
  readAt?: number;
  deliveredAt?: number;
}

export type CometChatMessage = CometChat.BaseMessage;

export interface Group {
  guid: string;
  name: string;
  type: string;
  description?: string;
  membersCount?: number;
  hasJoined?: boolean;
  icon?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CometChat.User | null;
  loading: boolean;
  error: string | null;
}
