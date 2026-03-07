// components/MessageModal.jsx
import React, { useState } from 'react';
import { HiOutlinePaperAirplane, HiOutlineX } from 'react-icons/hi';

const MessageModal = ({ isOpen, onClose, match, currentUser, onSendMessage }) => {
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
    await onSendMessage(match.id, messageText);
    setSending(false);
    setMessageText('');
    onClose();
  };

  const handleSuggestMessage = (suggestion) => {
    setMessageText(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Send Message to {match?.name}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-4">
            {/* Suggested Messages */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Suggested messages:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {suggestedMessages.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestMessage(suggestion)}
                    className="w-full text-left p-3 rounded-lg text-sm bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition border border-gray-200 hover:border-rose-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="Type your message here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {messageText.length}/500 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !messageText.trim()}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm ${
                sending || !messageText.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;