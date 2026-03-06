// pages/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { 
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineHeart,
  HiOutlineCamera,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineLogout,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineMail
} from 'react-icons/hi';

const MyProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Edit form states - only bio and interests are editable
  const [editForm, setEditForm] = useState({
    bio: '',
    interests: []
  });
  
  const [interestInput, setInterestInput] = useState('');
  
  // Stats set to zero
  const [stats] = useState({
    profileViews: 0,
    likesReceived: 0,
    matches: 0
  });

  useEffect(() => {
    checkUserAndFetchProfile();
  }, []);

  const checkUserAndFetchProfile = async () => {
    try {
      // Get current user from localStorage
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      // If no user is logged in, redirect to login
      if (!telegramId) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching profile for telegram ID:', telegramId);

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        // If user not found in database, redirect to login
        navigate('/login');
        return;
      }
      
      console.log('User from users table:', userData);

      // Fetch the latest verification for this user
      const { data: verificationData, error: verificationError } = await supabase
        .from('student_verifications')
        .select('*')
        .eq('user_id', userData.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (verificationError) {
        console.error('Error fetching verification:', verificationError);
      }

      console.log('Verification data:', verificationData);

      // Merge user data with verification data
      const completeUser = {
        ...userData,
        full_name: userData.full_name || verificationData?.full_name || '',
        university_name: userData.university_name || verificationData?.university_name || '',
        department: userData.department || verificationData?.department || '',
        student_year: userData.student_year || verificationData?.student_year || '',
        student_id: userData.student_id || verificationData?.student_id || '',
        verification_status: userData.verification_status || verificationData?.status || 'pending',
        verification: verificationData || null
      };
      
      setUser(completeUser);
      
      // Initialize edit form with only bio and interests
      setEditForm({
        bio: completeUser.bio || '',
        interests: completeUser.interests || []
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Prepare update data - only bio and interests
      const updateData = {
        bio: editForm.bio,
        interests: editForm.interests,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => ({
        ...prev,
        ...updateData
      }));
      
      setIsEditing(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      console.log('Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !editForm.interests.includes(interestInput.trim())) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('telegramId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('formData');
    localStorage.removeItem('lastUser');
    
    console.log('User logged out, redirecting to login');
    
    // Redirect to login page
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getVerificationBadge = () => {
    if (!user) return null;
    
    switch(user.verification_status) {
      case 'verified':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm rounded-full">
            <HiOutlineCheckCircle className="w-4 h-4" />
            Verified Student
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm rounded-full">
            <HiOutlineClock className="w-4 h-4" />
            Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 text-xs sm:text-sm rounded-full">
            <HiOutlineXCircle className="w-4 h-4" />
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 text-xs sm:text-sm rounded-full">
            <HiOutlineClock className="w-4 h-4" />
            Not Verified
          </span>
        );
    }
  };

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700'
      : 'bg-white/90 backdrop-blur-sm border-gray-100';
  };

  const getTextStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  const getInputStyles = () => {
    return isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className={`animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 ${
            isDark ? 'border-gray-700 border-t-rose-500' : 'border-gray-200 border-t-rose-500'
          }`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-green-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm sm:text-base">
              <HiOutlineCheckCircle className="w-5 h-5" />
              Profile updated successfully!
            </div>
          </div>
        )}
        
        {/* Profile Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextStyles()}`}>
              My Profile
            </h1>
            <p className={`text-sm sm:text-base ${getSubtextStyles()} mt-1`}>
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base flex-1 sm:flex-none ${
                    isDark
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  <span className="sm:inline">Edit Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base flex-1 sm:flex-none ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  <span className="sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      bio: user?.bio || '',
                      interests: user?.interests || []
                    });
                  }}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base flex-1 sm:flex-none ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <HiOutlineX className="w-4 h-4" />
                  <span className="sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition text-sm sm:text-base flex-1 sm:flex-none ${
                    isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineSave className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className={`rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border ${getCardStyles()} mb-4 sm:mb-6`}>
          {/* Cover Photo */}
          <div className="h-20 sm:h-32 bg-gradient-to-r from-rose-400 to-pink-500 relative"></div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-8 sm:-mt-12 mb-3 sm:mb-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
                  {user?.photo_url ? (
                    <img 
                      src={user.photo_url} 
                      alt={user?.full_name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-xl sm:text-3xl font-bold ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {user?.full_name?.[0] || user?.first_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name and Verification */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${getTextStyles()}`}>
                {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
              </h2>
              <div className="flex justify-center mb-2">
                {getVerificationBadge()}
              </div>
              {user?.telegram_username && (
                <p className={`text-xs sm:text-sm flex items-center justify-center gap-1 ${getSubtextStyles()}`}>
                  <HiOutlineMail className="w-3 h-3 sm:w-4 sm:h-4" />
                  @{user.telegram_username}
                </p>
              )}
            </div>

            {/* Bio Section - Editable */}
            <div className="mb-4 sm:mb-6">
              <h3 className={`text-base sm:text-lg font-semibold mb-2 ${getTextStyles()}`}>About Me</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border text-sm sm:text-base ${getInputStyles()}`}
                  rows="4"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className={`${getSubtextStyles()} leading-relaxed text-sm sm:text-base`}>
                  {user?.bio || 'No bio added yet. Click edit to add one!'}
                </p>
              )}
            </div>

            {/* Details Grid - Read Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* University */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineAcademicCap className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>University</span>
                </div>
                <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                  {user?.university_name || 'Not specified'}
                </p>
              </div>

              {/* Department */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineBookOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>Department</span>
                </div>
                <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                  {user?.department || 'Not specified'}
                </p>
              </div>

              {/* Year of Study */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineCalendar className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>Year of Study</span>
                </div>
                <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                  {user?.student_year || 'Not specified'}
                </p>
              </div>

              {/* Student ID */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineBriefcase className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>Student ID</span>
                </div>
                <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                  {user?.student_id || 'Not specified'}
                </p>
              </div>

              {/* Gender */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineUser className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>Gender</span>
                </div>
                <p className={`text-sm sm:text-base capitalize ${getSubtextStyles()}`}>
                  {user?.gender || 'Not specified'}
                </p>
              </div>

              {/* Location */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <HiOutlineLocationMarker className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getTextStyles()}`}>Location</span>
                </div>
                <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                  {user?.location || 'On Campus'}
                </p>
              </div>
            </div>

            {/* Interests Section - Editable */}
            <div className="mb-4 sm:mb-6">
              <h3 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${getTextStyles()}`}>Interests</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {editForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          isDark
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-0.5 hover:text-red-500"
                        >
                          <HiOutlineXCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add an interest..."
                      className={`w-full p-2 rounded-lg border text-sm ${getInputStyles()}`}
                    />
                    <button
                      onClick={addInterest}
                      className={`px-4 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap ${
                        isDark
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-rose-500 hover:bg-rose-600 text-white'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {user?.interests?.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          isDark
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className={`${getSubtextStyles()} text-sm`}>No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Join Date */}
            <div className={`text-xs sm:text-sm ${getSubtextStyles()} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-3 sm:pt-4`}>
              <span>Joined: {formatDate(user?.created_at)}</span>
              {user?.updated_at && user?.updated_at !== user?.created_at && (
                <span className="ml-2">• Last updated: {formatDate(user?.updated_at)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card - All set to zero */}
        <div className={`grid grid-cols-3 gap-2 sm:gap-4 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border ${getCardStyles()}`}>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${getTextStyles()}`}>{stats.profileViews}</div>
            <div className={`text-xs sm:text-sm ${getSubtextStyles()}`}>Profile Views</div>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <div className={`text-lg sm:text-2xl font-bold ${getTextStyles()}`}>{stats.likesReceived}</div>
            <div className={`text-xs sm:text-sm ${getSubtextStyles()}`}>Likes Received</div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${getTextStyles()}`}>{stats.matches}</div>
            <div className={`text-xs sm:text-sm ${getSubtextStyles()}`}>Matches</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;