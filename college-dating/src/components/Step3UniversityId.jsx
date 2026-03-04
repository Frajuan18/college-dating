// components/Step3UniversityId.jsx
import React, { useState } from 'react';

const Step3UniversityId = ({ 
  formData, 
  errors, 
  handleChange, 
  handleFileUpload, 
  onSubmit, 
  onBack 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('telegramId', formData.telegramData?.id || '');
      formDataToSend.append('telegramUsername', formData.telegramData?.username || '');
      formDataToSend.append('firstName', formData.telegramData?.first_name || '');
      formDataToSend.append('lastName', formData.telegramData?.last_name || '');
      formDataToSend.append('universityName', formData.universityName);
      formDataToSend.append('studentId', formData.studentId);
      formDataToSend.append('graduationYear', formData.graduationYear);
      formDataToSend.append('gender', formData.gender);
      
      // Append the file if it exists
      if (formData.idPhoto) {
        formDataToSend.append('idPhoto', formData.idPhoto);
      }

      // Send to your API
      const response = await fetch('/api/verify-student', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - browser will set it with boundary
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Verification request sent successfully!');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Failed to submit verification. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-white text-2xl font-bold mb-2">Verify your student status</h2>
        <p className="text-white/70 text-sm">
          Upload your university ID to verify you're a student
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-200 font-medium">{submitMessage}</p>
          <p className="text-green-300/70 text-sm mt-2">
            You'll receive a notification once your account is verified.
          </p>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-white text-rose-600 px-6 py-2 rounded-lg font-semibold hover:bg-rose-50 transition"
          >
            Go to Home
          </button>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200 text-center">{submitMessage}</p>
          <button
            type="button"
            onClick={() => setSubmitStatus(null)}
            className="mt-2 text-red-200 text-sm underline hover:text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Form Fields - Only show if not successfully submitted */}
      {submitStatus !== 'success' && (
        <>
          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">University Name</label>
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
            {errors.universityName && <p className="mt-1 text-sm text-pink-200">{errors.universityName}</p>}
          </div>

          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">Student ID Number</label>
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
            {errors.studentId && <p className="mt-1 text-sm text-pink-200">{errors.studentId}</p>}
          </div>

          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">Graduation Year</label>
            <select
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white [color-scheme:dark] focus:outline-none focus:border-pink-200 transition"
              disabled={isSubmitting}
              required
            >
              <option value="">Select year</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.graduationYear && <p className="mt-1 text-sm text-pink-200">{errors.graduationYear}</p>}
          </div>

          <div>
            <label className="block text-white font-medium mb-1 drop-shadow">University ID Photo</label>
            <div className={`border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-pink-200 transition cursor-pointer ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('idPhoto', e)}
                className="hidden"
                id="idPhoto"
                disabled={isSubmitting}
                required
              />
              <label htmlFor="idPhoto" className="cursor-pointer block">
                {formData.idPhoto ? (
                  <div>
                    <p className="text-pink-200 font-medium">{formData.idPhoto.name}</p>
                    <p className="text-white/50 text-xs mt-1">Click to change</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-white/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/70">Click to upload your university ID</p>
                    <p className="text-white/50 text-xs mt-1">JPG, PNG or PDF (max 5MB)</p>
                  </>
                )}
              </label>
            </div>
            {errors.idPhoto && <p className="mt-1 text-sm text-pink-200">{errors.idPhoto}</p>}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-pink-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
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
                  <svg className="animate-spin h-5 w-5 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default Step3UniversityId;