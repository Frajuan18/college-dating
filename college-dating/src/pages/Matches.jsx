// pages/Matches.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import MessageModal from "../components/MessageModal";
import {
  HiOutlineHeart,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineFire,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlinePaperAirplane,
  HiOutlineBell,
} from "react-icons/hi";

const Matches = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: "",
    interests: [],
  });

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const checkUserAndFetch = async () => {
    try {
      const telegramId = localStorage.getItem("telegramId");

      if (!telegramId) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      await fetchCurrentUser();
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/login");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const telegramId = localStorage.getItem("telegramId");

      if (!telegramId) {
        navigate("/login");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", parseInt(telegramId))
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        if (userError.code === "PGRST116") {
          localStorage.removeItem("telegramId");
          navigate("/login");
          return;
        }
        throw userError;
      }

      console.log("Current user:", userData);
      setCurrentUser(userData);

      await fetchMatches(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("telegramId");
      navigate("/login");
    }
  };

  const fetchMatches = async (user) => {
    try {
      setLoading(true);

      const oppositeGender = user.gender === "male" ? "female" : "male";

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(
          `
          id,
          telegram_id,
          first_name,
          last_name,
          full_name,
          gender,
          photo_url,
          verification_status,
          bio,
          interests,
          location,
          created_at,
          updated_at
        `,
        )
        .eq("gender", oppositeGender)
        .neq("telegram_id", user.telegram_id);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      const matchesWithVerification = await Promise.all(
        users.map(async (matchUser) => {
          const { data: verification, error: verifError } = await supabase
            .from("student_verifications")
            .select(
              "university_name, department, student_year, full_name, status",
            )
            .eq("user_id", matchUser.id)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (verifError) {
            console.error(
              `Error fetching verification for user ${matchUser.id}:`,
              verifError,
            );
          }

          // Check if there's an existing conversation
          const { data: conversation } = await supabase
            .from("messages")
            .select("*")
            .or(
              `and(sender_id.eq.${user.id},receiver_id.eq.${matchUser.id}),and(sender_id.eq.${matchUser.id},receiver_id.eq.${user.id})`,
            )
            .limit(1)
            .maybeSingle();

          const completeUser = {
            id: matchUser.id,
            first_name: matchUser.first_name,
            last_name: matchUser.last_name,
            full_name:
              matchUser.full_name ||
              verification?.full_name ||
              `${matchUser.first_name || ""} ${matchUser.last_name || ""}`.trim() ||
              "User",
            photo_url: matchUser.photo_url,
            bio: matchUser.bio || "",
            interests: matchUser.interests || [],
            location: matchUser.location || "On Campus",
            verification_status:
              matchUser.verification_status ||
              verification?.status ||
              "pending",
            created_at: matchUser.created_at,
            updated_at: matchUser.updated_at,
            university_name: verification?.university_name || "",
            department: verification?.department || "",
            student_year: verification?.student_year || "",
            hasVerification: !!verification,
            age: calculateAgeFromVerification(verification?.student_year),
            hasConversation: !!conversation,
            conversationId: conversation?.id,
          };

          return completeUser;
        }),
      );

      const verifiedMatches = matchesWithVerification.filter(
        (match) => match.hasVerification,
      );

      const formattedMatches = verifiedMatches.map((match) => {
        const matchPercentage = calculateMatchPercentage(user, match);
        const isNew = isNewUser(match.created_at);
        const isOnline = Math.random() > 0.7;

        return {
          id: match.id,
          name: match.full_name,
          age: match.age,
          university: match.university_name,
          department: match.department,
          year: match.student_year,
          location: match.location,
          image:
            match.photo_url ||
            (oppositeGender === "female"
              ? "https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400"
              : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"),
          bio: match.bio,
          interests: match.interests,
          matchPercentage: matchPercentage,
          lastActive: getLastActive(match.updated_at),
          isOnline: isOnline,
          isNew: isNew,
          verified:
            match.verification_status === "verified" ||
            match.verification_status === "approved",
          gender: match.gender,
          hasConversation: match.hasConversation,
          conversationId: match.conversationId,
          compatibility: {
            interests: calculateInterestCompatibility(
              user.interests || [],
              match.interests || [],
            ),
            location: calculateLocationCompatibility(
              user.location,
              match.location,
            ),
            university:
              user.university_name === match.university_name ? 100 : 70,
          },
        };
      });

      formattedMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      setMatches(formattedMatches);
      setFilteredMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatches([]);
      setFilteredMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Message functions
  const handleOpenMessageModal = (match, e) => {
    e.stopPropagation();
    setSelectedMatch(match);
    setShowMessageModal(true);
  };

  // In your Matches.jsx, update the handleSendMessage function:

  const handleSendMessage = async (receiverId, content) => {
    try {
      // Use the message service to send the message
      const result = await messageService.sendMessage(
        currentUser.id,
        receiverId,
        content,
      );

      if (result.success) {
        console.log("Message sent successfully:", result.data);

        // Update local state to show conversation started
        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match.id === receiverId
              ? { ...match, hasConversation: true }
              : match,
          ),
        );

        // Show success message
        alert("Message sent successfully!");

        // Navigate to messages page
        navigate("/notifications");
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Helper functions
  const calculateAgeFromVerification = (studentYear) => {
    if (!studentYear) return 22;
    const yearMap = {
      "1st Year": 19,
      "2nd Year": 20,
      "3rd Year": 21,
      "4th Year": 22,
      "5th Year": 23,
      Graduate: 24,
      PhD: 26,
    };
    return yearMap[studentYear] || 22;
  };

  const isNewUser = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  const getLastActive = (updatedAt) => {
    if (!updatedAt) return "Unknown";
    const now = new Date();
    const lastActive = new Date(updatedAt);
    const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const calculateMatchPercentage = (user, match) => {
    let percentage = 50;
    const userInterests = user.interests || [];
    const matchInterests = match.interests || [];

    if (userInterests.length > 0 && matchInterests.length > 0) {
      const commonInterests = userInterests.filter((interest) =>
        matchInterests.includes(interest),
      );
      percentage +=
        (commonInterests.length /
          Math.max(userInterests.length, matchInterests.length)) *
        20;
    }

    if (user.university_name && match.university_name) {
      if (user.university_name === match.university_name) {
        percentage += 15;
      }
    }

    if (user.department && match.department) {
      if (user.department === match.department) {
        percentage += 10;
      }
    }

    if (
      match.verification_status === "verified" ||
      match.verification_status === "approved"
    ) {
      percentage += 5;
    }

    return Math.min(Math.round(percentage), 100);
  };

  const calculateInterestCompatibility = (userInterests, matchInterests) => {
    if (!userInterests.length || !matchInterests.length) return 50;
    const common = userInterests.filter((i) => matchInterests.includes(i));
    return Math.round(
      (common.length / Math.max(userInterests.length, matchInterests.length)) *
        100,
    );
  };

  const calculateLocationCompatibility = (userLoc, matchLoc) => {
    if (!userLoc || !matchLoc) return 70;
    return userLoc === matchLoc ? 95 : 75;
  };

  // Filter matches
  useEffect(() => {
    if (!matches.length) return;

    let filtered = [...matches];

    if (searchQuery) {
      filtered = filtered.filter(
        (match) =>
          match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.interests.some((interest) =>
            interest.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    if (activeTab === "new") {
      filtered = filtered.filter((match) => match.isNew);
    } else if (activeTab === "messages") {
      filtered = filtered.filter((match) => match.hasConversation);
    }

    if (filters.university) {
      filtered = filtered.filter(
        (match) => match.university === filters.university,
      );
    }

    if (filters.interests.length > 0) {
      filtered = filtered.filter((match) =>
        filters.interests.some((interest) =>
          match.interests.includes(interest),
        ),
      );
    }

    setFilteredMatches(filtered);
  }, [searchQuery, activeTab, filters, matches]);

  const getCardStyles = () => {
    return isDark
      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
      : "bg-white border-gray-100 hover:border-rose-200";
  };

  const getTextStyles = () => {
    return isDark ? "text-white" : "text-gray-900";
  };

  const getSubtextStyles = () => {
    return isDark ? "text-gray-400" : "text-gray-500";
  };

  const getActiveTabStyles = (tab) => {
    const baseStyles =
      "px-4 py-2 rounded-full text-sm font-medium transition-all";
    if (activeTab === tab) {
      return `${baseStyles} bg-rose-500 text-white shadow-lg`;
    }
    return `${baseStyles} ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"}`;
  };

  const getMatchPercentageColor = (percentage) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 80) return "text-yellow-500";
    if (percentage >= 70) return "text-orange-500";
    return "text-gray-500";
  };

  const getUniqueUniversities = () => {
    const universities = [
      ...new Set(matches.map((m) => m.university).filter(Boolean)),
    ];
    return universities;
  };

  const getUniqueInterests = () => {
    const allInterests = matches.flatMap((m) => m.interests);
    return [...new Set(allInterests)];
  };

  const handleFilterChange = (type, value) => {
    if (type === "university") {
      setFilters((prev) => ({ ...prev, university: value }));
    } else if (type === "interest") {
      setFilters((prev) => ({
        ...prev,
        interests: prev.interests.includes(value)
          ? prev.interests.filter((i) => i !== value)
          : [...prev.interests, value],
      }));
    }
  };

  const clearFilters = () => {
    setFilters({ university: "", interests: [] });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div
              className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 ${
                isDark
                  ? "border-gray-700 border-t-rose-500"
                  : "border-gray-200 border-t-rose-500"
              }`}
            ></div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Finding your matches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Notification Toast */}
        {notification.show && (
          <div className={`fixed top-24 right-4 z-50 animate-slide-in`}>
            <div
              className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <HiOutlineCheckCircle className="w-5 h-5" />
              ) : (
                <HiOutlineXCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-bold mb-2 ${getTextStyles()}`}
              >
                Your Matches
              </h1>
              <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                {filteredMatches.length}{" "}
                {filteredMatches.length === 1 ? "person" : "people"} you might
                like
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                isDark
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
              }`}
            >
              <HiOutlineFilter className="w-5 h-5" />
              Filters
              {(filters.university || filters.interests.length > 0) && (
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <HiOutlineSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search by name, university, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-rose-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500 shadow-sm"
              }`}
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold ${getTextStyles()}`}>Filters</h3>
                <button
                  onClick={clearFilters}
                  className={`text-sm flex items-center gap-1 ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                  Clear all
                </button>
              </div>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${getTextStyles()}`}
                >
                  University
                </label>
                <select
                  value={filters.university}
                  onChange={(e) =>
                    handleFilterChange("university", e.target.value)
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">All Universities</option>
                  {getUniqueUniversities().map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${getTextStyles()}`}
                >
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {getUniqueInterests()
                    .slice(0, 15)
                    .map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleFilterChange("interest", interest)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          filters.interests.includes(interest)
                            ? "bg-rose-500 text-white"
                            : isDark
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={getActiveTabStyles("all")}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={getActiveTabStyles("new")}
            >
              New
              {matches.filter((m) => m.isNew).length > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === "new"
                      ? "bg-white text-rose-500"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {matches.filter((m) => m.isNew).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={getActiveTabStyles("messages")}
            >
              Messages
              {matches.filter((m) => m.hasConversation).length > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === "messages"
                      ? "bg-white text-rose-500"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {matches.filter((m) => m.hasConversation).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <div className={`text-center py-12 ${getSubtextStyles()}`}>
            <HiOutlineHeart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No matches found</p>
            <p className="text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${getCardStyles()}`}
                onClick={() => navigate(`/profile/${match.id}`)}
              >
                {/* Image Container */}
                <div className="relative">
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-full h-64 object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {match.verified && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    {match.isNew && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <HiOutlineSparkles className="w-3 h-3" />
                        NEW
                      </div>
                    )}
                  </div>

                  {match.isOnline && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  <div
                    className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${
                      isDark ? "bg-gray-900/90" : "bg-white/90"
                    } ${getMatchPercentageColor(match.matchPercentage)}`}
                  >
                    {match.matchPercentage}% Match
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-semibold ${getTextStyles()}`}>
                      {match.name}, {match.age}
                    </h3>
                  </div>

                  {match.university && (
                    <p
                      className={`text-sm mb-2 flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineAcademicCap className="w-4 h-4" />
                      {match.university} {match.year && `• ${match.year}`}
                    </p>
                  )}

                  {match.department && (
                    <p className={`text-xs mb-2 ${getSubtextStyles()}`}>
                      {match.department}
                    </p>
                  )}

                  <p
                    className={`text-xs mb-3 flex items-center gap-1 ${getSubtextStyles()}`}
                  >
                    <HiOutlineLocationMarker className="w-3 h-3" />
                    {match.location}
                  </p>

                  {match.bio && (
                    <p
                      className={`text-xs mb-3 line-clamp-2 ${getSubtextStyles()}`}
                    >
                      "{match.bio.substring(0, 60)}..."
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {match.interests.slice(0, 3).map((interest, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${
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
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDark
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        +{match.interests.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${getSubtextStyles()}`}>
                      <HiOutlineClock className="inline w-3 h-3 mr-1" />
                      {match.lastActive}
                    </p>

                    <div className="flex gap-2">
                      {match.hasConversation ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/messages");
                          }}
                          className={`p-2 rounded-full transition ${
                            isDark
                              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                          title="Go to Messages"
                        >
                          <HiOutlineChat className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleOpenMessageModal(match, e)}
                          className={`p-2 rounded-full transition ${
                            isDark
                              ? "bg-rose-600 text-white hover:bg-rose-700"
                              : "bg-rose-500 text-white hover:bg-rose-600"
                          }`}
                          title="Send Message"
                        >
                          <HiOutlinePaperAirplane className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={getSubtextStyles()}>Compatibility</span>
                      <span
                        className={getMatchPercentageColor(
                          match.matchPercentage,
                        )}
                      >
                        {match.matchPercentage}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-1 rounded-full ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-1 rounded-full ${
                          match.matchPercentage >= 90
                            ? "bg-green-500"
                            : match.matchPercentage >= 80
                              ? "bg-yellow-500"
                              : match.matchPercentage >= 70
                                ? "bg-orange-500"
                                : "bg-gray-400"
                        }`}
                        style={{ width: `${match.matchPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedMatch && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default Matches;
