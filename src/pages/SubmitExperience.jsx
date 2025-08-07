import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const SubmitExperience = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    role: "",
    experience: "",
    verdict: "",
    difficulty: "",
    tags: "",
    // Structured format fields
    rounds: [],
    totalRounds: 1,
    interviewType: "",
    preparationTime: "",
    overallExperience: "",
    technicalQuestions: [],
    behavioralQuestions: [],
    systemDesignQuestions: [],
    codingQuestions: [],
    feedback: "",
    tips: "",
    salary: "",
    location: "",
    experienceLevel: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      totalRounds: prev.totalRounds + 1,
      rounds: [...prev.rounds, {
        roundNumber: prev.totalRounds + 1,
        roundName: "",
        duration: "",
        questions: [],
        feedback: "",
        difficulty: ""
      }]
    }));
  };

  const updateRound = (index, field, value) => {
    const updatedRounds = [...formData.rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    setFormData(prev => ({ ...prev, rounds: updatedRounds }));
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      answer: "",
      difficulty: "Medium",
      category: type
    };

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newQuestion]
    }));
  };

  const updateQuestion = (type, index, field, value) => {
    const updatedQuestions = [...formData[type]];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData(prev => ({ ...prev, [type]: updatedQuestions }));
  };

  const removeQuestion = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      alert("You must be logged in to submit an experience.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        email: user.email, // Force override with logged-in user's email
        name: user.name || formData.name,
        timestamp: new Date().toISOString(),
        nlpProcessing: true
      };

      const response = await fetch('/api/submit-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      let result = {};
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Server did not return valid JSON");
      }

      if (!response.ok) {
        throw new Error(result?.message || "Submission failed");
      }

      alert("Thank you! Your experience has been submitted and processed with AI analysis.");
      
      // Reset form
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        company: "",
        role: "",
        experience: "",
        verdict: "",
        difficulty: "",
        tags: "",
        rounds: [],
        totalRounds: 1,
        interviewType: "",
        preparationTime: "",
        overallExperience: "",
        technicalQuestions: [],
        behavioralQuestions: [],
        systemDesignQuestions: [],
        codingQuestions: [],
        feedback: "",
        tips: "",
        salary: "",
        location: "",
        experienceLevel: ""
      });

      // Navigate to tracker to see the updated data
      navigate("/tracker");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Submit Experience</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/tracker")}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Tracker
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Share Your Interview Experience</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Help others learn from your journey. Our AI will analyze your experience and extract key insights for the community.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Type Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => setShowAdvancedForm(false)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  !showAdvancedForm
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Simple Format
              </button>
              <button
                type="button"
                onClick={() => setShowAdvancedForm(true)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  showAdvancedForm
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Detailed Format
              </button>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input 
                  name="name" 
                  placeholder="Enter your name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  name="email" 
                  placeholder="your.email@example.com" 
                  type="email" 
                  value={user?.email || formData.email} 
                  disabled={!!user?.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {user?.email && (
                  <p className="text-xs text-gray-500 mt-1">Email is auto-filled from your account</p>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="company" 
                  placeholder="e.g., Google, Microsoft, Amazon" 
                  required 
                  value={formData.company} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Position <span className="text-red-500">*</span>
                </label>
                <input 
                  name="role" 
                  placeholder="e.g., Software Engineer, Data Scientist" 
                  required 
                  value={formData.role} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {showAdvancedForm ? (
              // Detailed Format
              <>
                {/* Interview Details */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Type
                    </label>
                    <select 
                      name="interviewType" 
                      value={formData.interviewType} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select type</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Phone">Phone</option>
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select 
                      name="experienceLevel" 
                      value={formData.experienceLevel} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select level</option>
                      <option value="Entry Level">Entry Level (0-2 years)</option>
                      <option value="Mid Level">Mid Level (3-5 years)</option>
                      <option value="Senior">Senior (6-8 years)</option>
                      <option value="Lead">Lead (8+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Time
                    </label>
                    <input 
                      name="preparationTime" 
                      placeholder="e.g., 2 weeks, 1 month" 
                      value={formData.preparationTime} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input 
                      name="location" 
                      placeholder="e.g., San Francisco, CA" 
                      value={formData.location} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range (Optional)
                    </label>
                    <input 
                      name="salary" 
                      placeholder="e.g., $120k-150k" 
                      value={formData.salary} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Questions Sections */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Interview Questions</h3>
                  
                  {/* Technical Questions */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Technical Questions</h4>
                      <button
                        type="button"
                        onClick={() => addQuestion('technicalQuestions')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                    {formData.technicalQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion('technicalQuestions', index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          placeholder="Enter the technical question..."
                          value={question.question}
                          onChange={(e) => updateQuestion('technicalQuestions', index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 resize-none"
                          rows={2}
                        />
                        <textarea
                          placeholder="Your answer or approach..."
                          value={question.answer}
                          onChange={(e) => updateQuestion('technicalQuestions', index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Behavioral Questions */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Behavioral Questions</h4>
                      <button
                        type="button"
                        onClick={() => addQuestion('behavioralQuestions')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                    {formData.behavioralQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion('behavioralQuestions', index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          placeholder="Enter the behavioral question..."
                          value={question.question}
                          onChange={(e) => updateQuestion('behavioralQuestions', index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 resize-none"
                          rows={2}
                        />
                        <textarea
                          placeholder="Your response..."
                          value={question.answer}
                          onChange={(e) => updateQuestion('behavioralQuestions', index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>

                  {/* System Design Questions */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">System Design Questions</h4>
                      <button
                        type="button"
                        onClick={() => addQuestion('systemDesignQuestions')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                    {formData.systemDesignQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion('systemDesignQuestions', index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          placeholder="Enter the system design question..."
                          value={question.question}
                          onChange={(e) => updateQuestion('systemDesignQuestions', index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 resize-none"
                          rows={2}
                        />
                        <textarea
                          placeholder="Your approach and solution..."
                          value={question.answer}
                          onChange={(e) => updateQuestion('systemDesignQuestions', index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Coding Questions */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">Coding Questions</h4>
                      <button
                        type="button"
                        onClick={() => addQuestion('codingQuestions')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                    {formData.codingQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion('codingQuestions', index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          placeholder="Enter the coding question..."
                          value={question.question}
                          onChange={(e) => updateQuestion('codingQuestions', index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 resize-none"
                          rows={2}
                        />
                        <textarea
                          placeholder="Your solution or approach..."
                          value={question.answer}
                          onChange={(e) => updateQuestion('codingQuestions', index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Experience and Tips */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Experience
                    </label>
                    <textarea 
                      name="overallExperience" 
                      placeholder="Describe your overall interview experience, what went well, what could be improved..."
                      value={formData.overallExperience} 
                      onChange={handleChange}
                      rows={4} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tips for Others
                    </label>
                    <textarea 
                      name="tips" 
                      placeholder="Share tips and advice for future candidates..."
                      value={formData.tips} 
                      onChange={handleChange}
                      rows={4} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              // Simple Format
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Experience <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="experience" 
                placeholder="Share your complete interview experience including questions asked, your responses, and overall process..." 
                required 
                value={formData.experience} 
                onChange={handleChange}
                rows={8} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            )}

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Outcome
                </label>
                <select 
                  name="verdict" 
                  value={formData.verdict} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select outcome</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Pending">Pending</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select 
                  name="difficulty" 
                  value={formData.difficulty} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Very Hard">Very Hard</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input 
                name="tags" 
                placeholder="e.g., SDE, Internship, Frontend, Backend, System Design" 
                value={formData.tags} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                Add relevant tags to help others find your experience
              </p>
            </div>

            {/* AI Processing Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">AI Processing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your experience will be processed using AI to extract key insights, categorize questions, and provide sentiment analysis for the community.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing with AI...
                  </div>
                ) : (
                  "Submit Experience"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitExperience;