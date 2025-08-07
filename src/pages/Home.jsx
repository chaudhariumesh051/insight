// src/pages/Home.jsx

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const [quickTip, setQuickTip] = useState('');
  const [stats, setStats] = useState({ interviews: 0, users: 0, questions: 0 });

  useEffect(() => {
    // Simulated tips and dashboard stats
    const tips = [
      "Be concise but detailed when describing your project.",
      "Mention your approach, not just the solution.",
      "Showcase learning even if you failed a round.",
      "Tailor your resume for the role before applying."
    ];
    setQuickTip(tips[Math.floor(Math.random() * tips.length)]);

    // Simulated stats - replace with API call in production
    setStats({
      interviews: 127,
      users: 42,
      questions: 418
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-300 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Welcome to InsightPrep.ai
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Your personalized companion for interview preparation
            </p>
          </div>

          {/* Quick Tip Section */}
<div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 mb-10 rounded-lg shadow-md flex justify-center">
  <div className="flex items-start space-x-3 max-w-xl">
    
    <div>
      <p className="text-sm font-semibold text-yellow-800 mb-1 text-center">💡Quick Tip:</p>
      <p className="text-gray-700 text-center">{quickTip}</p>
    </div>
  </div>
</div>


          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center shadow-lg hover:bg-white/15 transition-all duration-300">
              <h3 className="text-2xl font-bold text-yellow-300">{stats.interviews}+</h3>
              <p className="text-blue-100 mt-2">Interview Experiences</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center shadow-lg hover:bg-white/15 transition-all duration-300">
              <h3 className="text-2xl font-bold text-yellow-300">{stats.users}+</h3>
              <p className="text-blue-100 mt-2">Active Contributors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center shadow-lg hover:bg-white/15 transition-all duration-300">
              <h3 className="text-2xl font-bold text-yellow-300">{stats.questions}+</h3>
              <p className="text-blue-100 mt-2">Questions Shared</p>
            </div>
          </div>

       



          {/* Quick Actions */}
{/* Reorganized Functionalities Section */}
<div className="mt-12">
 
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 min-h-64 ">
    
    {/* Submit Experience */}
    <Link to="/submit" className="group">
      <div className="bg-white rounded-2xl p-6 shadow-md min-h-64 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Submit Experience</h4>
        <p className="text-sm text-gray-600">Share your story with the community</p>
      </div>
    </Link>

    {/* Browse Questions */}
    <Link to="/questions" className="group">
      <div className="bg-white rounded-2xl p-6 shadow-md min-h-64 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Browse Questions</h4>
        <p className="text-sm text-gray-600">Practice real interview questions</p>
      </div>
    </Link>

    {/* Browse Experiences */}
    <Link to="/browse" className="group">
      <div className="bg-white rounded-2xl p-6 shadow-md min-h-64 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Browse Experiences</h4>
        <p className="text-sm text-gray-600">Learn from real interview stories</p>
      </div>
    </Link>

    {/* Tracker */}
    <Link to="/tracker" className="group">
      <div className="bg-white rounded-2xl p-6 shadow-md min-h-64 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4v11H3zM10 3h4v18h-4zM17 14h4v7h-4z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Interview Tracker</h4>
        <p className="text-sm text-gray-600">Visualize your interview journey</p>
      </div>
    </Link>

  </div>
</div>


        
          <br /><br /><br /><br /><br />

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link to="/submit">
              <button className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group">
                <svg className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}