// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import {
  HiOutlineHeart,
  HiOutlineUserGroup,
  HiOutlineChat,
  HiOutlineSparkles,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlineFire,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineUser,
  HiOutlineCheckCircle,
} from "react-icons/hi";

const Home = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [oppositeGenderUsers, setOppositeGenderUsers] = useState([]);
  const [trendingOppositeGender, setTrendingOppositeGender] = useState([]);
  const [nearbyOppositeGender, setNearbyOppositeGender] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOpposite: 0,
    onlineNow: 0,
    newToday: 0,
  });
  // Add this at the beginning of the Home component in Home.jsx
  useEffect(() => {
    // Verify localStorage data is set
    const telegramUser = localStorage.getItem("telegramUser");
    const telegramId = localStorage.getItem("telegramId");

    console.log("Home component - localStorage check:", {
      telegramUser: telegramUser ? "exists" : "missing",
      telegramId: telegramId || "missing",
    });

    checkUserAndFetch();
  }, []);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    try {
      // Get user from localStorage (set during login)
      const storedUser = localStorage.getItem("telegramUser");
      const telegramId = localStorage.getItem("telegramId");

      console.log("Stored user:", storedUser);
      console.log("Telegram ID:", telegramId);

      if (!telegramId && !storedUser) {
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
      const telegramData = JSON.parse(
        localStorage.getItem("telegramUser") || "{}",
      );
      const telegramId = telegramData.id || localStorage.getItem("telegramId");

      if (!telegramId) {
        navigate("/login");
        return;
      }

      console.log("Fetching user with telegram_id:", telegramId);

      // Fetch current user from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);

        // If user not found in database but exists in localStorage, clear localStorage and redirect
        if (userError.code === "PGRST116") {
          localStorage.removeItem("telegramUser");
          localStorage.removeItem("telegramId");
          localStorage.removeItem("lastUser");
          navigate("/login");
          return;
        }
        throw userError;
      }

      console.log("User from users table:", userData);

      // Fetch the latest verification for this user from student_verifications table
      const { data: verificationData, error: verificationError } =
        await supabase
          .from("student_verifications")
          .select("*")
          .eq("user_id", userData.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (verificationError) {
        console.error("Error fetching verification:", verificationError);
      }

      console.log("Verification data:", verificationData);

      // Merge user data with verification data
      // Priority: userData fields first, then fallback to verificationData
      const completeUser = {
        ...userData,
        // If user table doesn't have these fields, use from verification
        full_name: userData.full_name || verificationData?.full_name || "",
        university_name:
          userData.university_name || verificationData?.university_name || "",
        department: userData.department || verificationData?.department || "",
        student_year:
          userData.student_year || verificationData?.student_year || "",
        student_id: userData.student_id || verificationData?.student_id || "",
        // Use verification status from either table
        verification_status:
          userData.verification_status || verificationData?.status || "pending",
        // Store verification data separately if needed
        verification: verificationData || null,
      };

      console.log("Complete user data:", completeUser);

      setCurrentUser(completeUser);

      // Update localStorage with complete user data
      localStorage.setItem(
        "telegramUser",
        JSON.stringify({
          id: completeUser.telegram_id,
          first_name: completeUser.first_name,
          last_name: completeUser.last_name,
          full_name: completeUser.full_name,
          photo_url: completeUser.photo_url,
          university_name: completeUser.university_name,
          department: completeUser.department,
          student_year: completeUser.student_year,
          gender: completeUser.gender,
          verification_status: completeUser.verification_status,
        }),
      );

      // Fetch all opposite gender users
      await fetchOppositeGenderUsers(completeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOppositeGenderUsers = async (user) => {
    try {
      // Determine opposite gender
      const oppositeGender = user.gender === "male" ? "female" : "male";

      console.log(
        `Current user gender: ${user.gender}, fetching opposite gender: ${oppositeGender}`,
      );

      // If user gender is not set, default to showing both? Or handle error
      if (!user.gender) {
        console.error("User gender is not set!");
        setOppositeGenderUsers([]);
        return;
      }

      // Fetch ALL opposite gender verified users with their latest verification data
      const { data, error, count } = await supabase
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
          university_name,
          graduation_year,
          interests,
          bio,
          location,
          created_at
        `,
          { count: "exact" },
        )
        .eq("gender", oppositeGender)
        .eq("verification_status", "verified")
        .neq("telegram_id", user.telegram_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching opposite gender users:", error);
        throw error;
      }

      console.log(`Found ${data.length} ${oppositeGender} users`);

      // For each user, fetch their latest verification data
      const usersWithVerification = await Promise.all(
        data.map(async (userData) => {
          const { data: verification } = await supabase
            .from("student_verifications")
            .select("university_name, department, student_year, full_name")
            .eq("user_id", userData.id)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...userData,
            // Use verification data as fallback
            university_name:
              userData.university_name ||
              verification?.university_name ||
              "University",
            full_name:
              userData.full_name ||
              verification?.full_name ||
              `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
              "User",
            department: userData.department || verification?.department || "",
            student_year:
              userData.student_year || verification?.student_year || "",
          };
        }),
      );

      console.log(
        "Users with verification data:",
        usersWithVerification.slice(0, 3),
      );

      // Format all users for main display
      const formattedUsers = usersWithVerification.map((match) => ({
        id: match.id,
        name:
          match.full_name ||
          `${match.first_name || ""} ${match.last_name || ""}`.trim() ||
          "User",
        age: calculateAge(match.graduation_year),
        university: match.university_name || "University",
        image:
          match.photo_url ||
          (match.gender === "female"
            ? "https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400"
            : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"),
        interests: match.interests || ["Student", "Friendly"],
        verified: match.verification_status === "verified",
        location: match.location || "On Campus",
        isNew: isNewUser(match.created_at),
      }));

      setOppositeGenderUsers(formattedUsers);

      // Set trending (random selection for variety)
      const shuffled = [...formattedUsers].sort(() => 0.5 - Math.random());
      setTrendingOppositeGender(shuffled.slice(0, 6));

      // Set nearby (random selection)
      setNearbyOppositeGender(shuffled.slice(0, 4));

      // Update stats
      setStats({
        totalOpposite: count || 0,
        onlineNow: Math.floor(count * 0.3), // 30% online estimate
        newToday: formattedUsers.filter((u) => u.isNew).length,
      });
    } catch (error) {
      console.error("Error fetching opposite gender users:", error);
      setOppositeGenderUsers([]);
    }
  };

  const isNewUser = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  const calculateAge = (graduationYear) => {
    if (!graduationYear) return 22;
    const currentYear = new Date().getFullYear();
    return 22 - (graduationYear - currentYear);
  };

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

  // Helper function to get gender display text
  const getGenderDisplayText = () => {
    if (!currentUser?.gender) return "People";
    return currentUser.gender === "male" ? "Women" : "Men";
  };

  // Get user's first name for greeting
  const getUserFirstName = () => {
    if (currentUser?.first_name) return currentUser.first_name;
    if (currentUser?.full_name) return currentUser.full_name.split(" ")[0];
    return "User";
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
              Loading your matches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const genderDisplayText = getGenderDisplayText();
  const userFirstName = getUserFirstName();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            <p>
              <strong>Debug:</strong> Logged in as: {userFirstName}
            </p>
            <p>
              <strong>Debug:</strong> Full Name:{" "}
              {currentUser?.full_name || "Not set"}
            </p>
            <p>
              <strong>Debug:</strong> University:{" "}
              {currentUser?.university_name || "Not set"}
            </p>
            <p>
              <strong>Debug:</strong> Department:{" "}
              {currentUser?.department || "Not set"}
            </p>
            <p>
              <strong>Debug:</strong> User Gender:{" "}
              {currentUser?.gender || "Not set"}
            </p>
            <p>
              <strong>Debug:</strong> Verification Status:{" "}
              {currentUser?.verification_status || "Not set"}
            </p>
            <p>
              <strong>Debug:</strong> Showing: {genderDisplayText}
            </p>
            <p>
              <strong>Debug:</strong> Found {oppositeGenderUsers.length}{" "}
              profiles
            </p>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-10">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 ${getTextStyles()}`}
          >
            Hello, <span className="text-rose-500">{userFirstName}</span>
            {currentUser?.verification_status === "verified" && (
              <HiOutlineCheckCircle className="inline-block ml-2 w-8 h-8 text-green-500" />
            )}
          </h1>
          <p className={`text-lg max-w-2xl ${getSubtextStyles()}`}>
            {currentUser?.university_name ? (
              <>
                <span className="font-semibold text-rose-500">
                  {currentUser.university_name}
                </span>
                {currentUser?.department && ` • ${currentUser.department}`}
                {currentUser?.student_year && ` • ${currentUser.student_year}`}
              </>
            ) : (
              "Discover verified students near you"
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: genderDisplayText,
              value: stats.totalOpposite,
              icon: HiOutlineUserGroup,
            },
            {
              label: "Online Now",
              value: stats.onlineNow,
              icon: HiOutlineHeart,
            },
            {
              label: "New Today",
              value: stats.newToday,
              icon: HiOutlineSparkles,
            },
            { label: "Your Type", value: "100%", icon: HiOutlineUser },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyles()}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className={`w-8 h-8 ${isDark ? "text-rose-400" : "text-rose-500"}`}
                  />
                </div>
                <div className={`text-2xl font-bold ${getTextStyles()}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${getSubtextStyles()}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ALL Opposite Gender Users Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineHeart
                className={`w-6 h-6 ${isDark ? "text-rose-400" : "text-rose-500"}`}
              />
              <h2 className={`text-2xl font-bold ${getTextStyles()}`}>
                All {genderDisplayText}
              </h2>
            </div>
            <span className={`text-sm ${getSubtextStyles()}`}>
              {oppositeGenderUsers.length} profiles
            </span>
          </div>

          {oppositeGenderUsers.length === 0 ? (
            <div className={`text-center py-12 ${getSubtextStyles()}`}>
              <p>No {genderDisplayText.toLowerCase()} found yet.</p>
              <p className="text-sm mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {oppositeGenderUsers.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${getCardStyles()}`}
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="relative">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-64 object-cover"
                    />
                    {user.verified && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ✓ Verified
                      </div>
                    )}
                    {user.isNew && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className={`text-lg font-semibold ${getTextStyles()}`}
                      >
                        {user.name}
                      </h3>
                      <span className={`text-sm ${getSubtextStyles()}`}>
                        {user.age}
                      </span>
                    </div>
                    <p
                      className={`text-sm mb-2 flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineAcademicCap className="w-4 h-4" />
                      {user.university}
                    </p>
                    <p
                      className={`text-xs mb-3 flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineLocationMarker className="w-3 h-3" />
                      {user.location}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.interests.slice(0, 2).map((interest, i) => (
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
                    </div>
                    <button
                      className={`w-full py-2 rounded-xl font-medium transition ${
                        isDark
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-rose-500 hover:bg-rose-600 text-white"
                      }`}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Section */}
        {trendingOppositeGender.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineFire
                className={`w-6 h-6 ${isDark ? "text-orange-400" : "text-orange-500"}`}
              />
              <h2 className={`text-2xl font-bold ${getTextStyles()}`}>
                Popular {genderDisplayText}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingOppositeGender.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${getCardStyles()}`}
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="relative">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3
                      className={`text-lg font-semibold mb-2 ${getTextStyles()}`}
                    >
                      {user.name}
                    </h3>
                    <p
                      className={`text-sm mb-3 flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineAcademicCap className="w-4 h-4" />
                      {user.university}
                    </p>
                    <button
                      className={`w-full py-2 rounded-xl font-medium transition ${
                        isDark
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-rose-500 hover:bg-rose-600 text-white"
                      }`}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Section */}
        {nearbyOppositeGender.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineLocationMarker
                className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-500"}`}
              />
              <h2 className={`text-2xl font-bold ${getTextStyles()}`}>
                {genderDisplayText} Nearby
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nearbyOppositeGender.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 rounded-2xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl cursor-pointer ${getCardStyles()}`}
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold ${getTextStyles()}`}>
                      {user.name}
                    </h3>
                    <p
                      className={`text-sm mb-1 flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineAcademicCap className="w-4 h-4" />
                      {user.university}
                    </p>
                    <p
                      className={`text-xs flex items-center gap-1 ${getSubtextStyles()}`}
                    >
                      <HiOutlineLocationMarker className="w-3 h-3" />
                      {user.location}
                    </p>
                  </div>
                  <button
                    className={`p-2 rounded-full transition ${
                      isDark
                        ? "hover:bg-gray-700 text-rose-400"
                        : "hover:bg-rose-50 text-rose-500"
                    }`}
                  >
                    <HiOutlineHeart className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
