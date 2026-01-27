import React, { useEffect, useState, useRef } from "react";
import {
  fetchMyGroups,
  fetchGroupMessages,
  sendGroupMessage,
} from "../api/groups";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";

const heroImg = "/chat.jpg";

export default function GroupChat({ auth }) {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    let t;
    if (selected) {
      loadMessages(selected.id);
      t = setInterval(() => loadMessages(selected.id), 2500);
    }
    return () => clearInterval(t);
  }, [selected]);

  async function loadGroups() {
    try {
      const g = await fetchMyGroups();
      setGroups(g || []);
      if (g?.length > 0) setSelected(g[0]);
    } catch (err) {
      console.error("Failed to load groups", err);
    }
  }

  async function loadMessages(groupId) {
    try {
      const ms = await fetchGroupMessages(groupId);
      setMessages(ms || []);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!selected) return;
    const msg = text.trim();
    if (!msg) return;

    // Optimistic append
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      group_id: selected.id,
      user_id: null,
      message: msg,
      created_at: new Date().toISOString(),
      sender_name: "You",
      _temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText("");
    setSending(true);
    try {
      await sendGroupMessage(selected.id, msg);
      // reload from server to get canonical messages
      await loadMessages(selected.id);
    } catch (err) {
      console.error("Send failed", err);
      const msgText = err?.message || (err?.error ? JSON.stringify(err.error) : "Failed to send message");
      alert(msgText);
      // mark the temp message as failed
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _failed: true } : m)));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF7E9] via-[#FFEFFD] to-[#E8F8FF] p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-[#FFE4F2] flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
          <img src={heroImg} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Group Chat</h1>
          <p className="text-sm text-slate-500">Chat with members of your groups.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1 bg-white rounded-3xl shadow-md border border-[#FFE4F2] p-4"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-3">My Groups</h3>

          <div className="space-y-2">
            {groups.length === 0 && (
              <div className="text-sm text-slate-500">No groups yet.</div>
            )}

            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelected(g)}
                className={`w-full text-left p-3 rounded-xl transition shadow-sm ${
                  selected?.id === g.id
                    ? "bg-linear-to-r from-[#FFDBF4] to-[#FFF2D1] border border-[#FFDDF0]"
                    : "bg-white hover:bg-[#FFF7FB]"
                }`}
              >
                <div className="font-semibold text-slate-800">{g.group_name}</div>
                <div className="text-xs text-slate-500">{g.created_at}</div>
              </button>
            ))}
          </div>
        </motion.aside>

        {/* MAIN CHAT */}
        <motion.section
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 bg-white rounded-3xl shadow-md border border-[#FFE4F2] p-6 flex flex-col"
        >
          {!selected && (
            <div className="text-slate-500 text-center mt-16">
              Select a group to start chat.
            </div>
          )}

          {selected && (
            <>
              <div className="mb-3">
                <h2 className="text-xl font-bold text-slate-800">{selected.group_name}</h2>
              </div>

              {/* CHAT MESSAGES */}
              <div className="flex-1 overflow-auto rounded-2xl p-4 bg-linear-to-br from-[#FFF1F8] to-[#F4F9FF] border border-[#FFE9F4] space-y-4 shadow-inner">
                <AnimatePresence>
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-slate-500"
                    >
                      No messages yet.
                    </motion.div>
                  )}

                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl bg-white shadow ${m._failed ? 'border border-red-300' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {m.sender_name} • {new Date(m.created_at).toLocaleString()}
                        </div>
                        {m._failed && <div className="text-xs text-red-500">Failed</div>}
                      </div>
                      <div className="mt-1 text-slate-800">{m.message}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>

              {/* INPUT */}
              <form onSubmit={handleSend} className="mt-4 flex gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border border-[#FFDDF0] rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-[#FF9DC7] outline-none"
                  placeholder="Type a message..."
                />

                <button
                  type="submit"
                  disabled={sending}
                  className={`px-4 py-2 rounded-xl shadow transition flex items-center gap-2 ${sending ? 'bg-gray-300 text-white cursor-not-allowed opacity-70' : 'bg-linear-to-r from-[#FF9DC7] to-[#FFB56B] text-white hover:scale-[1.04]'}`}
                >
                  <FiSend /> {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
