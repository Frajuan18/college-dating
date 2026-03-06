// pages/Matches.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
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
  HiOutlineRefresh
} from 'react-icons/hi';

const Matches = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'messages'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    interests: []
  });

  // Sample user data for matches
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const sampleMatches = [
        {
          id: 1,
          name: 'Emma Watson',
          age: 24,
          university: 'Stanford University',
          department: 'Computer Science',
          year: '3rd Year',
          location: 'Palo Alto, CA',
          image: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400',
          interests: ['Photography', 'Hiking', 'Coffee', 'Travel'],
          matchPercentage: 95,
          lastActive: '5 min ago',
          isOnline: true,
          isNew: true,
          hasMessage: false,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 92,
            location: 85,
            university: 100
          }
        },
        {
          id: 2,
          name: 'Sophia Chen',
          age: 22,
          university: 'UC Berkeley',
          department: 'Business',
          year: '2nd Year',
          location: 'Berkeley, CA',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          interests: ['Yoga', 'Reading', 'Art', 'Music'],
          matchPercentage: 88,
          lastActive: '2 hours ago',
          isOnline: false,
          isNew: true,
          hasMessage: true,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 88,
            location: 90,
            university: 75
          }
        },
        {
          id: 3,
          name: 'Olivia Martinez',
          age: 23,
          university: 'UCLA',
          department: 'Psychology',
          year: '4th Year',
          location: 'Los Angeles, CA',
          image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
          interests: ['Dancing', 'Cooking', 'Movies', 'Fitness'],
          matchPercentage: 92,
          lastActive: '1 day ago',
          isOnline: false,
          isNew: false,
          hasMessage: false,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 94,
            location: 80,
            university: 85
          }
        },
        {
          id: 4,
          name: 'Isabella Kim',
          age: 21,
          university: 'USC',
          department: 'Architecture',
          year: '2nd Year',
          location: 'Los Angeles, CA',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          interests: ['Design', 'Photography', 'Travel', 'Art'],
          matchPercentage: 85,
          lastActive: 'Just now',
          isOnline: true,
          isNew: true,
          hasMessage: false,
          verified: false,
          gender: 'female',
          compatibility: {
            interests: 82,
            location: 95,
            university: 70
          }
        },
        {
          id: 5,
          name: 'Mia Thompson',
          age: 24,
          university: 'NYU',
          department: 'Journalism',
          year: 'Graduate',
          location: 'New York, NY',
          image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
          interests: ['Writing', 'Podcasts', 'Coffee', 'Theater'],
          matchPercentage: 90,
          lastActive: '3 hours ago',
          isOnline: false,
          isNew: false,
          hasMessage: true,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 91,
            location: 65,
            university: 88
          }
        },
        {
          id: 6,
          name: 'Charlotte Brown',
          age: 22,
          university: 'Columbia University',
          department: 'Political Science',
          year: '3rd Year',
          location: 'New York, NY',
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
          interests: ['Debate', 'Reading', 'Yoga', 'Volunteering'],
          matchPercentage: 87,
          lastActive: '6 hours ago',
          isOnline: false,
          isNew: false,
          hasMessage: false,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 84,
            location: 70,
            university: 92
          }
        },
        {
          id: 7,
          name: 'Amelia Davis',
          age: 23,
          university: 'University of Chicago',
          department: 'Economics',
          year: '4th Year',
          location: 'Chicago, IL',
          image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
          interests: ['Finance', 'Chess', 'Running', 'Music'],
          matchPercentage: 82,
          lastActive: '1 day ago',
          isOnline: false,
          isNew: false,
          hasMessage: false,
          verified: true,
          gender: 'female',
          compatibility: {
            interests: 79,
            location: 88,
            university: 75
          }
        },
        {
          id: 8,
          name: 'Evelyn Rodriguez',
          age: 21,
          university: 'University of Miami',
          department: 'Marine Biology',
          year: '2nd Year',
          location: 'Miami, FL',
          image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
          interests: ['Scuba Diving', 'Beach', 'Photography', 'Animals'],
          matchPercentage: 94,
          lastActive: '30 min ago',
          isOnline: true,
          isNew: true,
          hasMessage: true,
          verified: false,
          gender: 'female',
          compatibility: {
            interests: 96,
            location: 92,
            university: 85
          }
        }
      ];

      setMatches(sampleMatches);
      setFilteredMatches(sampleMatches);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter matches based on search and filters
  useEffect(() => {
    let filtered = [...matches];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(match => 
        match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by active tab
    if (activeTab === 'new') {
      filtered = filtered.filter(match => match.isNew);
    } else if (activeTab === 'messages') {
      filtered = filtered.filter(match => match.hasMessage);
    }

    // Apply filters
    if (filters.university) {
      filtered = filtered.filter(match => match.university === filters.university);
    }

    if (filters.interests.length > 0) {
      filtered = filtered.filter(match => 
        filters.interests.some(interest => match.interests.includes(interest))
      );
    }

    setFilteredMatches(filtered);
  }, [searchQuery, activeTab, filters, matches]);

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
      : 'bg-white border-gray-100 hover:border-rose-200';
  };

  const getTextStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  const getActiveTabStyles = (tab) => {
    const baseStyles = "px-4 py-2 rounded-full text-sm font-medium transition-all";
    if (activeTab === tab) {
      return `${baseStyles} bg-rose-500 text-white shadow-lg`;
    }
    return `${baseStyles} ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'}`;
  };

  const getMatchPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getUniqueUniversities = () => {
    const universities = [...new Set(matches.map(m => m.university))];
    return universities;
  };

  const getUniqueInterests = () => {
    const allInterests = matches.flatMap(m => m.interests);
    return [...new Set(allInterests)];
  };

  const handleFilterChange = (type, value) => {
    if (type === 'university') {
      setFilters(prev => ({ ...prev, university: value }));
    } else if (type === 'interest') {
      setFilters(prev => ({
        ...prev,
        interests: prev.interests.includes(value)
          ? prev.interests.filter(i => i !== value)
          : [...prev.interests, value]
      }));
    }
  };

  const clearFilters = () => {
    setFilters({ university: '', interests: [] });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 ${
              isDark ? 'border-gray-700 border-t-rose-500' : 'border-gray-200 border-t-rose-500'
            }`}></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Finding your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${getTextStyles()}`}>
                Your Matches
              </h1>
              <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                {filteredMatches.length} people you might like
              </p>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
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
            <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by name, university, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-rose-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500 shadow-sm'
              }`}
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold ${getTextStyles()}`}>Filters</h3>
                <button
                  onClick={clearFilters}
                  className={`text-sm flex items-center gap-1 ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                  Clear all
                </button>
              </div>

              {/* University Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${getTextStyles()}`}>
                  University
                </label>
                <select
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Universities</option>
                  {getUniqueUniversities().map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>

              {/* Interests Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${getTextStyles()}`}>
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {getUniqueInterests().slice(0, 10).map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleFilterChange('interest', interest)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        filters.interests.includes(interest)
                          ? 'bg-rose-500 text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              onClick={() => setActiveTab('all')}
              className={getActiveTabStyles('all')}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={getActiveTabStyles('new')}
            >
              New
              {matches.filter(m => m.isNew).length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'new' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                }`}>
                  {matches.filter(m => m.isNew).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={getActiveTabStyles('messages')}
            >
              Messages
              {matches.filter(m => m.hasMessage).length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'messages' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                }`}>
                  {matches.filter(m => m.hasMessage).length}
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
            <p className="text-sm">Try adjusting your filters or search query</p>
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

                  {/* Online Status */}
                  {match.isOnline && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Match Percentage */}
                  <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${
                    isDark ? 'bg-gray-900/90' : 'bg-white/90'
                  } ${getMatchPercentageColor(match.matchPercentage)}`}>
                    {match.matchPercentage}% Match
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Name and Age */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-semibold ${getTextStyles()}`}>
                      {match.name}, {match.age}
                    </h3>
                  </div>

                  {/* University */}
                  <p className={`text-sm mb-2 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {match.university} • {match.year}
                  </p>

                  {/* Department */}
                  <p className={`text-xs mb-2 ${getSubtextStyles()}`}>
                    {match.department}
                  </p>

                  {/* Location */}
                  <p className={`text-xs mb-3 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineLocationMarker className="w-3 h-3" />
                    {match.location}
                  </p>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {match.interests.slice(0, 3).map((interest, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {interest}
                      </span>
                    ))}
                    {match.interests.length > 3 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        +{match.interests.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Last Active */}
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${getSubtextStyles()}`}>
                      <HiOutlineClock className="inline w-3 h-3 mr-1" />
                      {match.lastActive}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {match.hasMessage && (
                        <button className={`p-2 rounded-full transition ${
                          isDark 
                            ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' 
                            : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                        }`}>
                          <HiOutlineChat className="w-4 h-4" />
                        </button>
                      )}
                      <button className={`p-2 rounded-full transition ${
                        isDark 
                          ? 'bg-rose-600 text-white hover:bg-rose-700' 
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}>
                        <HiOutlineHeart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compatibility Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={getSubtextStyles()}>Compatibility</span>
                      <span className={getMatchPercentageColor(match.matchPercentage)}>
                        {match.matchPercentage}%
                      </span>
                    </div>
                    <div className={`w-full h-1 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-1 rounded-full ${
                          match.matchPercentage >= 90 ? 'bg-green-500' :
                          match.matchPercentage >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
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

        {/* Load More Button */}
        {filteredMatches.length > 0 && filteredMatches.length < matches.length && (
          <div className="text-center mt-8">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition ${
                isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              Load More Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;