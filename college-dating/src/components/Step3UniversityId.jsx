// components/Step3UniversityId.jsx
import React from 'react';

const Step3UniversityId = ({ 
  formData, 
  errors, 
  handleChange, 
  handleFileUpload, 
  onSubmit, 
  onBack 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-white text-2xl font-bold mb-2">Verify your student status</h2>
        <p className="text-white/70 text-sm">
          Upload your university ID to verify you're a student
        </p>
      </div>

      <div>
        <label className="block text-white font-medium mb-1 drop-shadow">University Name</label>
        <input
          type="text"
          name="universityName"
          value={formData.universityName}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-200 transition"
          placeholder="e.g., Stanford University"
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
        >
          <option value="" className="bg-rose-900">Select year</option>
          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
            <option key={year} value={year} className="bg-rose-900">{year}</option>
          ))}
        </select>
        {errors.graduationYear && <p className="mt-1 text-sm text-pink-200">{errors.graduationYear}</p>}
      </div>

      <div>
        <label className="block text-white font-medium mb-1 drop-shadow">University ID Photo</label>
        <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-pink-200 transition cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload('idPhoto', e)}
            className="hidden"
            id="idPhoto"
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
          className="flex-1 text-white/70 hover:text-white text-sm py-3 rounded-lg border border-white/30 hover:border-white/50 transition"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl"
        >
          Complete Registration
        </button>
      </div>
    </form>
  );
};

export default Step3UniversityId;