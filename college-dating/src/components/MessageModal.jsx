// components/MessageModal.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { messageService } from "../services/messageService";
import { HiOutlinePaperAirplane, HiOutlineX } from "react-icons/hi";

const MessageModal = ({
  isOpen,
  onClose,
  match,
  currentUser,
  onSendMessage,
}) => {
  const { isDark } = useTheme();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const suggestedMessages = [
    "Hey! I saw we have similar interests. Want to chat?",
    "Hi! I'm also studying at the same university. How's your semester going?",
    "Hey! I noticed you're into the same hobbies. What do you think about...",
    "Hi there! Your profile caught my attention. Would love to connect!",
    "Hey! I'm also in the same department. Which classes are you taking?",
    "Hi! I see we have a high match percentage. Want to get to know each other?",
    "Hey! Your bio is interesting. Tell me more about yourself!",
    "Hi! I'm new here and looking to meet new people. How are you?",
  ];

  // In MessageModal.jsx - Fix the handleSend function
  const handleSend = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");

    // Validate message
    if (!messageText.trim()) {
      setError("Please enter a message");
      return;
    }

    // Validate user and match
    if (!currentUser?.id) {
      setError("You must be logged in to send a message");
      return;
    }

    if (!match?.id) {
      setError("Recipient information is missing");
      return;
    }

    setSending(true);

    try {
      console.log("Sending message to:", match.name);

      // Call the parent's handleSendMessage
      const result = await onSendMessage(match.id, messageText.trim());

      // Check if the send was successful
      if (result && result.success === true) {
        setSuccess("Message sent successfully!");
        setMessageText("");

        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result?.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error in handleSend:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSending(false);
    }
  };

  const handleSuggestMessage = (suggestion) => {
    setMessageText(suggestion);
    setError("");
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget && !sending) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!sending) {
      setMessageText("");
      setError("");
      setSuccess("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl transform transition-all ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 rounded-t-xl ${
            isDark
              ? "bg-gray-700"
              : "bg-gradient-to-r from-rose-500 to-pink-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/50 flex-shrink-0">
                {match?.image ? (
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                    {match?.name?.[0] || "U"}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Message {match?.name}
                </h3>
                <p className="text-xs text-white/80">
                  {match?.university || "University Student"} •{" "}
                  {match?.age || "?"} years
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={sending}
              className={`text-white/80 hover:text-white transition-colors ${
                sending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`px-6 py-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-500">{success}</p>
            </div>
          )}

          {/* Suggested Messages */}
          <div className="mb-6">
            <p
              className={`text-sm font-semibold mb-3 ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Suggested messages:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestMessage(suggestion)}
                  disabled={sending}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                    isDark
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
                      : "bg-gray-50 text-gray-700 hover:bg-rose-50 border-gray-200 hover:border-rose-200"
                  } ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Your Message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setError("");
              }}
              disabled={sending}
              rows="4"
              className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              } ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder="Type your message here..."
              maxLength="500"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <p
                className={`text-xs ${
                  messageText.length >= 450
                    ? "text-orange-500"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-400"
                }`}
              >
                {messageText.length}/500 characters
              </p>
              {match?.interests && match.interests.length > 0 && (
                <p className="text-xs text-rose-500">
                  {match.interests.length} interests
                </p>
              )}
            </div>
          </div>

          {/* Interests Preview */}
          {match?.interests && match.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-1">
                {match.interests.slice(0, 3).map((interest, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs ${
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {interest}
                  </span>
                ))}
                {match.interests.length > 3 && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      isDark
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    +{match.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 rounded-b-xl flex flex-row-reverse gap-3 ${
            isDark ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !messageText.trim()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${
              sending || !messageText.trim()
                ? isDark
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gray-300 cursor-not-allowed"
                : isDark
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-rose-500 hover:bg-rose-600 hover:shadow-md active:scale-95"
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
            onClick={handleClose}
            disabled={sending}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDark
                ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            } ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
