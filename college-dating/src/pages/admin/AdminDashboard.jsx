// src/pages/admin/dashboard.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";

const AdminDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'approved', 'rejected', 'all'
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    setLoading(true);

    let query = supabase
      .from("student_verifications")
      .select("*")
      .order("submitted_at", { ascending: false });

    // Apply filter based on active tab
    if (activeTab !== "all") {
      query = query.eq("status", activeTab);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching verifications:", error);
    } else {
      console.log(`${activeTab} verifications:`, data);
      setVerifications(data);
    }

    setLoading(false);
  };

  const handleVerification = async (id, status) => {
    try {
      // Get the verification to get user_id
      const { data: verification } = await supabase
        .from("student_verifications")
        .select("user_id, id_photo_path")
        .eq("id", id)
        .single();

      // Update verification status
      await supabase
        .from("student_verifications")
        .update({
          status,
          admin_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Update users table verification_status
      const userStatus = status === "approved" ? "verified" : "rejected";

      await supabase
        .from("users")
        .update({ verification_status: userStatus })
        .eq("id", verification.user_id);

      // Delete photo if exists
      if (verification?.id_photo_path) {
        await supabase.storage
          .from("student-ids")
          .remove([verification.id_photo_path]);
      }

      setSelectedVerification(null);
      setAdminNotes("");
      fetchVerifications();
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.location.href = "/admin/login";
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const openImagePreview = (url) => {
    setImagePreview(url);
  };

  // Get counts for each status
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from("student_verifications")
      .select("status");

    if (!error && data) {
      const pending = data.filter((v) => v.status === "pending").length;
      const approved = data.filter((v) => v.status === "approved").length;
      const rejected = data.filter((v) => v.status === "rejected").length;

      setCounts({
        pending,
        approved,
        rejected,
        all: data.length,
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Verifications
              </h1>
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
          {/* Status Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "approved"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Approved ({counts.approved})
              </button>
              <button
                onClick={() => setActiveTab("rejected")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "rejected"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Rejected ({counts.rejected})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All ({counts.all})
              </button>
            </nav>
          </div>

          {/* Status Header */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 capitalize">
              {activeTab} Verifications
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({verifications.length}{" "}
                {verifications.length === 1 ? "item" : "items"})
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
                <p className="text-gray-500 text-lg">
                  No {activeTab} verifications found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Graduation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {v.id_photo_url ? (
                            <button
                              onClick={() => openImagePreview(v.id_photo_url)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Photo
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No photo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {v.university_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {v.student_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {v.graduation_year}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {v.gender}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(v.status)}`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(v.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {v.status === "pending" ? (
                            <button
                              onClick={() => setSelectedVerification(v)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedVerification(v)}
                              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
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

        {/* Review Modal - Only show action buttons for pending */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-2xl w-full p-6 rounded-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedVerification.status === "pending"
                    ? "Review Verification"
                    : "Verification Details"}
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
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedVerification.status)}`}
                  >
                    {selectedVerification.status}
                  </span>
                </div>

                {/* Verification Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Verification Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">University</p>
                      <p className="font-medium">
                        {selectedVerification.university_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">
                        {selectedVerification.student_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Graduation Year</p>
                      <p className="font-medium">
                        {selectedVerification.graduation_year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">
                        {selectedVerification.gender}
                      </p>
                    </div>
                    {selectedVerification.reviewed_at && (
                      <div>
                        <p className="text-sm text-gray-500">Reviewed On</p>
                        <p className="font-medium">
                          {new Date(
                            selectedVerification.reviewed_at,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Photo */}
                {selectedVerification.id_photo_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">ID Photo</p>
                    <div className="border rounded p-2 bg-gray-50">
                      <img
                        src={selectedVerification.id_photo_url}
                        alt="Student ID"
                        className="max-w-full h-auto mx-auto"
                        onClick={() =>
                          openImagePreview(selectedVerification.id_photo_url)
                        }
                        style={{ cursor: "pointer", maxHeight: "300px" }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Click image to enlarge
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Notes - Show existing notes or input for new ones */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    {selectedVerification.admin_notes
                      ? "Admin Notes"
                      : "Add Admin Notes"}
                  </label>
                  {selectedVerification.status === "pending" ? (
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-4 py-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p className="bg-gray-50 p-3 rounded text-gray-700">
                      {selectedVerification.admin_notes || "No notes added"}
                    </p>
                  )}
                </div>

                {/* Action Buttons - Only show for pending */}
                {selectedVerification.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() =>
                        handleVerification(selectedVerification.id, "approved")
                      }
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleVerification(selectedVerification.id, "rejected")
                      }
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
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
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
