import { CometChat } from "@cometchat/chat-sdk-javascript";

const APP_ID = process.env.REACT_APP_COMETCHAT_APP_ID!;
const AUTH_KEY = process.env.REACT_APP_COMETCHAT_AUTH_KEY!;
const REGION = process.env.REACT_APP_COMETCHAT_REGION || "us";

// ─── Init ────────────────────────────────────────────────────────────────────

export const initCometChat = async (): Promise<boolean> => {
  const appSettings = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(REGION)
    .autoEstablishSocketConnection(true)
    .build();
  return CometChat.init(APP_ID, appSettings);
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (uid: string): Promise<CometChat.User> =>
  CometChat.login(uid, AUTH_KEY);

export const logoutUser = async (): Promise<void> => {
  await CometChat.logout();
};

export const getLoggedInUser = async (): Promise<CometChat.User | null> =>
  CometChat.getLoggedinUser();

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchUsers = async (): Promise<CometChat.User[]> => {
  const request = new CometChat.UsersRequestBuilder()
    .setLimit(50)
    .hideBlockedUsers(true)
    .build();
  return request.fetchNext();
};

// ─── Groups ──────────────────────────────────────────────────────────────────

export const fetchGroups = async (): Promise<CometChat.Group[]> => {
  const request = new CometChat.GroupsRequestBuilder()
    .setLimit(50)
    .joinedOnly(false)
    .build();
  return request.fetchNext();
};

export const createGroup = async (
  guid: string,
  name: string,
  type: string = CometChat.GROUP_TYPE.PUBLIC,
  description: string = ""
): Promise<CometChat.Group> => {
  const group = new CometChat.Group(guid, name, type, "");
  group.setDescription(description);
  return CometChat.createGroup(group);
};

export const joinGroup = async (
  guid: string,
  type: string = CometChat.GROUP_TYPE.PUBLIC,
  password: string = ""
): Promise<CometChat.Group> =>
  CometChat.joinGroup(guid, type as any, password);

export const leaveGroup = async (guid: string): Promise<boolean> =>
  CometChat.leaveGroup(guid);

export const fetchGroupMembers = async (
  guid: string
): Promise<CometChat.GroupMember[]> => {
  const request = new CometChat.GroupMembersRequestBuilder(guid)
    .setLimit(30)
    .build();
  return request.fetchNext();
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const fetchMessages = async (
  receiverID: string,
  receiverType: string
): Promise<CometChat.BaseMessage[]> => {
  let builder = new CometChat.MessagesRequestBuilder().setLimit(50);

  if (receiverType === CometChat.RECEIVER_TYPE.GROUP) {
    builder = builder.setGUID(receiverID);
  } else {
    builder = builder.setUID(receiverID);
  }

  const request = builder.build();
  return request.fetchPrevious();
};

export const sendTextMessage = async (
  receiverID: string,
  receiverType: string,
  text: string
): Promise<CometChat.TextMessage> => {
  const message = new CometChat.TextMessage(receiverID, text, receiverType);
  return CometChat.sendMessage(message) as Promise<CometChat.TextMessage>;
};

export const markAsRead = async (
  messageId: number,
  receiverID: string,
  receiverType: string,
  senderUID: string
): Promise<void> => {
  await CometChat.markAsRead(
    messageId.toString(),
    receiverID,
    receiverType,
    senderUID
  );
};

// ─── Typing ──────────────────────────────────────────────────────────────────

export const sendTypingStarted = (receiverID: string, receiverType: string) => {
  const t = new CometChat.TypingIndicator(receiverID, receiverType);
  CometChat.startTyping(t);
};

export const sendTypingEnded = (receiverID: string, receiverType: string) => {
  const t = new CometChat.TypingIndicator(receiverID, receiverType);
  CometChat.endTyping(t);
};

export { CometChat };
