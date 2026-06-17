import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { useSocket } from "../provider/socketProvider";
import { useAuth } from "../provider/authProvider";
import { format } from 'date-fns';

import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ChatBubbleOvalLeftIcon from '@heroicons/react/24/solid/ChatBubbleOvalLeftIcon';
import VideoCameraIcon from '@heroicons/react/24/solid/VideoCameraIcon';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';


const FriendsComponent = ({ openConversation, refreshKey }) => {
  const [friendList, setFriendList] = useState([]);
  async function loadFriends() {
    try {
      const result = await api.get('/friends');
      if (result?.data) {
        setFriendList(result.data);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    loadFriends();
  }, [refreshKey])
  return (
    <div className="w-1/3 flex-shrink-0 pr-4 text-sm text-gray-900 px-2">
      {friendList.map((f) => (
        <div class="flex items-center gap-3 py-3 border-b border-gray-200">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-sm text-blue-700 flex-shrink-0">
            {f.user?.name?.charAt(0)}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-slate-200">{f.user?.name}</p>
            <p class="text-xs text-slate-200">{f.user?.email}</p>
          </div>
          <div className="flex flex-row justify-end items-center">
            <button onClick={() => {
              openConversation(f);
            }} className="px-1/2 py-1/2 border-1 border-sky-800 rounded-full text-red-700 cursor-pointer">
              <ChatBubbleOvalLeftIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const InvitedListComponent = ({ currentUserId, acceptFriend, rejectFriend, refreshKey }) => {
  const [invitingList, setInvitingList] = useState([]);
  async function loadInvitation() {
    try {
      const result = await api.get('/friends/invitations');
      if (result?.data) {
        const listInvitation = result.data.map((i) => {
          i.friend = i.addresser?.id === currentUserId ? i.requester : i.addresser;
          return i;
        })
        setInvitingList(listInvitation);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    loadInvitation();
  }, [refreshKey])
  return (
    <div className="w-1/3 flex-shrink-0 pr-4 text-sm text-gray-900 px-2">
      {invitingList.map((f) => (
        <div class="flex items-center gap-3 py-3 border-b border-gray-200">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-sm text-blue-700 flex-shrink-0">
            {f.friend?.name?.charAt(0)}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-slate-200">{f.friend?.name}</p>
            <p class="text-xs text-slate-200">{f.friend?.email}</p>
          </div>
          <div className="flex flex-row justify-end items-center">
            {f.requester.id === currentUserId && (
              <span className="px-2 py-2 border-1 border-sky-800 rounded-lg bg-orange-200">{f.status}</span>
            )}
            {f.requester.id !== currentUserId && (
              <>
                <button onClick={() => {
                  acceptFriend(f);
                }} className="px-1/2 py-1/2 border-1 border-sky-800 rounded-full mr-1 text-green-700 cursor-pointer">
                  <CheckCircleIcon className="w-6 h-6" />
                </button>
                <button onClick={() => {
                  rejectFriend(f);
                }} className="px-1/2 py-1/2 border-1 border-sky-800 rounded-full text-red-700 cursor-pointer">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Chat() {
  const socket = useSocket();
  const { setToken } = useAuth();
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const messageContainerRef = useRef(null)
  const [pageActive, setPageActive] = useState('left');

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const [messageHistory, setMessageHistory] = useState([]);
  const [unsendMessage, setUnsendMessage] = useState('');
  const [curruntUser, setCurrentUser] = useState({
    username: '',
    name: '',
    id: '',
    email: '',
    roomid: '',
    userid: '',
    room_id: ''
  })
  const [conversations, setConversation] = useState([]);
  const [activeConversation, setActiveConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [textTyped, setTextTyped] = useState('');
  const [tabs, setTabs] = useState([
    UserGroupIcon,
    UserPlusIcon
  ])
  const [activeTab, setActiveTab] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showInvitePopover, setShowInvitePopover] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const invitePopoverRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const inviteLink = `${window.location.origin}/join/${curruntUser.room_id || 'room'}`;
  const [friendInput, setFriendInput] = useState('');
  const [friendFound, setFriendFound] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const friendInputChange = (e) => {
    setFriendInput(e.target.value);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (invitePopoverRef.current && !invitePopoverRef.current.contains(e.target)) {
        setShowInvitePopover(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function copyInviteLink() {
    try {
      const result = await api.get(`/friends/get-by-email?email=${friendInput}`);
      if (result.data) {
        setFriendFound(result.data);
      }
    } catch (error) {
    }
  }

  async function inviteFriend(data) {
    try {
      const result = await api.post('/friends/invite', {
        addresser: data.id
      });
      if (result.data) {
        setShowInvitePopover(false);
        setActiveTab(1);
        setRefreshKey(k => k + 1);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function acceptFriend(data) {
    try {
      const result = await api.patch(`/friends/${data.id}/accept`);
      if (result.data) {
        setRefreshKey(k => k + 1);
      }
    } catch (error) {

    }
  }

  async function rejectFriend(data) {
    try {
      const result = await api.patch(`/friends/${data.id}/reject`);
      if (result.data) {
        setRefreshKey(k => k + 1);
      }
    } catch (error) {

    }
  }


  const usersList = Array.from({
    length: 5
  }, (_, idx) => idx);
  const [readyState, setReadyState] = useState(socket.connected);

  const textTypedChange = (e) => {
    setTextTyped(e.target?.value);
  }

  const joinRoom = () => {

  }

  function onConnect() {
    setReadyState(true);
  }
  function onDisconnect() {
    setReadyState(false);
  }

  async function getCurrentUser() {
    const user = await api.get('/users/me');
    if (user?.data) {
      setCurrentUser(user.data)
    }
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
          participants: [
            {
              id: msg?.data?.user?.id,
              name: msg?.data?.user?.name,
              email: msg?.data?.user?.email
            }
          ],
          from: {
            id: msg?.data?.user?.id,
            name: msg?.data?.user?.name,
            email: msg?.data?.user?.email
          }
        }]
      }

      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  }

  function listenNotification() {
    socket.off('new:notification');
    socket.on('new:notification', (data) => {
      console.log('new:notification', data);
      updateConversation(data);
    })
  }

  function updateMessages(data) {
    setMessages((prev) => [
      ...prev,
      {
        message: data.message,
        conversationId: data.conversationId,
        from: data.from,
        createdAt: data.createdAt
      }])
  }

  function listenNewChat(conv) {
    socket.emit('join:room', {
      roomId: conv.id
    });
    socket.off('message:new');
    socket.on('message:new', (msg) => {
      console.log(msg)
      updateMessages(msg);
    });
  }

  async function getConversationList() {
    const conv = await api.get("/chat/conversations");
    if (conv.data) {
      const convx = conv.data.map((cv) => ({
        from: cv.participants.find((user) => user.id != curruntUser.id),
        ...cv
      }))
      setConversation(convx)
    }
  }

  const scrollToBottom = () => {
    const el = messageContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behaviour: 'smooth'
      })
    }
  }

  useEffect(() => {
    console.log('readyState', readyState);

    if (readyState) {
      joinRoom()
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    }
  }, [readyState])

  useEffect(() => {
    getCurrentUser();
    listenNotification();
  }, [])

  useEffect(() => {
    if (curruntUser.id) {
      getConversationList();
    }
  }, [curruntUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  useEffect(() => {
    if (showContact) {

    }
  }, [showContact])

  const loadHistory = async () => {
    const result = await api.get(`/history-chats/${curruntUser.roomid}`);
    if (result.data) {
      setMessageHistory([...messageHistory, ...result.data.map((x) => ({
        message: x.message,
        username: x.userId.username,
        userid: x.userId._id,
        roomid: x.roomId._id,
        date: new Date(x.createdAt)
      }))])
    }
  }

  const typingMessage = (e) => {
    setUnsendMessage(e.target.value);
  }

  const onClickSend = () => {
    socket.emit('send-message', {
      topic: "room-event",
      meta: "send-message",
      room: curruntUser.roomid,
      payload: {
        message: unsendMessage,
        username: curruntUser.username,
        userid: curruntUser.userid,
        roomid: curruntUser.roomid,
        date: new Date()
      }
    })
  }

  function chatSend() {
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
      const messageSort = messageList.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages((prev) => [...prev, ...messageSort]);
    }
  }

  function conversationClick(conv) {
    setPageActive('center');
    if (activeConversation.id !== conv.id) {
      setMessages([]);
      setActiveConversation(conv);
      setConversation((prev) =>
        prev.map((c) => c.id === conv.id ? { ...c, unread: 0 } : c)
      );
      getMessages(conv);
      listenNewChat(conv);
      scrollToBottom();
    }
  }

  async function openConversation(friend) {
    const result = await api.post('/chat/open-conversation', {
      type: 'private',
      friendId: friend.friendId
    });
    if (result.data) {
      const newConv = {
        type: result.data.type,
        id: result.data.id,
        lastMessage: '',
        lastMessageAt: new Date(),
        participants: [
          {
            id: friend.user?.id,
            name: friend.user?.name,
            email: friend.user?.email
          }
        ],
        from: {
          id: friend.user?.id,
          name: friend.user?.name,
          email: friend.user?.email
        }
      }
      setConversation((prev) => {
        const exist = prev.find((c) => c.id === newConv.id);
        let updated = prev;
        if (!exist) {
          updated = [...prev, newConv];
        }
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      })
      conversationClick(newConv);
      setShowContact(false);
    }
  }

  function backeToConversationList() {
    setPageActive('left');
  }




  return (
    <>
      <div className="flex flex-row min-h-[98vh] flex-start rounded-2xl shadow-xl">
        {/* Contact */}
        <aside className={`absolute  h-screen md:w-64 w-full bg-sky-900 z-30 transition-transform duration-300 ease-in-out ${showContact ? 'translate-x-0' : '-translate-x-[120%]'}`}>
          <div className="flex flex-1 justify-center items-center w-full px-2 py-2 mb-2">
            <ArrowLeftIcon
              className="w-4 h-4 absolute left-2 text-slate-200 hover:cursor-pointer"
              onClick={() => {
                setShowContact(false);
              }}
            />
            <span className="font-bold w-full flex items-center justify-center text-xs text-slate-200">Friends</span>
          </div>
          <div className="flex w-full justify-center items-center mb-2 relative" ref={invitePopoverRef}>
            <button
              type="button"
              className="px-2 py-2 border-1 border-slate-200 text-slate-200 hover:cursor-pointer text-xs rounded-lg"
              onClick={() => setShowInvitePopover((v) => !v)}
            >
              Invite Friends
            </button>
            {showInvitePopover && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 md:w-[calc(100%-0.5rem)] w-90 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                  <input className="text-[11px] text-gray-600 truncate flex-1 px-2 py-2 outline-none" placeholder="Email" type="email" value={friendInput} onChange={friendInputChange} />
                  <button
                    onClick={copyInviteLink}
                    className="flex-shrink-0 text-sky-700 hover:text-sky-500 cursor-pointer"
                    title="Copy link"
                  >
                    {inviteCopied
                      ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                      : <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
                {friendFound && friendFound.map((f) => (
                  <div class="flex items-center gap-3 py-3 border-b border-gray-200">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-sm text-blue-700 flex-shrink-0">
                      {f.name?.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-sm text-sky-900">{f.name}</p>
                      <p class="text-xs text-sky-900">{f.email}</p>
                    </div>
                    <div className="flex flex-row justify-end items-center">
                      {
                        !f.addresser?.addresser && !f.requester?.requester
                        && !f.friend?.id && (
                          <button onClick={() => {
                            inviteFriend(f);
                          }} className="px-1 py-1 text-[8px] border-1 border-sky-800 rounded-lg mr-1 text-green-700 cursor-pointer">
                            Invite
                          </button>
                        )
                      }
                      {f.addresser?.addresser === f.id && (
                        <span className="px-2 py-1 text-[8px] rounded-lg bg-orange-200">{f.addresser.status}</span>
                      )}
                      {f.requester?.requester === f.id && (
                        <>
                          <button onClick={() => {
                            acceptFriend(f);
                          }} className="px-1/2 py-1/2 border-1 border-sky-800 rounded-full mr-1 text-green-700 cursor-pointer">
                            <CheckCircleIcon className="w-6 h-6" />
                          </button>
                          <button onClick={() => {
                            rejectFriend(f);
                          }} className="px-1/2 py-1/2 border-1 border-sky-800 rounded-full text-red-700 cursor-pointer">
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1  w-full  items-center justify-center mb-2">
            {tabs.map((tab, i) => {
              const TabIcon = tab;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 hover:cursor-pointer ${activeTab === i
                    ? "border-slate-200 text-slate-200"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <TabIcon className="w-4 h-4 text-slate-200" />
                </button>
              )
            })}
          </div>
          <div className="relative overflow-hidden py-4">
            <div
              className="flex w-[300%] transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${activeTab * 33.333}%)` }}
            >
              {tabs.map((_, i) => {
                if (i === 0) return <FriendsComponent openConversation={openConversation} refreshKey={refreshKey} />
                return <InvitedListComponent currentUserId={curruntUser.id} acceptFriend={acceptFriend} rejectFriend={rejectFriend} refreshKey={refreshKey} />
              })}
            </div>
          </div>

        </aside>
        <aside className={`chat-bar bg-sky-900 ${pageActive === 'left' ? 'flex flex-col w-full' : 'hidden'}`}>
          {/* User Login avatar */}
          <div className="flex flex-row w-full px-2 py-2">
            <div className="w-2/8 flex items-center justify-center mr-1 relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 cursor-pointer focus:outline-none"
              >
                <img
                  src="/profile.png"
                  className="rounded-full border-blue-500"
                  width={24}
                  height={24}
                />
              </button>
              {showProfileMenu && (
                <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                  <button
                    onClick={() => setToken(null)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col w-4/8 flex-start justify-center">
              <span className="flex font-bold text-[10px] text-slate-200">{curruntUser?.name}</span>
              <span className="flex text-[7px] text-slate-200 italic">Senior Developer</span>
            </div>
            <div className="mr-auto flex justify-end items-center w-2/8">
              <UserPlusIcon
                className="w-4 h-4 rounded-full text-slate-200 hover:cursor-pointer hover:text-sky-600"
                onClick={() => {
                  setShowContact(true);
                }}
              />
            </div>
          </div>

          {/* Seach box */}
          <div className="mt-2 mb-2 relative w-7/8">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="border-blue-200/50 bg-slate-200 w-full rounded-lg text-xs pl-7 pr-2 py-3"
            />
          </div>
          <div className="w-7/8 border-b-1 border-sky-800 mb-2">
          </div>
          {conversations.map((conv) => (
            <div key={conv.id} className={`flex flex-row w-full px-2 py-2 mt-2 hover:bg-sky-800 ${conv.id === activeConversation.id ? 'bg-sky-800' : ''} hover:rounded-lg cursor-pointer`} onClick={() => { conversationClick(conv) }}>
              <div className="w-2/8 flex items-center justify-center mr-1">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex justify-center items-center">
                  <img
                    src="/profile.png"
                    className="rounded-full border-blue-500"
                    width={24}
                    height={24}
                  />
                </div>

              </div>
              <div className="flex flex-col w-4/8 flex-start justify-center">
                <span className="flex font-bold text-[10px] text-blue-400">{conv.from?.name}</span>
                <span className="truncate flex text-[7px] text-slate-200 font-bold">{conv.lastMessage}</span>
              </div>
              <div className="w-2/8 flex flex-col items-end">
                <span className="text-[8px] text-slate-200">22:14</span>
                {conv.unread > 0 && (
                  <span className="text-[8px] w-3 h-3  bg-sky-400 rounded-full flex items-center justify-center text-slate-200">{conv.unread}</span>
                )}
              </div>
            </div>
          ))}
        </aside>
        <main className={`chat-content relative px-[1px] ${pageActive === 'center' ? 'flex flex-col w-full' : 'hidden'}`}>
          {activeConversation.id && (
            <>
              {/* friends profile bar */}
              <div className="flex flex-row w-full py-4 mb-1">
                <div className="w-1/2 flex flex-row">
                  <div className="flex items-center px-2 md:hidden">
                    <ArrowLeftIcon className="w-4 h-4 cursor-pointer" onClick={backeToConversationList} />
                  </div>
                  <div className="w-2/8 flex items-center justify-center">
                    <img
                      src="/profile.png"
                      className="rounded-full border-blue-500"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="flex flex-col w-5/8 flex-start justify-center">
                    <span className="flex font-bold text-[10px] text-blue-400">{activeConversation?.from?.name}</span>
                  </div>
                </div>
                <div className="w-1/2 flex justify-end items-center pr-4">
                  <MagnifyingGlassIcon className="w-4 h-4 cursor-pointer hover:text-blue-400" />
                </div>
              </div>
              <div className="w-full flex justify-center mb-1">
                <div className="w-7/8 border-b-1 px-4 border-gray-300"></div>
              </div>
              {/* message content */}
              <div className="mb-2 mt-auto flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" ref={messageContainerRef}>
                {
                  messages.map((m) => (
                    <>
                      {m.from !== curruntUser.id && (
                        <div className="flex flex-row justify-start px-2 mt-2">
                          <img
                            src="/profile.png"
                            className="rounded-full border-blue-500 h-5 w-5 mt-auto mr-1"
                          />
                          <span className="text-xs flex flex-col bg-blue-400 px-4 py-4 rounded-r-xl rounded-ss-2xl min-w-24 max-w-48">
                            <span className="text-slate-200">{m.message}</span>
                            <span className="text-[7px] text-slate-300 font-bold relative -bottom-3 flex flex-row">
                              <span className="mr-1">
                                {format(new Date(m.createdAt), 'HH:mm')}
                              </span>
                              <CheckIcon className="w-2 h-2 font-bold text-green-700" />

                            </span>
                          </span>
                        </div>
                      )}
                      {m.from === curruntUser.id && (
                        <div className="flex flex-row justify-end px-2 mt-2">
                          <span className="flex flex-col text-xs bg-sky-900 px-4 py-4 rounded-l-xl rounded-se-2xl min-w-24 max-w-48">
                            <span className="text-slate-200">{m.message}</span>
                            <span className="text-[7px] text-slate-300 font-bold relative -bottom-3 flex flex-row">
                              <span className="mr-1">
                                {format(new Date(m.createdAt), 'HH:mm')}
                              </span>
                              <CheckIcon className="w-2 h-2 font-bold text-green-700" />
                            </span>
                          </span>
                          <img
                            src="/profile.png"
                            className="rounded-full border-blue-500 w-5 h-5 mt-auto ml-1"
                          />
                        </div>
                      )}
                    </>
                  ))
                }
              </div>
              {/* input message */}
              <div className="relative bottom-0 flex bg-sky-900  w-full justify-center py-2 rounded-t-xl">
                <input
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                      chatSend();
                    }
                  }}
                  value={textTyped}
                  onChange={textTypedChange}
                  type="text"
                  className="px-4 py-2 bg-gray-200 w-7/8 h-10 rounded-lg text-xs text-gray-500"
                />
              </div>
            </>
          )}

        </main>
        <aside className={`profile-bar ${pageActive === 'right' ? 'flex flex-col' : 'hidden'}`}>
          <div className="flex justify-center items-center min-h-[96vh] flex-col">
            <img
              src="/profile.png"
              className="rounded-full border-blue-500 h-24 w-24  mr-1 mb-2"
            />
            <div className="flex flex-col justify-center items-center w-full mb-2">
              <span className="text-[0.8em] font-bold">David Peters</span>
              <span className="text-[0.1em]">Junior Developer</span>
            </div>
            <div className="flex flex-row py-2">
              <ChatBubbleOvalLeftIcon className="w-8 h-8 text-blue-500 mr-2 bg-blue-300 rounded-full px-2 py-2 shadow-sm cursor-pointer" />
              <div className="border-r-1 shadow-xl border-gray-400 mr-2"></div>
              <VideoCameraIcon className="w-8 h-8 text-blue-500 bg-blue-300 rounded-full px-2 py-2 shadow-sm cursor-pointer" />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
