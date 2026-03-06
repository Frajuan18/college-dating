// components/Step3UniversityId.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Step3UniversityId = ({
  formData,
  errors,
  handleChange,
  handleFileUpload,
  onBack,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    setUploadProgress(0);

    try {
      console.log("Form data being submitted:", formData);

      // Get telegram data
      const telegramData = formData.telegramData || {};
      const telegramId = telegramData.id || formData.telegramId;
      
      if (!telegramId) {
        throw new Error("No Telegram ID found. Please restart the process.");
      }

      // Validate required fields
      if (!formData.fullName) {
        throw new Error("Please enter your full name");
      }
      if (!formData.universityName) {
        throw new Error("Please enter your university name");
      }
      if (!formData.department) {
        throw new Error("Please enter your department");
      }
      if (!formData.studentYear) {
        throw new Error("Please select your year of study");
      }
      if (!formData.studentId) {
        throw new Error("Please enter your student ID");
      }
      if (!formData.idPhoto) {
        throw new Error("Please upload your university ID photo");
      }

      // 1. First, check if user exists in users table
      setUploadProgress(10);
      setSubmitMessage("Checking user information...");
      
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) throw userError;

      // If user doesn't exist, create basic user profile
      if (!user) {
        setSubmitMessage("Creating user profile...");
        
        const userData = {
          telegram_id: telegramId,
          telegram_username: telegramData.username || formData.telegramUsername || null,
          first_name: formData.fullName?.split(' ')[0] || 'Unknown',
          last_name: formData.fullName?.split(' ').slice(1).join(' ') || '',
          full_name: formData.fullName,
          photo_url: telegramData.photo_url || null,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log("Creating new user:", userData);

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (createError) {
          console.error("Create error:", createError);
          throw createError;
        }
        user = newUser;
      } else {
        // Update user verification status to pending
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            verification_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      setUploadProgress(30);

      // 2. Upload the image to Supabase Storage
      setSubmitMessage("Uploading ID photo...");
      
      const file = formData.idPhoto;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log("Uploading image:", fileName);

      const { error: uploadError } = await supabase.storage
        .from('student-ids')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image: " + uploadError.message);
      }

      setUploadProgress(70);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-ids')
        .getPublicUrl(fileName);

      console.log("Image uploaded, public URL:", publicUrl);

      // 3. Create verification record in student_verifications table
      setSubmitMessage("Saving verification data...");
      
      const verificationData = {
        user_id: user.id,
        full_name: formData.fullName,
        university_name: formData.universityName,
        department: formData.department,
        student_year: formData.studentYear,
        student_id: formData.studentId,
        id_photo_url: publicUrl,
        id_photo_path: fileName,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      console.log("Creating verification:", verificationData);

      const { data: verification, error: verificationError } = await supabase
        .from('student_verifications')
        .insert([verificationData])
        .select();

      if (verificationError) {
        console.error("Verification error:", verificationError);
        // If verification fails, try to delete the uploaded image
        await supabase.storage
          .from('student-ids')
          .remove([fileName]);
        throw verificationError;
      }

      setUploadProgress(100);

      console.log("Verification created:", verification);

      setSubmitStatus("success");
      setSubmitMessage("Verification submitted successfully! Your ID will be reviewed by admin.");

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);

    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(error.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Custom file handler to ensure file is properly captured
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Maximum size is 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file");
        return;
      }

      // Pass to parent's handler
      handleFileUpload("idPhoto", e);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-white text-2xl font-bold mb-2">
          Verify your student status
        </h2>
        <p className="text-white/70 text-sm">
          Upload your university ID to verify you're a student
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
          <svg
            className="w-12 h-12 text-green-400 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-green-200 font-medium">{submitMessage}</p>
          <p className="text-green-300/70 text-sm mt-2">
            Redirecting to home page...
          </p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200 text-center">{submitMessage}</p>
          <button
            type="button"
            onClick={() => setSubmitStatus(null)}
            className="mt-2 text-red-200 text-sm underline hover:text-white w-full"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex justify-between text-white text-sm mb-1">
            <span>{submitMessage || "Processing..."}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-pink-200 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      {submitStatus !== "success" && (
        <>
          {/* Full Name Field */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              Full Name <span className="text-pink-200">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition"
              placeholder="e.g., John Doe"
              disabled={isSubmitting}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-pink-200">{errors.fullName}</p>
            )}
          </div>

          {/* University Name */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              University Name <span className="text-pink-200">*</span>
            </label>
            <input
              type="text"
              name="universityName"
              value={formData.universityName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition"
              placeholder="e.g., Stanford University"
              disabled={isSubmitting}
              required
            />
            {errors.universityName && (
              <p className="mt-1 text-sm text-pink-200">{errors.universityName}</p>
            )}
          </div>

          {/* Department Field */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              Department / Major <span className="text-pink-200">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition"
              placeholder="e.g., Computer Science"
              disabled={isSubmitting}
              required
            />
            {errors.department && (
              <p className="mt-1 text-sm text-pink-200">{errors.department}</p>
            )}
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              Year of Study <span className="text-pink-200">*</span>
            </label>
            <select
              name="studentYear"
              value={formData.studentYear || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white [color-scheme:dark] focus:outline-none focus:border-pink-200 transition"
              disabled={isSubmitting}
              required
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
            {errors.studentYear && (
              <p className="mt-1 text-sm text-pink-200">{errors.studentYear}</p>
            )}
          </div>

          {/* Student ID Number */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              Student ID Number <span className="text-pink-200">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition"
              placeholder="Enter your student ID"
              disabled={isSubmitting}
              required
            />
            {errors.studentId && (
              <p className="mt-1 text-sm text-pink-200">{errors.studentId}</p>
            )}
          </div>

          {/* University ID Photo */}
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">
              University ID Photo <span className="text-pink-200">*</span>
            </label>
            <div
              className={`border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-pink-200 transition cursor-pointer ${
                isSubmitting ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="idPhoto"
                disabled={isSubmitting}
                required
              />
              <label htmlFor="idPhoto" className="cursor-pointer block">
                {formData.idPhoto ? (
                  <div>
                    <p className="text-pink-200 font-medium">
                      {formData.idPhoto.name}
                    </p>
                    <p className="text-green-200 text-xs mt-1">
                      ✓ File selected
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-12 h-12 mx-auto text-white/50 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/70">
                      Click to upload your university ID
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      JPG or PNG (max 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
            {errors.idPhoto && (
              <p className="mt-1 text-sm text-pink-200">{errors.idPhoto}</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs flex items-center gap-2">
              <svg
                className="w-4 h-4 text-pink-200 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Your ID is encrypted and only used for verification. We never share your personal documents.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 text-white/70 hover:text-white text-sm py-3 rounded-lg border border-white/30 hover:border-white/50 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-rose-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {uploadProgress > 0 ? `${uploadProgress}%` : "Uploading..."}
                </span>
              ) : (
                "Submit for Verification"
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default Step3UniversityId;