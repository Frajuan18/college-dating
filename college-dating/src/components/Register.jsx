// Updated Register.jsx with Telegram handling
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";
import Step1TelegramContact from "./Step1TelegramContact";
import Step2Gender from "./Step2Gender";
import Step3UniversityId from "./Step3UniversityId";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Telegram
    telegramData: null,
    telegramShared: false,

    // Gender
    gender: "",
    interestedIn: "",

    // University ID
    universityName: "",
    studentId: "",
    graduationYear: "",
    idPhoto: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleFileUpload = (type, e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      setFormData({ ...formData, [type]: file });
      if (errors[type]) {
        setErrors({ ...errors, [type]: null });
      }
    } else {
      setErrors({ ...errors, [type]: "File too large. Maximum 5MB." });
    }
  };

  const handleTelegramShare = (telegramUser) => {
    setFormData({
      ...formData,
      telegramData: telegramUser,
      telegramShared: true,
    });

    // Clear any telegram errors
    if (errors.telegram) {
      setErrors({ ...errors, telegram: null });
    }

    // You could also send this to your backend here
    console.log("Telegram user verified:", telegramUser);
  };

  const validateStep1 = () => {
    if (!formData.telegramData) {
      setErrors({ telegram: "Please verify with Telegram to continue" });
      return false;
    }
    return true;
  };

  // In Register.jsx, update the validateStep2 function:

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = "Please select your gender";
    // Removed interestedIn validation

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.universityName)
      newErrors.universityName = "University name is required";
    if (!formData.studentId) newErrors.studentId = "Student ID is required";
    if (!formData.graduationYear)
      newErrors.graduationYear = "Graduation year is required";
    if (!formData.idPhoto)
      newErrors.idPhoto = "Please upload your university ID";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep3()) {
      // Combine all data including Telegram info
      const completeRegistration = {
        ...formData,
        telegramId: formData.telegramData?.id,
        telegramUsername: formData.telegramData?.username,
        verifiedAt: new Date().toISOString(),
      };

      console.log("Registration complete:", completeRegistration);

      // Send to your backend
      // fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(completeRegistration)
      // })

      navigate("/home");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 md:px-8 lg:px-16">
        <Link
          to="/"
          className="text-white text-2xl font-bold tracking-tighter drop-shadow-lg"
        >
          MATCH<span className="text-pink-200">MAKER</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 md:px-8 lg:px-16 py-12">
        <div className="w-full max-w-md">
          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-[1.1] mb-2 drop-shadow-lg">
              {step === 1 && "Verify with Telegram"}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "Verify your student ID"}
            </h1>
            <div className="w-16 h-0.5 bg-pink-200 mx-auto mt-3 rounded-full" />
          </div>

          {/* Progress Steps */}
          <StepProgress step={step} />

          {/* Step Components */}
          {step === 1 && (
            <Step1TelegramContact
              formData={formData}
              errors={errors}
              onTelegramShare={handleTelegramShare}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <Step2Gender
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              onNext={handleNext}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3UniversityId
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleFileUpload={handleFileUpload}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
            />
          )}

          {/* Login Link (only show on step 1) */}
          {step === 1 && (
            <p className="text-center text-white/70 text-sm mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-pink-200 hover:text-white font-semibold transition"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
