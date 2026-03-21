// components/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { HiOutlinePaperAirplane, HiOutlineEmojiHappy, HiOutlinePhotograph } from 'react-icons/hi';

const MessageInput = ({ onSend, disabled, isDark }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return;
    
    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  return (
    <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm`}>
      <div className="flex gap-2 items-end">
        <div className="flex gap-1">
          <button className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <HiOutlineEmojiHappy className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <HiOutlinePhotograph className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            disabled={sending || disabled}
            className={`w-full px-4 py-3 rounded-xl border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              isDark
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } ${(sending || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              minHeight: '44px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={sending || !message.trim() || disabled}
          className={`p-3 rounded-xl transition-all flex-shrink-0 ${
            sending || !message.trim() || disabled
              ? isDark
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
          }`}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <HiOutlinePaperAirplane className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex justify-between`}>
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Enter</kbd> to send</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Enter</kbd> for new line</span>
      </div>
    </div>
  );
};

export default MessageInput;