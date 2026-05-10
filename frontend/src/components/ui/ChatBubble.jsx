import './ChatBubble.css';

export function ChatBubble({ message, sender = 'user', time }) {
  return (
    <div className={`chat-bubble chat-bubble--${sender}`}>
      <div className="chat-bubble__avatar">
        {sender === 'user' ? 'U' : '✦'}
      </div>
      <div>
        <div className="chat-bubble__content">{message}</div>
        {time && <div className="chat-bubble__time">{time}</div>}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="chat-bubble chat-bubble--ai">
      <div className="chat-bubble__avatar">✦</div>
      <div className="chat-bubble__content">
        <div className="typing-indicator">
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
        </div>
      </div>
    </div>
  );
}
