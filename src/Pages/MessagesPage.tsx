import { useState } from "react";
import Navbar from "../Components/Navbar";
import "./MessagesPage.css";

type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  listingTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Naledi M.",
    avatar: "/Sipho.png",
    listingTitle: "Nortic Classic Home office Desk",
    lastMessage: "Hey, is the desk still available?",
    lastTime: "1h",
    unread: true,
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Hi! Is the desk still available?",
        time: "10:02 AM",
      },
      {
        id: "m2",
        sender: "me",
        text: "Yes it is! Still in great condition.",
        time: "10:05 AM",
      },
      {
        id: "m3",
        sender: "them",
        text: "Perfect, would you be able to meet at Wellington campus?",
        time: "10:07 AM",
      },
    ],
  },
  {
    id: "c2",
    name: "Thabo K.",
    avatar: "/Sipho.png",
    listingTitle: "PROLINE INTEL CELERON",
    lastMessage: "Would you take R3400 for it?",
    lastTime: "3h",
    unread: true,
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Would you take R3400 for it?",
        time: "8:14 AM",
      },
    ],
  },
  {
    id: "c3",
    name: "Amahle P.",
    avatar: "/Sipho.png",
    listingTitle: "Bugani FreeBuds B20 Wireless Earbuds",
    lastMessage: "Thanks, see you tomorrow!",
    lastTime: "1d",
    unread: false,
    messages: [
      {
        id: "m1",
        sender: "me",
        text: "I can meet at Mowbray campus tomorrow around 2pm.",
        time: "Yesterday",
      },
      {
        id: "m2",
        sender: "them",
        text: "Thanks, see you tomorrow!",
        time: "Yesterday",
      },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations
  );
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId);

  const openConversation = (id: string) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const sendMessage = () => {
    if (!draft.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: "me",
      text: draft.trim(),
      time: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: newMessage.text,
              lastTime: "Now",
            }
          : c
      )
    );
    setDraft("");
  };

  return (
    <div className="msg-page">
      <Navbar />

      <div className="msg-layout">
        <aside className="msg-sidebar">
          <div className="msg-sidebar-header">
            <h2>Messages</h2>
          </div>

          <div className="msg-conversation-list">
            {conversations.map((c) => (
              <button
                key={c.id}
                className={`msg-conversation-item ${
                  c.id === activeId ? "msg-active" : ""
                }`}
                onClick={() => openConversation(c.id)}
              >
                <img src={c.avatar} alt={c.name} className="msg-conv-avatar" />
                <div className="msg-conv-info">
                  <div className="msg-conv-top">
                    <span className="msg-conv-name">{c.name}</span>
                    <span className="msg-conv-time">{c.lastTime}</span>
                  </div>
                  <span className="msg-conv-listing">{c.listingTitle}</span>
                  <span className="msg-conv-preview">{c.lastMessage}</span>
                </div>
                {c.unread && <span className="msg-conv-dot" />}
              </button>
            ))}
          </div>
        </aside>

        <main className="msg-thread">
          {activeConversation ? (
            <>
              <div className="msg-thread-header">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="msg-thread-avatar"
                />
                <div>
                  <span className="msg-thread-name">
                    {activeConversation.name}
                  </span>
                  <span className="msg-thread-listing">
                    {activeConversation.listingTitle}
                  </span>
                </div>
              </div>

              <div className="msg-thread-body">
                {activeConversation.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`msg-bubble-row ${
                      m.sender === "me" ? "msg-row-me" : "msg-row-them"
                    }`}
                  >
                    <div
                      className={`msg-bubble ${
                        m.sender === "me" ? "msg-bubble-me" : "msg-bubble-them"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="msg-bubble-time">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="msg-input-bar">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="msg-send-btn" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="msg-empty">
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}