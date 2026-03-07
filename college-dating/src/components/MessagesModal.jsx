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
        {/* Background overlay - Lighter and more transparent */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        </div>

        {/* Modal panel - Bright and clean */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header - Bright gradient */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/50">
                  {match?.image ? (
                    <img src={match.image} alt={match.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {match?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Send Message to {match?.name}
                  </h3>
                  <p className="text-xs text-white/80">
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

          {/* Body - Bright white background */}
          <div className="bg-white px-6 py-6">
            {/* Suggested Messages */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Suggested messages:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {suggestedMessages.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestMessage(suggestion)}
                    className="w-full text-left p-3 rounded-lg text-sm bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition-all border border-gray-200 hover:border-rose-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Your Message
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all resize-none"
                placeholder="Type your message here..."
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-xs ${
                  messageText.length >= 450 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {messageText.length}/500 characters
                </p>
                {messageText.length >= 500 && (
                  <p className="text-xs text-red-500">Maximum characters reached</p>
                )}
              </div>
            </div>

            {/* Match Interests Preview */}
            {match?.interests && match.interests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  {match.name}'s interests:
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.interests.slice(0, 5).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-rose-50 text-rose-600 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Light gray background */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !messageText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${
                sending || !messageText.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 hover:shadow-md active:scale-95'
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
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
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