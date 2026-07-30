"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageSquare, Search, Loader2, ShieldCheck, Plus, User, X, Trash2 } from "lucide-react";
import { pusherClient } from "@/lib/pusher";

interface Participant {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; role: string };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string; email?: string };
}

interface Conversation {
  id: string;
  participants: Participant[];
  messages: Array<{ body: string; createdAt: string; sender: { name: string } }>;
  updatedAt: string;
}

interface UserResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = () => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0 && !activeConvId) setActiveConvId(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Search users for starting new chat
  useEffect(() => {
    if (!showNewChatModal) return;
    setSearchingUsers(true);
    fetch(`/api/users?q=${encodeURIComponent(userQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUserResults(data);
      })
      .catch(console.error)
      .finally(() => setSearchingUsers(false));
  }, [userQuery, showNewChatModal]);

  const [deletingConv, setDeletingConv] = useState(false);

  const startConversationWithUser = async (targetUserId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.id) {
        setShowNewChatModal(false);
        setUserQuery("");
        fetchConversations();
        setActiveConvId(data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("Are you sure you want to delete this chat? All messages in this thread will be permanently deleted.")) return;
    setDeletingConv(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConvId === convId) setActiveConvId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingConv(false);
    }
  };

  useEffect(() => {
    if (!activeConvId) return;
    setLoadingMsgs(true);

    fetch(`/api/conversations/${activeConvId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          setTimeout(scrollToBottom, 100);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    const channelName = `conversation-${activeConvId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [activeConvId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConvId || sending) return;

    const text = msgInput.trim();
    setMsgInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (data.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setTimeout(scrollToBottom, 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherUser = activeConv?.participants.find((p) => p.user.id !== session?.user?.id)?.user;

  const filteredConvs = conversations.filter((c) => {
    const partnerName = c.participants.find((p) => p.user.id !== session?.user?.id)?.user.name || "";
    return partnerName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Support & Messages</h1>
          <p className="page-subtitle">Communicate with property partners and TUM students in real-time.</p>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Plus className="w-4 h-4" /> Start New Chat
        </button>
      </div>

      {/* New Chat User Search Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-700" /> Start a Conversation
              </h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="input pl-10 text-sm"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-50">
              {searchingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : userResults.length === 0 ? (
                <p className="text-center py-8 text-xs text-gray-400">No users found matching query.</p>
              ) : (
                userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversationWithUser(u.id)}
                    className="w-full text-left p-3 hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-poppins font-semibold text-sm text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${u.role === "PARTNER" ? "bg-sky-100 text-sky-700" : u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {u.role}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="card grid grid-cols-1 md:grid-cols-3 h-[620px] overflow-hidden shadow-lg border border-gray-100">
        {/* Sidebar Conversations */}
        <div className="border-r border-gray-100 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search active chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 text-xs py-2 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-xs font-medium">No active chats</p>
                <button onClick={() => setShowNewChatModal(true)} className="text-xs text-primary-700 font-semibold hover:underline mt-1 block mx-auto">
                  + Start a chat
                </button>
              </div>
            ) : (
              filteredConvs.map((chat) => {
                const recipient = chat.participants.find((p) => p.user.id !== session?.user?.id)?.user;
                const lastMsg = chat.messages[0];
                const isActive = activeConvId === chat.id;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveConvId(chat.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 ${isActive ? "bg-primary-50/70 border-l-4 border-primary-600" : ""}`}
                  >
                    <div>
                      <div className="font-poppins font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                        {recipient?.name || "Chat Participant"}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${recipient?.role === "PARTNER" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>
                          {recipient?.role || "USER"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {lastMsg ? lastMsg.body : "No messages yet"}
                      </div>
                    </div>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2 flex flex-col bg-gray-50/40">
          {otherUser ? (
            <>
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-sm font-poppins">
                    {otherUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      {otherUser.name}
                      <ShieldCheck className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="text-xs text-gray-500">{otherUser.email} · <span className="text-emerald-600 font-medium">System Support Active</span></div>
                  </div>
                </div>
                <button
                  onClick={() => activeConvId && handleDeleteConversation(activeConvId)}
                  disabled={deletingConv}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Delete Chat Conversation"
                >
                  {deletingConv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">Delete Chat</span>
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    No messages in this chat. Type a message to reply.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = Boolean(
                      (session?.user?.id && (m.senderId === session.user.id || m.sender?.id === session.user.id)) ||
                      ((session?.user as any)?.email && m.sender?.email === (session?.user as any).email)
                    );
                    return (
                      <div key={m.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-sm shadow-sm ${
                            isMe
                              ? "bg-primary-700 text-white rounded-br-none ml-auto"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-none mr-auto shadow-sm"
                          }`}
                        >
                          {!isMe && (
                            <div className="text-[11px] font-bold text-primary-700 mb-1">
                              {m.sender?.name || "Sender"}
                            </div>
                          )}
                          <div className="whitespace-pre-line leading-relaxed">{m.body}</div>
                          <div className={`text-[10px] mt-1.5 text-right ${isMe ? "text-primary-200" : "text-gray-400"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply as Admin..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  className="input text-sm flex-1"
                />
                <button type="submit" className="btn-primary py-2.5 px-4" disabled={sending || !msgInput.trim()}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2 p-6">
              <MessageSquare className="w-12 h-12 text-gray-200" />
              <p className="font-poppins font-semibold text-gray-600">Select or Start a Chat</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4"
              >
                <Plus className="w-3.5 h-3.5" /> Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
