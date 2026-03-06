// components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import {
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineChat,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineChevronDown,
} from "react-icons/hi";

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    getUserData();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  // components/Navbar.jsx - Update getUserData function
  const getUserData = async () => {
    try {
      const telegramId = localStorage.getItem("telegramId");

      if (telegramId) {
        // Fetch only what's needed for the navbar
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, verification_status, photo_url")
          .eq("telegram_id", parseInt(telegramId))
          .maybeSingle();

        if (userData) {
          setUser(userData);
          setUserName(
            `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
              "User",
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("telegramUser");
    localStorage.removeItem("telegramId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("formData");
    setShowDropdown(false);
    setIsOpen(false);
    navigate("/");
  };

  // Theme-based styles
  const getNavbarStyles = () => {
    if (scrolled) {
      return isDark
        ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800"
        : "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100";
    }
    return isDark ? "bg-transparent" : "bg-transparent";
  };

  const getTextStyles = () => {
    if (scrolled) {
      return isDark
        ? "text-gray-200 hover:text-white"
        : "text-gray-700 hover:text-rose-600";
    }
    return "text-white hover:text-white/80";
  };

  const getIconStyles = () => {
    if (scrolled) {
      return isDark
        ? "text-gray-300 hover:text-white"
        : "text-gray-600 hover:text-rose-600";
    }
    return "text-white/80 hover:text-white";
  };

  const getDropdownStyles = () => {
    return isDark
      ? "bg-gray-800 border-gray-700 shadow-xl"
      : "bg-white border-gray-100 shadow-xl";
  };

  const navLinks = [
    { name: "Home", path: "/home", icon: HiOutlineHome },
    { name: "Matches", path: "/matches", icon: HiOutlineHeart },
    { name: "Messages", path: "/messages", icon: HiOutlineChat },
    { name: "Community", path: "/community", icon: HiOutlineUserGroup },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${getNavbarStyles()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className={`text-2xl font-bold tracking-tighter transition-colors duration-300 ${
                scrolled
                  ? isDark
                    ? "text-white"
                    : "text-rose-600"
                  : "text-white"
              }`}
            >
              MATCH
              <span
                className={
                  scrolled && !isDark ? "text-pink-400" : "text-pink-200"
                }
              >
                MAKER
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${getTextStyles()}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side Icons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ${getIconStyles()}`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <HiOutlineSun className="w-5 h-5" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button
                className={`relative p-2 rounded-full transition-all duration-200 ${getIconStyles()}`}
                onClick={() => navigate("/notifications")}
              >
                <HiOutlineBell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    scrolled
                      ? isDark
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark
                        ? "bg-gray-700"
                        : "bg-gradient-to-r from-rose-400 to-pink-500"
                    }`}
                  >
                    <HiOutlineUser className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {userName || "Profile"}
                  </span>
                  <HiOutlineChevronDown
                    className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-xl py-2 border ${getDropdownStyles()}`}
                  >
                    <Link
                      to="/profile"
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineUser className="w-4 h-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineCog className="w-4 h-4" />
                      Settings
                    </Link>

                    {/* Theme Toggle in Dropdown */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowDropdown(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      {isDark ? (
                        <>
                          <HiOutlineSun className="w-4 h-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <HiOutlineMoon className="w-4 h-4" />
                          Dark Mode
                        </>
                      )}
                    </button>

                    <hr
                      className={`my-1 ${isDark ? "border-gray-700" : "border-gray-100"}`}
                    />

                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition ${
                        isDark
                          ? "text-red-400 hover:bg-gray-700 hover:text-red-300"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled
                  ? isDark
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {isOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 transition-all duration-300 ease-in-out transform ${
            isOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0 pointer-events-none"
          } ${isDark ? "bg-gray-900" : "bg-white"} shadow-xl`}
          style={{ maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}
        >
          <div
            className={`px-4 py-6 space-y-4 ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            {/* User Info */}
            <div
              className={`flex items-center gap-3 pb-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-gray-800"
                    : "bg-gradient-to-r from-rose-400 to-pink-500"
                }`}
              >
                <HiOutlineUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <p
                  className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {userName || "Guest User"}
                </p>
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {user?.verification_status === "verified" ? (
                    <span className="text-green-500">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-500">
                      Pending verification
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isDark
                        ? "hover:bg-gray-800 hover:text-white"
                        : "hover:bg-rose-50 hover:text-rose-600"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Links */}
            <div
              className={`pt-4 border-t space-y-1 ${isDark ? "border-gray-800" : "border-gray-100"}`}
            >
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? "hover:bg-gray-800 hover:text-white"
                    : "hover:bg-rose-50 hover:text-rose-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineUser className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? "hover:bg-gray-800 hover:text-white"
                    : "hover:bg-rose-50 hover:text-rose-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineBell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? "hover:bg-gray-800 hover:text-white"
                    : "hover:bg-rose-50 hover:text-rose-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineCog className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>

              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full ${
                  isDark
                    ? "hover:bg-gray-800 hover:text-white"
                    : "hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                {isDark ? (
                  <>
                    <HiOutlineSun className="w-5 h-5" />
                    <span className="font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <HiOutlineMoon className="w-5 h-5" />
                    <span className="font-medium">Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full ${
                isDark
                  ? "text-red-400 hover:bg-gray-800 hover:text-red-300"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <HiOutlineLogout className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${
            isDark ? "bg-black/50" : "bg-black/20"
          } backdrop-blur-sm`}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
