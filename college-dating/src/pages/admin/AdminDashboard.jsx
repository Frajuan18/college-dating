// src/pages/admin/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ProtectedRoute from '../../components/ProtectedRoute';

const AdminDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    setLoading(true);
    
    let query = supabase
      .from('student_verifications')
      .select(`
        *,
        users (
          id,
          telegram_id,
          telegram_username,
          first_name,
          last_name,
          photo_url,
          verification_status,
          created_at
        )
      `)
      .order('submitted_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching verifications:', error);
    } else {
      console.log('Fetched verifications:', data);
      setVerifications(data);
    }
    
    setLoading(false);
  };

  const handleVerification = async (id, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      // Get the verification record
      const { data: verification, error: fetchError } = await supabase
        .from('student_verifications')
        .select('*, users(id)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update verification status
      const { error: updateError } = await supabase
        .from('student_verifications')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update user verification status based on approval/rejection
      const userStatus = status === 'approved' ? 'verified' : 'unverified';
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ verification_status: userStatus })
        .eq('id', verification.user_id);

      if (userUpdateError) throw userUpdateError;

      // Delete photo from storage
      if (verification.id_photo_path) {
        const { error: deleteError } = await supabase.storage
          .from('student-ids')
          .remove([verification.id_photo_path]);

        if (deleteError) {
          console.error('Error deleting photo:', deleteError);
        } else {
          // Update verification to remove photo URLs
          await supabase
            .from('student_verifications')
            .update({ id_photo_url: null, id_photo_path: null })
            .eq('id', id);
        }
      }

      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
      
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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  const getUserStatusBadge = (status) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      unverified: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || styles.unverified;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Verifications</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
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
                <p className="text-gray-500">No verifications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Graduation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {v.users?.first_name} {v.users?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{v.users?.telegram_username}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{v.university_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{v.student_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{v.graduation_year}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{v.gender}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserStatusBadge(v.users?.verification_status)}`}>
                            {v.users?.verification_status || 'unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(v.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedVerification(v)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Review
                          </button>
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
            <div className="bg-white max-w-2xl w-full p-6 rounded-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Review Verification</h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedVerification.users?.first_name} {selectedVerification.users?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telegram</p>
                      <p className="font-medium">@{selectedVerification.users?.telegram_username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserStatusBadge(selectedVerification.users?.verification_status)}`}>
                        {selectedVerification.users?.verification_status || 'unverified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Verification Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">University</p>
                      <p className="font-medium">{selectedVerification.university_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">{selectedVerification.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Graduation Year</p>
                      <p className="font-medium">{selectedVerification.graduation_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{selectedVerification.gender}</p>
                    </div>
                  </div>
                </div>

                {/* ID Photo */}
                {selectedVerification.id_photo_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">ID Photo (will be deleted after review)</p>
                    <img
                      src={selectedVerification.id_photo_url}
                      alt="Student ID"
                      className="max-w-full h-auto border rounded"
                    />
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-4 py-2 border rounded"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Approve & Verify User
                  </button>
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    Reject & Delete Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;