import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function IncidentChat({ venueId, incidentId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const { user }                = useAuth();
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (!venueId || !incidentId) return;
    const chatRef = ref(db, `chats/${venueId}/${incidentId}`);
    const unsub   = onValue(chatRef, snap => {
      const data = snap.val() || {};
      const msgs = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (a.ts || 0) - (b.ts || 0));
      setMessages(msgs);
      setTimeout(() =>
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60
      );
    });
    return () => unsub();
  }, [venueId, incidentId]);

  async function sendMessage() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const chatRef = ref(db, `chats/${venueId}/${incidentId}`);
      await push(chatRef, {
        text:   text.trim(),
        sender: user?.email?.split('@')[0] || 'Staff',
        uid:    user?.uid || 'unknown',
        ts:     serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error('Chat send failed:', err);
    }
    setSending(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const QUICK = [
    'En route to location ',
    'Area secured ✓',
    'Medical team called ',
    'Fire dept notified ',
    'Guest evacuated safely ✓',
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100
                    flex flex-col overflow-hidden"
      style={{ height: '340px' }}>

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0
                      flex items-center justify-between bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">
           Staff Coordination Chat
        </h3>
        <span className="text-xs text-gray-400">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              No messages yet.
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Post your first update below.
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.uid === user?.uid;
          return (
            <div key={msg.id}
              className={`flex gap-2 items-end
                ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full flex-shrink-0
                              flex items-center justify-center
                              text-xs font-bold text-white"
                style={{ background: isMe ? '#2563eb' : '#7c3aed' }}>
                {msg.sender?.[0]?.toUpperCase() || 'S'}
              </div>

              {/* Bubble */}
              <div className={`max-w-xs ${isMe ? 'items-end' : 'items-start'}
                flex flex-col`}>
                {!isMe && (
                  <span className="text-xs text-gray-400 mb-0.5 ml-1">
                    {msg.sender}
                  </span>
                )}
                <div className={`text-xs px-3 py-2 rounded-2xl
                  ${isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-3 py-1.5 border-t border-gray-50 flex gap-1.5
                      overflow-x-auto flex-shrink-0">
        {QUICK.map(q => (
          <button key={q}
            onClick={() => setText(q)}
            className="text-xs bg-blue-50 text-blue-600 border border-blue-100
                       px-2.5 py-1 rounded-full whitespace-nowrap
                       hover:bg-blue-100 transition-colors flex-shrink-0">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100
                      flex-shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Post a status update..."
          disabled={sending}
          className="flex-1 text-xs border border-gray-200 rounded-xl
                     px-3 py-2 focus:outline-none focus:ring-2
                     focus:ring-blue-400 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl
                     text-xs font-bold hover:bg-blue-500
                     disabled:opacity-40 transition-colors">
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}