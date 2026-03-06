// src/pages/admin/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ProtectedRoute from '../../components/ProtectedRoute';

const AdminDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [imagePreview, setImagePreview] = useState(null);
  const [userData, setUserData] = useState({}); // Store user data for each verification

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    setLoading(true);
    
    let query = supabase
      .from('student_verifications')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Apply filter based on active tab
    if (activeTab !== 'all') {
      query = query.eq('status', activeTab);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching verifications:', error);
    } else {
      console.log(`${activeTab} verifications:`, data);
      setVerifications(data);
      
      // Fetch user data for each verification
      if (data && data.length > 0) {
        const userIds = data.map(v => v.user_id).filter(id => id);
        if (userIds.length > 0) {
          const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, gender, student_year, first_name, last_name')
            .in('id', userIds);

          if (!userError && users) {
            const userMap = {};
            users.forEach(user => {
              userMap[user.id] = user;
            });
            setUserData(userMap);
          }
        }
      }
    }
    
    setLoading(false);
  };

  const handleVerification = async (id, status) => {
    try {
      // Get the verification data first
      const { data: verification, error: fetchError } = await supabase
        .from('student_verifications')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the verification status
      const { error: updateError } = await supabase
        .from('student_verifications')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // If approved, also update the users table with verification status
      if (status === 'approved' && verification?.user_id) {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            verification_status: 'verified',
            updated_at: new Date().toISOString(),
            // Also copy over any missing user data from verification
            university_name: verification.university_name,
            department: verification.department,
            student_year: verification.student_year,
            student_id: verification.student_id
          })
          .eq('id', verification.user_id);

        if (userUpdateError) {
          console.error('Error updating user verification status:', userUpdateError);
        }
      }

      // If rejected, you might want to update the users table status as well
      if (status === 'rejected' && verification?.user_id) {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            verification_status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', verification.user_id);

        if (userUpdateError) {
          console.error('Error updating user rejection status:', userUpdateError);
        }
      }

      // Remove the image if rejected (optional)
      if (status === 'rejected' && verification?.id_photo_path) {
        await supabase.storage
          .from('student-ids')
          .remove([verification.id_photo_path]);
      }

      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications(); // Refresh the list
      fetchCounts(); // Refresh counts
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing verification');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/admin/login';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const openImagePreview = (url) => {
    setImagePreview(url);
  };

  // Get counts for each status
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('student_verifications')
      .select('status');

    if (!error && data) {
      const pending = data.filter(v => v.status === 'pending').length;
      const approved = data.filter(v => v.status === 'approved').length;
      const rejected = data.filter(v => v.status === 'rejected').length;
      
      setCounts({
        pending,
        approved,
        rejected,
        all: data.length
      });
    }
  };

  // Helper function to get user gender
  const getUserGender = (verification) => {
    // First try to get from userData
    if (userData[verification.user_id]?.gender) {
      return userData[verification.user_id].gender;
    }
    // Fallback to verification data if available
    return verification.gender || 'Not specified';
  };

  // Helper function to get student year
  const getStudentYear = (verification) => {
    // First try to get from userData
    if (userData[verification.user_id]?.student_year) {
      return userData[verification.user_id].student_year;
    }
    // Fallback to verification data
    return verification.student_year || 'Not specified';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Verifications</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base w-full sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Status Tabs - Scrollable on mobile */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <nav className="flex -mb-px space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Approved ({counts.approved})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'rejected'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected ({counts.rejected})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({counts.all})
              </button>
            </nav>
          </div>

          {/* Status Header */}
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 capitalize">
              {activeTab} Verifications
              <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
                ({verifications.length} {verifications.length === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>

          {/* Verifications Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-base sm:text-lg">No {activeTab} verifications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year of Study</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4">
                          {v.id_photo_url ? (
                            <button
                              onClick={() => openImagePreview(v.id_photo_url)}
                              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                            >
                              View Photo
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">No photo</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">{v.university_name}</td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">{v.student_id}</td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                          {getStudentYear(v)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 capitalize">
                          {getUserGender(v)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">
                          {new Date(v.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {v.status === 'pending' ? (
                            <button
                              onClick={() => setSelectedVerification(v)}
                              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedVerification(v)}
                              className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm font-medium"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-2xl w-full p-4 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {selectedVerification.status === 'pending' ? 'Review Verification' : 'Verification Details'}
                </h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex justify-end">
                  <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusBadge(selectedVerification.status)}`}>
                    {selectedVerification.status}
                  </span>
                </div>

                {/* Verification Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Verification Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">University</p>
                      <p className="text-sm sm:text-base font-medium">{selectedVerification.university_name}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Student ID</p>
                      <p className="text-sm sm:text-base font-medium">{selectedVerification.student_id}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Year of Study</p>
                      <p className="text-sm sm:text-base font-medium">{getStudentYear(selectedVerification)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                      <p className="text-sm sm:text-base font-medium capitalize">{getUserGender(selectedVerification)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Department</p>
                      <p className="text-sm sm:text-base font-medium">{selectedVerification.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
                      <p className="text-sm sm:text-base font-medium">{selectedVerification.full_name || 'Not specified'}</p>
                    </div>
                    {selectedVerification.reviewed_at && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Reviewed On</p>
                        <p className="text-sm sm:text-base font-medium">{new Date(selectedVerification.reviewed_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Photo */}
                {selectedVerification.id_photo_url && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">ID Photo</p>
                    <div className="border rounded p-2 bg-gray-50">
                      <img
                        src={selectedVerification.id_photo_url}
                        alt="Student ID"
                        className="max-w-full h-auto mx-auto cursor-pointer"
                        onClick={() => openImagePreview(selectedVerification.id_photo_url)}
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Click image to enlarge
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 mb-2">
                    {selectedVerification.admin_notes ? 'Admin Notes' : 'Add Admin Notes'}
                  </label>
                  {selectedVerification.status === 'pending' ? (
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="bg-gray-50 p-3 rounded text-sm sm:text-base text-gray-700">
                      {selectedVerification.admin_notes || 'No notes added'}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedVerification.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => handleVerification(selectedVerification.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm sm:text-base"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(selectedVerification.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm sm:text-base"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Image Preview Modal */}
        {imagePreview && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setImagePreview(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={imagePreview}
                alt="Full size ID"
                className="max-w-full max-h-screen object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;