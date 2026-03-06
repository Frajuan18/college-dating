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
  HiOutlineX
} from 'react-icons/hi';

const MyProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    university_name: '',
    department: '',
    student_year: '',
    student_id: '',
    gender: '',
    bio: '',
    interests: [],
    location: '',
    graduation_year: ''
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [stats, setStats] = useState({
    profileViews: 0,
    likesReceived: 0,
    matches: 0
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get current user from localStorage
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        navigate('/');
        return;
      }

      console.log('Fetching profile for telegram ID:', telegramId);

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError) throw userError;
      
      console.log('User data fetched:', userData);
      setUser(userData);
      
      // Initialize edit form with user data
      setEditForm({
        full_name: userData.full_name || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        university_name: userData.university_name || '',
        department: userData.department || '',
        student_year: userData.student_year || '',
        student_id: userData.student_id || '',
        gender: userData.gender || '',
        bio: userData.bio || '',
        interests: userData.interests || [],
        location: userData.location || '',
        graduation_year: userData.graduation_year || ''
      });

      // Fetch verification status from student_verifications
      const { data: verificationData, error: verifError } = await supabase
        .from('student_verifications')
        .select('*')
        .eq('user_id', userData.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (verifError && verifError.code !== 'PGRST116') throw verifError;

      if (verificationData) {
        console.log('Verification data:', verificationData);
        setVerificationStatus(verificationData.status);
        setVerificationData(verificationData);
      }

      // Fetch stats (you can replace with real data later)
      setStats({
        profileViews: Math.floor(Math.random() * 100) + 20,
        likesReceived: Math.floor(Math.random() * 50) + 10,
        matches: Math.floor(Math.random() * 20) + 5
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
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
      
      // Prepare update data
      const updateData = {
        full_name: editForm.full_name,
        first_name: editForm.full_name?.split(' ')[0] || editForm.first_name,
        last_name: editForm.full_name?.split(' ').slice(1).join(' ') || editForm.last_name,
        university_name: editForm.university_name,
        department: editForm.department,
        student_year: editForm.student_year,
        student_id: editForm.student_id,
        gender: editForm.gender,
        bio: editForm.bio,
        interests: editForm.interests,
        location: editForm.location,
        graduation_year: editForm.graduation_year,
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
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('telegramId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('formData');
    navigate('/');
  };

  const getVerificationBadge = () => {
    switch(verificationStatus) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineCheckCircle className="w-4 h-4" />
            Verified Student
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineClock className="w-4 h-4" />
            Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm">
            <HiOutlineXCircle className="w-4 h-4" />
            Verification Rejected
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

  const getInputStyles = () => {
    return isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500';
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
        
        {/* Profile Header with Actions */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className={`text-3xl md:text-4xl font-bold ${getTextStyles()}`}>
            My Profile
          </h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
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
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <HiOutlineX className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <HiOutlineSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className={`rounded-2xl shadow-lg overflow-hidden ${getCardStyles()} mb-6`}>
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-rose-400 to-pink-500 relative">
            {isEditing && (
              <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition">
                <HiOutlineCamera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                  {user?.photo_url ? (
                    <img 
                      src={user.photo_url} 
                      alt={`${user.first_name} ${user.last_name}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {editForm.full_name?.[0] || user?.first_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-rose-500 p-2 rounded-full text-white hover:bg-rose-600 transition">
                    <HiOutlineCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Name and Verification Status */}
            <div className="text-center mb-6">
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={`text-2xl font-bold text-center w-full mb-2 p-2 rounded-lg border ${getInputStyles()}`}
                />
              ) : (
                <h2 className={`text-2xl font-bold mb-2 ${getTextStyles()}`}>
                  {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                </h2>
              )}
              <div className="flex justify-center mb-2">
                {getVerificationBadge()}
              </div>
              {user?.telegram_username && (
                <p className={`text-sm ${getSubtextStyles()}`}>
                  @{user.telegram_username}
                </p>
              )}
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-2 ${getTextStyles()}`}>About Me</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border ${getInputStyles()}`}
                  rows="4"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className={`${getSubtextStyles()} leading-relaxed`}>
                  {user?.bio || 'No bio added yet. Click edit to add one!'}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* University */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineAcademicCap className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>University</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="university_name"
                    value={editForm.university_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                    placeholder="Your university"
                  />
                ) : (
                  <p className={getSubtextStyles()}>{user?.university_name || 'Not specified'}</p>
                )}
              </div>

              {/* Department */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineBookOpen className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Department</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                    placeholder="Your department"
                  />
                ) : (
                  <p className={getSubtextStyles()}>{user?.department || 'Not specified'}</p>
                )}
              </div>

              {/* Year of Study */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineCalendar className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Year of Study</span>
                </div>
                {isEditing ? (
                  <select
                    name="student_year"
                    value={editForm.student_year}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduate">Graduate Student</option>
                    <option value="PhD">PhD Student</option>
                  </select>
                ) : (
                  <p className={getSubtextStyles()}>{user?.student_year || 'Not specified'}</p>
                )}
              </div>

              {/* Student ID */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineBriefcase className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Student ID</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="student_id"
                    value={editForm.student_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                    placeholder="Your student ID"
                  />
                ) : (
                  <p className={getSubtextStyles()}>{user?.student_id || 'Not specified'}</p>
                )}
              </div>

              {/* Gender */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineUser className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Gender</span>
                </div>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className={getSubtextStyles()}>{user?.gender || 'Not specified'}</p>
                )}
              </div>

              {/* Location */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <HiOutlineLocationMarker className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${getTextStyles()}`}>Location</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${getInputStyles()}`}
                    placeholder="Your location"
                  />
                ) : (
                  <p className={getSubtextStyles()}>{user?.location || 'On Campus'}</p>
                )}
              </div>
            </div>

            {/* Interests Section */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-3 ${getTextStyles()}`}>Interests</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editForm.interests.map((interest, index) => (
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
                      className={`flex-1 p-2 rounded-xl border ${getInputStyles()}`}
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
                  {user?.interests?.length > 0 ? (
                    user.interests.map((interest, index) => (
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
                    ))
                  ) : (
                    <p className={getSubtextStyles()}>No interests added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={`grid grid-cols-3 gap-4 rounded-2xl shadow-lg p-6 ${getCardStyles()}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>{stats.profileViews}</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Profile Views</div>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>{stats.likesReceived}</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Likes Received</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTextStyles()}`}>{stats.matches}</div>
            <div className={`text-sm ${getSubtextStyles()}`}>Matches</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;