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
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineGlobe
} from 'react-icons/hi';

const MyProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedInterests, setEditedInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        navigate('/');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError) throw userError;

      // Get verification status
      const { data: verificationData } = await supabase
        .from('student_verifications')
        .select('status')
        .eq('user_id', userData.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      setUser(userData);
      setEditedBio(userData.bio || 'No bio added yet. Click edit to add one!');
      setEditedInterests(userData.interests || ['Student', 'Friendly']);
      setVerificationStatus(verificationData?.status || 'pending');
      
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          bio: editedBio,
          interests: editedInterests
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => ({
        ...prev,
        bio: editedBio,
        interests: editedInterests
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !editedInterests.includes(interestInput.trim())) {
      setEditedInterests([...editedInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setEditedInterests(editedInterests.filter(i => i !== interest));
  };

  const getVerificationBadge = () => {
    switch(verificationStatus) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineCheckCircle className="w-4 h-4" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineClock className="w-4 h-4" />
            Pending Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineXCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-gray-500 bg-gray-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineClock className="w-4 h-4" />
            Not Verified
          </span>
        );
    }
  };

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-100';
  };

  const getTextStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 ${
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
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className={`text-3xl md:text-4xl font-bold ${getTextStyles()}`}>
            My Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                isDark
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              <HiOutlinePencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Main Profile Card */}
        <div className={`rounded-2xl shadow-lg overflow-hidden ${getCardStyles()} mb-6`}>
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-rose-400 to-pink-500 relative">
            <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition">
              <HiOutlineCamera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                  {user?.photo_url ? (
                    <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-rose-500 p-2 rounded-full text-white hover:bg-rose-600 transition">
                  <HiOutlineCamera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Name and Status */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${getTextStyles()}`}>
                {user?.first_name} {user?.last_name}
              </h2>
              <div className="flex justify-center">
                {getVerificationBadge()}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-2 ${getTextStyles()}`}>About Me</h3>
              {isEditing ? (
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className={`w-full p-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  rows="4"
                />
              ) : (
                <p className={`${getSubtextStyles()} leading-relaxed`}>
                  {user?.bio || 'No bio added yet. Click edit to add one!'}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineAcademicCap className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>University</span>
                </div>
                <p className={getSubtextStyles()}>{user?.university_name || 'Not specified'}</p>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineCalendar className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Graduation Year</span>
                </div>
                <p className={getSubtextStyles()}>{user?.graduation_year || 'Not specified'}</p>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineUser className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Gender</span>
                </div>
                <p className={getSubtextStyles()}>{user?.gender || 'Not specified'}</p>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineLocationMarker className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Location</span>
                </div>
                <p className={getSubtextStyles()}>{user?.location || 'On Campus'}</p>
              </div>
            </div>

            {/* Interests Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${getTextStyles()}`}>Interests</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editedInterests.map((interest, index) => (
                      <span
                        key={index}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          isDark
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-red-500"
                        >
                          <HiOutlineXCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add an interest..."
                      className={`flex-1 p-2 rounded-xl border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={addInterest}
                      className={`px-4 py-2 rounded-xl font-medium transition ${
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
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={`grid grid-cols-3 gap-4 rounded-2xl shadow-lg p-6 ${getCardStyles()}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>0</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Matches</div>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>0</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Likes</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>0</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Views</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;