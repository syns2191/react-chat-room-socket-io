import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { useSocket } from "../provider/socketProvider";
import { useAuth } from "../provider/authProvider";
import { format } from 'date-fns';

import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ChatBubbleOvalLeftIcon from '@heroicons/react/24/solid/ChatBubbleOvalLeftIcon';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';

function Avatar({ name, size = "md" }) {
  const initials = name?.charAt(0)?.toUpperCase() || "?";
  const sizes = { sm: "w-6 h-6 text-[10px]", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-sky-700 flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

const FriendsComponent = ({ openConversation, refreshKey }) => {
  const [friendList, setFriendList] = useState([]);

  async function loadFriends() {
    try {
      const result = await api.get('/friends');
      if (result?.data) setFriendList(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { loadFriends(); }, [refreshKey]);

  return (
    <div className="w-full px-2">
      {friendList.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">No friends yet</p>
      )}
      {friendList.map((f) => (
        <div key={f.friendId} className="flex items-center gap-3 py-3 border-b border-sky-800">
          <Avatar name={f.user?.name} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-slate-100 truncate">{f.user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{f.user?.email}</p>
          </div>
          <button
            onClick={() => openConversation(f)}
            className="p-1.5 rounded-full hover:bg-sky-800 text-sky-300 hover:text-white transition-colors cursor-pointer"
            title="Start chat"
          >
            <ChatBubbleOvalLeftIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const InvitedListComponent = ({ currentUserId, acceptFriend, rejectFriend, refreshKey }) => {
  const [invitingList, setInvitingList] = useState([]);

  async function loadInvitation() {
    try {
      const result = await api.get('/friends/invitations');
      if (result?.data) {
        const listInvitation = result.data.map((i) => {
          i.friend = i.addresser?.id === currentUserId ? i.requester : i.addresser;
          return i;
        });
        setInvitingList(listInvitation);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { loadInvitation(); }, [refreshKey]);

  return (
    <div className="w-full px-2">
      {invitingList.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">No pending requests</p>
      )}
      {invitingList.map((f) => (
        <div key={f.id} className="flex items-center gap-3 py-3 border-b border-sky-800">
          <Avatar name={f.friend?.name} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-slate-100 truncate">{f.friend?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{f.friend?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            {f.requester.id === currentUserId ? (
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-400 text-amber-900 font-medium">{f.status}</span>
            ) : (
              <>
                <button
                  onClick={() => acceptFriend(f)}
                  className="p-1 rounded-full hover:bg-sky-800 text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                  title="Accept"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => rejectFriend(f)}
                  className="p-1 rounded-full hover:bg-sky-800 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Reject"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Chat() {
  const socket = useSocket();
  const { setToken } = useAuth();
  const messageContainerRef = useRef(null);
  const [pageActive, setPageActive] = useState('left');

  const [curruntUser, setCurrentUser] = useState({ name: '', id: '', email: '', room_id: '' });
  const [conversations, setConversation] = useState([]);
  const [activeConversation, setActiveConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [textTyped, setTextTyped] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showInvitePopover, setShowInvitePopover] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const invitePopoverRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [friendInput, setFriendInput] = useState('');
  const [friendFound, setFriendFound] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [readyState, setReadyState] = useState(socket.connected);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { icon: UserGroupIcon, label: 'Friends' },
    { icon: UserPlusIcon, label: 'Requests' },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (invitePopoverRef.current && !invitePopoverRef.current.contains(e.target))
        setShowInvitePopover(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function searchFriend() {
    if (!friendInput.trim()) return;
    try {
      const result = await api.get(`/friends/get-by-email?email=${friendInput}`);
      if (result.data) setFriendFound(result.data);
    } catch (error) {}
  }

  async function inviteFriend(data) {
    try {
      const result = await api.post('/friends/invite', { addresser: data.id });
      if (result.data) {
        setShowInvitePopover(false);
        setFriendInput('');
        setFriendFound([]);
        setActiveTab(1);
        setRefreshKey(k => k + 1);
      }
    } catch (error) { console.log(error); }
  }

  async function acceptFriend(data) {
    try {
      const result = await api.patch(`/friends/${data.id}/accept`);
      if (result.data) setRefreshKey(k => k + 1);
    } catch (error) {}
  }

  async function rejectFriend(data) {
    try {
      const result = await api.patch(`/friends/${data.id}/reject`);
      if (result.data) setRefreshKey(k => k + 1);
    } catch (error) {}
  }

  function onConnect() { setReadyState(true); }
  function onDisconnect() { setReadyState(false); }

  async function getCurrentUser() {
    const user = await api.get('/users/me');
    if (user?.data) setCurrentUser(user.data);
  }

  function updateConversation(msg) {
    setConversation((prev) => {
      const exist = prev.find((c) => c.id === msg?.data?.conversationId);
      let updated = prev;
      if (exist) {
        updated = prev.map((c) =>
          c.id === msg?.data?.conversationId
            ? { ...c, lastMessage: msg?.data?.message, lastMessageAt: new Date(), unread: (c.unread || 0) + 1 }
            : c
        );
      } else {
        updated = [...prev, {
          id: msg?.data?.conversationId,
          type: 'private',
          lastMessageAt: new Date(),
          lastMessage: msg?.data?.message,
          unread: 1,
          participants: [{ id: msg?.data?.user?.id, name: msg?.data?.user?.name, email: msg?.data?.user?.email }],
          from: { id: msg?.data?.user?.id, name: msg?.data?.user?.name, email: msg?.data?.user?.email }
        }];
      }
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  }

  function listenNotification() {
    socket.off('new:notification');
    socket.on('new:notification', (data) => { updateConversation(data); });
  }

  function updateMessages(data) {
    setMessages((prev) => [...prev, {
      message: data.message,
      conversationId: data.conversationId,
      from: data.from,
      createdAt: data.createdAt
    }]);
  }

  function listenNewChat(conv) {
    socket.emit('join:room', { roomId: conv.id });
    socket.off('message:new');
    socket.on('message:new', (msg) => { updateMessages(msg); });
  }

  async function getConversationList() {
    const conv = await api.get("/chat/conversations");
    if (conv.data) {
      const convx = conv.data.map((cv) => ({
        from: cv.participants.find((user) => user.id != curruntUser.id),
        ...cv
      }));
      setConversation(convx);
    }
  }

  const scrollToBottom = () => {
    const el = messageContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    if (readyState) {}
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [readyState]);

  useEffect(() => {
    getCurrentUser();
    listenNotification();
  }, []);

  useEffect(() => {
    if (curruntUser.id) getConversationList();
  }, [curruntUser]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  function chatSend() {
    if (!textTyped.trim()) return;
    socket.emit('new:message', {
      roomId: activeConversation.id,
      message: textTyped,
      to: activeConversation.from?.id
    });
    setTextTyped('');
  }

  async function getMessages(conv) {
    const messageList = await api.get(`/chat/messages/${conv.id}`);
    if (messageList?.data) {
      const messageSort = messageList.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(messageSort);
    }
  }

  function conversationClick(conv) {
    setPageActive('center');
    if (activeConversation.id !== conv.id) {
      setMessages([]);
      setActiveConversation(conv);
      setConversation((prev) => prev.map((c) => c.id === conv.id ? { ...c, unread: 0 } : c));
      getMessages(conv);
      listenNewChat(conv);
    }
  }

  async function openConversation(friend) {
    const result = await api.post('/chat/open-conversation', { type: 'private', friendId: friend.friendId });
    if (result.data) {
      const newConv = {
        type: result.data.type,
        id: result.data.id,
        lastMessage: '',
        lastMessageAt: new Date(),
        participants: [{ id: friend.user?.id, name: friend.user?.name, email: friend.user?.email }],
        from: { id: friend.user?.id, name: friend.user?.name, email: friend.user?.email }
      };
      setConversation((prev) => {
        const exist = prev.find((c) => c.id === newConv.id);
        const updated = exist ? prev : [...prev, newConv];
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
      conversationClick(newConv);
      setShowContact(false);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    !searchQuery || c.from?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Main layout */}
      <div className="flex flex-row w-full max-w-5xl h-full md:h-[calc(100vh-24px)] md:rounded-2xl md:shadow-2xl overflow-hidden">

        {/* Left: Conversation list */}
        <aside className={`relative chat-bar ${pageActive === 'left' ? 'flex' : 'hidden md:flex'}`}>

          {/* Friends / Contacts panel — slides in over the conversation list */}
          <div
            className={`absolute inset-0 bg-sky-950 z-20 flex flex-col transition-transform duration-300 ease-in-out md:rounded-l-2xl ${showContact ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-sky-800">
              <button
                onClick={() => setShowContact(false)}
                className="p-1.5 rounded-full hover:bg-sky-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm text-slate-100">Friends</span>
            </div>

            {/* Invite search */}
            <div className="px-4 py-3 border-b border-sky-800 relative" ref={invitePopoverRef}>
              <button
                type="button"
                className="w-full py-2 rounded-lg bg-sky-800 hover:bg-sky-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                onClick={() => setShowInvitePopover((v) => !v)}
              >
                + Add Friend
              </button>
              {showInvitePopover && (
                <div className="absolute top-full mt-1 left-3 right-3 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 mb-2">
                    <input
                      className="text-xs text-gray-700 flex-1 px-1 py-1.5 outline-none bg-transparent"
                      placeholder="Search by email"
                      type="email"
                      value={friendInput}
                      onChange={(e) => setFriendInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchFriend()}
                    />
                    <button
                      onClick={searchFriend}
                      className="flex-shrink-0 text-sky-700 hover:text-sky-500 cursor-pointer p-0.5"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {friendFound.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                      <Avatar name={f.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{f.email}</p>
                      </div>
                      {!f.addresser?.addresser && !f.requester?.requester && !f.friend?.id && (
                        <button
                          onClick={() => inviteFriend(f)}
                          className="px-2 py-1 text-[10px] bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Invite
                        </button>
                      )}
                      {f.addresser?.addresser === f.id && (
                        <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-100 text-amber-700">{f.addresser.status}</span>
                      )}
                      {f.requester?.requester === f.id && (
                        <div className="flex gap-1">
                          <button onClick={() => acceptFriend(f)} className="p-1 text-green-600 hover:text-green-800 cursor-pointer">
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => rejectFriend(f)} className="p-1 text-red-500 hover:text-red-700 cursor-pointer">
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-sky-800">
              {tabs.map((tab, i) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors cursor-pointer border-b-2 ${activeTab === i ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content with slide */}
            <div className="flex-1 overflow-hidden relative">
              <div
                className="flex h-full w-[200%] transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeTab * 50}%)` }}
              >
                <div className="w-1/2 overflow-y-auto py-2">
                  <FriendsComponent openConversation={openConversation} refreshKey={refreshKey} />
                </div>
                <div className="w-1/2 overflow-y-auto py-2">
                  <InvitedListComponent currentUserId={curruntUser.id} acceptFriend={acceptFriend} rejectFriend={rejectFriend} refreshKey={refreshKey} />
                </div>
              </div>
            </div>
          </div>
          {/* Profile header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-sky-800">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden ring-2 ring-sky-700 hover:ring-sky-400 transition-all cursor-pointer"
              >
                <img src="/profile.png" className="w-full h-full object-cover" alt="profile" />
              </button>
              {showProfileMenu && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[130px]">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 truncate">{curruntUser?.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{curruntUser?.email}</p>
                  </div>
                  <button
                    onClick={() => setToken(null)}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">{curruntUser?.name || 'Loading...'}</p>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${readyState ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-[10px] text-slate-400">{readyState ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowContact(true)}
              className="p-1.5 rounded-full hover:bg-sky-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Add friend"
            >
              <UserPlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="flex items-center bg-sky-800/60 rounded-lg px-2 py-1.5 gap-2">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations"
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto messages-scroll px-2 pb-2">
            {filteredConversations.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No conversations yet</p>
            )}
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 ${conv.id === activeConversation.id ? 'bg-sky-800' : 'hover:bg-sky-900'}`}
                onClick={() => conversationClick(conv)}
              >
                <Avatar name={conv.from?.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate">{conv.from?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[9px] text-slate-400">
                    {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'HH:mm') : ''}
                  </span>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 bg-sky-400 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Chat window */}
        <main className={`chat-content ${pageActive === 'center' ? 'flex' : 'hidden md:flex'}`}>
          {!activeConversation.id ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
              <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                <ChatBubbleOvalLeftIcon className="w-8 h-8 text-sky-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Select a conversation</p>
              <p className="text-xs text-gray-400">Choose from your contacts or start a new chat</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                <button
                  onClick={() => setPageActive('left')}
                  className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <Avatar name={activeConversation.from?.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{activeConversation.from?.name}</p>
                  <p className="text-[10px] text-gray-400">Active now</p>
                </div>
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto messages-scroll px-4 py-4 flex flex-col gap-2"
              >
                {messages.map((m, idx) => {
                  const isOwn = m.from === curruntUser.id;
                  return (
                    <div key={idx} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && <Avatar name={activeConversation.from?.name} size="sm" />}
                      <div className={`max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${isOwn ? 'bg-sky-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          {m.message}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[9px] text-gray-400">
                            {m.createdAt ? format(new Date(m.createdAt), 'HH:mm') : ''}
                          </span>
                          {isOwn && <CheckIcon className="w-2.5 h-2.5 text-sky-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
                <input
                  type="text"
                  value={textTyped}
                  onChange={(e) => setTextTyped(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') chatSend(); }}
                  placeholder="Type a message…"
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:bg-gray-50 focus:ring-2 focus:ring-sky-200 transition-all"
                />
                <button
                  onClick={chatSend}
                  disabled={!textTyped.trim()}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white transition-colors cursor-pointer"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </main>

        {/* Right: Profile panel (large screens only) */}
        <aside className="profile-bar">
          {activeConversation.from ? (
            <div className="flex flex-col items-center py-8 px-4 gap-3">
              <Avatar name={activeConversation.from?.name} size="lg" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{activeConversation.from?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activeConversation.from?.email}</p>
              </div>
              <div className="w-full mt-4 border-t border-gray-200 pt-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2 px-2">Info</p>
                <p className="text-xs text-gray-500 px-2">Private conversation</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center px-4">Select a conversation to see details</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
