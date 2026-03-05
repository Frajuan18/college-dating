// src/pages/admin/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ProtectedRoute from '../../components/ProtectedRoute.jsx';

const AdminDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('all');

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
          telegram_username,
          first_name,
          last_name,
          photo_url
        )
      `)
      .order('submitted_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (!error) setVerifications(data);
    setLoading(false);
  };

  const handleVerification = async (id, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('student_verifications')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/admin/login';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
      approved: 'bg-gray-800 text-white border-gray-800',
      rejected: 'bg-white text-gray-800 border-gray-300'
    };
    return styles[status] || styles.pending;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-light text-gray-900 tracking-wide">DASHBOARD</h1>
                <p className="text-xs text-gray-500 mt-1">student verification panel</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors rounded-none"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
                    filter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-6 w-6 border-2 border-gray-900 border-t-transparent animate-spin rounded-full"></div>
                <p className="text-gray-500 text-sm mt-2">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {v.users?.first_name} {v.users?.last_name}
                          </div>
                          <div className="text-xs text-gray-500">@{v.users?.telegram_username}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{v.university_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{v.student_id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium border ${getStatusBadge(v.status)}`}>
                            {v.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedVerification(v)}
                            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2"
                          >
                            REVIEW
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-gray-900">REVIEW VERIFICATION</h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                      <p className="text-gray-900">{selectedVerification.users?.first_name} {selectedVerification.users?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Telegram</p>
                      <p className="text-gray-900">@{selectedVerification.users?.telegram_username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">University</p>
                      <p className="text-gray-900">{selectedVerification.university_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Student ID</p>
                      <p className="text-gray-900 font-mono">{selectedVerification.student_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Graduation</p>
                      <p className="text-gray-900">{selectedVerification.graduation_year}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Gender</p>
                      <p className="text-gray-900 capitalize">{selectedVerification.gender}</p>
                    </div>
                  </div>
                </div>

                {selectedVerification.id_photo_url && (
                  <div className="border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">ID PHOTO</p>
                    <img
                      src={selectedVerification.id_photo_url}
                      alt="Student ID"
                      className="max-w-full h-auto border border-gray-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                    ADMIN NOTES
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'approved')}
                    className="flex-1 bg-gray-900 text-white text-sm font-medium py-3 hover:bg-gray-800 transition-colors"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'rejected')}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-3 hover:bg-gray-50 transition-colors"
                  >
                    REJECT
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