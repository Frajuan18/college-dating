// components/MessageModal.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiOutlinePaperAirplane, HiOutlineX } from 'react-icons/hi';

const MessageModal = ({ isOpen, onClose, match, currentUser, onSendMessage }) => {
  const { isDark } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const suggestedMessages = [
    "Hey! I saw we have similar interests. Want to chat?",
    "Hi! I'm also studying at the same university. How's your semester going?",
    "Hey! I noticed you're into the same hobbies. What do you think about...",
    "Hi there! Your profile caught my attention. Would love to connect!",
    "Hey! I'm also in the same department. Which classes are you taking?",
    "Hi! I see we have a high match percentage. Want to get to know each other?",
    "Hey! Your bio is interesting. Tell me more about yourself!",
    "Hi! I'm new here and looking to meet new people. How are you?"
  ];

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    setSending(true);
    try {
      await onSendMessage(match.id, messageText);
      setMessageText('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSuggestMessage = (suggestion) => {
    setMessageText(suggestion);
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className={`w-full max-w-lg mx-4 rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-xl ${
          isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-rose-500 to-pink-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full overflow-hidden ${
                isDark ? 'bg-gray-600' : 'bg-white/20'
              } ring-2 ring-white/50`}>
                {match?.image ? (
                  <img src={match.image} alt={match.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-bold text-white`}>
                    {match?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold text-white`}>
                  Message {match?.name}
                </h3>
                <p className={`text-xs text-white/80`}>
                  {match?.university} • {match?.age} years
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`px-6 py-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Suggested Messages */}
          <div className="mb-6">
            <p className={`text-sm font-semibold mb-3 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Suggested messages:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestMessage(suggestion)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                    isDark 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600' 
                      : 'bg-gray-50 text-gray-700 hover:bg-rose-50 border-gray-200 hover:border-rose-200'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Your Message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows="4"
              className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              }`}
              placeholder="Type your message here..."
              maxLength="500"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs ${
                messageText.length >= 450 ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-gray-400'
              }`}>
                {messageText.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 rounded-b-xl flex flex-row-reverse gap-3 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !messageText.trim()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${
              sending || !messageText.trim()
                ? isDark 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gray-300 cursor-not-allowed'
                : isDark
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <HiOutlinePaperAirplane className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDark
                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;