import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatBubble, TypingIndicator } from '../components/ui/ChatBubble';
import { chatWithAI } from '../api/agent';
import './AiChat.css';

const SUGGESTIONS = [
  'Berapa keuntungan saya hari ini?',
  'Produk apa yang paling laris?',
  'Bagaimana cara meningkatkan penjualan?',
  'Tips marketing untuk bisnis kecil?',
  'Stok mana yang perlu diisi?',
  'Cara mengelola cash flow yang baik?',
];

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { id: Date.now(), sender: 'user', text: text.trim(), time: 'Baru saja' }]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await chatWithAI(text.trim());
      setMessages((p) => [...p, { id: Date.now() + 1, sender: 'ai', text: res.reply || res, time: 'Baru saja' }]);
    } catch {
      setMessages((p) => [...p, { id: Date.now() + 1, sender: 'ai', text: 'Maaf, ada kendala jaringan. Coba sesaat lagi ya! 🙏', time: 'Baru saja' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-page animate-fade-in">
      <div className="chat-page__header">
        <div className="chat-page__header-avatar">✦</div>
        <div className="chat-page__header-info">
          <h2>SPARK Consultant</h2>
          <p>● Online</p>
        </div>
      </div>
      
      <div className="chat-page__messages" ref={messagesRef}>
        {messages.length === 0 && (
          <div className="chat-page__welcome">
            <div className="chat-page__welcome-icon">
              <Sparkles size={40} />
            </div>
            <h3>Halo! Saya SPARK AI 👋</h3>
            <p>Tanyakan apa saja tentang data bisnismu, saya akan menganalisanya untukmu.</p>
          </div>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m.text} sender={m.sender} time={m.time} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      
      {messages.length === 0 && (
        <div className="chat-page__suggestions animate-slide-up">
          {SUGGESTIONS.map((q) => (
            <button key={q} className="chat-page__suggestion" onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      
      <form className="chat-page__input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
        <input 
          className="chat-page__input" 
          placeholder="Tanya sesuatu..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          id="chat-input" 
          autoComplete="off"
        />
        <button 
          className="chat-page__send" 
          type="submit" 
          disabled={!input.trim() || isTyping} 
          id="btn-send-chat"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
