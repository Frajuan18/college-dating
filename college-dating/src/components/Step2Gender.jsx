// components/Step2Gender.jsx
import React from 'react';

const Step2Gender = ({ formData, errors, handleChange, onNext, onBack }) => {
  const genderOptions = [
    { value: 'male', label: 'Male', icon: '♂️' },
    { value: 'female', label: 'Female', icon: '♀️' },
  ];

  

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-white text-2xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-white/70">
          This helps us find better matches for you
        </p>
      </div>

      <div>
        <label className="block text-white font-medium mb-3 drop-shadow text-lg">
          I am
        </label>
        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange({ target: { name: 'gender', value: option.value } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.gender === option.value
                  ? 'border-pink-200 bg-pink-200/20 text-white'
                  : 'border-white/30 bg-white/5 text-white/70 hover:border-white/50'
              }`}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors.gender && <p className="mt-2 text-sm text-pink-200">{errors.gender}</p>}
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
          onClick={onNext}
          className="flex-1 bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step2Gender;