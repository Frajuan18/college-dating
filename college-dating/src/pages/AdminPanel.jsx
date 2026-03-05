// components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminPanel = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    checkAdminAccess();
    fetchVerifications();
    fetchStats();
  }, [filter]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      window.location.href = '/';
    }
  };

  const fetchVerifications = async () => {
    setLoading(true);
    let query = supabase
      .from('student_verifications')
      .select(`
        *,
        users (
          telegram_id,
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
    if (error) {
      console.error('Error fetching verifications:', error);
    } else {
      setVerifications(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('student_verifications')
      .select('status');

    if (!error && data) {
      const stats = {
        pending: data.filter(v => v.status === 'pending').length,
        approved: data.filter(v => v.status === 'approved').length,
        rejected: data.filter(v => v.status === 'rejected').length,
        total: data.length
      };
      setStats(stats);
    }
  };

  const handleVerification = async (verificationId, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('student_verifications')
      .update({
        status: status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId);

    if (!error) {
      // Log the action
      await supabase
        .from('verification_logs')
        .insert([{
          verification_id: verificationId,
          admin_id: user.id,
          action: status,
          notes: adminNotes
        }]);

      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
      fetchStats();
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-pink-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <p className="text-white/70 text-sm">Total Submissions</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <p className="text-white/70 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-300">{stats.pending}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <p className="text-white/70 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-300">{stats.approved}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
            <p className="text-white/70 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-300">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === status
                  ? 'bg-white text-rose-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Verifications Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">University</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Graduation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {verifications.map((verification) => (
                    <tr key={verification.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {verification.users?.photo_url && (
                            <img
                              src={verification.users.photo_url}
                              alt=""
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">
                              {verification.users?.first_name} {verification.users?.last_name}
                            </div>
                            <div className="text-xs text-white/50">
                              @{verification.users?.telegram_username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{verification.university_name}</td>
                      <td className="px-6 py-4 text-sm text-white">{verification.student_id}</td>
                      <td className="px-6 py-4 text-sm text-white">{verification.graduation_year}</td>
                      <td className="px-6 py-4 text-sm text-white capitalize">{verification.gender}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(verification.status)}`}>
                          {verification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {new Date(verification.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedVerification(verification)}
                          className="text-pink-200 hover:text-white text-sm font-medium"
                        >
                          View
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

      {/* Verification Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-rose-400 to-pink-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Verification Details</h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/50 text-xs">Name</p>
                      <p className="text-white">
                        {selectedVerification.users?.first_name} {selectedVerification.users?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Telegram</p>
                      <p className="text-white">@{selectedVerification.users?.telegram_username}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Telegram ID</p>
                      <p className="text-white">{selectedVerification.users?.telegram_id}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Data */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Verification Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/50 text-xs">University</p>
                      <p className="text-white">{selectedVerification.university_name}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Student ID</p>
                      <p className="text-white">{selectedVerification.student_id}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Graduation Year</p>
                      <p className="text-white">{selectedVerification.graduation_year}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Gender</p>
                      <p className="text-white capitalize">{selectedVerification.gender}</p>
                    </div>
                  </div>
                </div>

                {/* ID Photo */}
                {selectedVerification.id_photo_url && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">ID Photo</h3>
                    <img
                      src={selectedVerification.id_photo_url}
                      alt="Student ID"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* Admin Notes */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this verification..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'approved')}
                    className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerification(selectedVerification.id, 'rejected')}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;