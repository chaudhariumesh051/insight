// src/pages/BrowseExperiences.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function BrowseExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const [filters, setFilters] = useState({ company: 'all', role: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ companies: [], roles: [] });

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [scrapedRes, submittedRes] = await Promise.all([
        fetch('/enhanced_gfg_data.json'),
        fetch('http://localhost:5000/api/user-experiences')
      ]);

      if (!scrapedRes.ok || !submittedRes.ok) {
        throw new Error('Failed to load experience data.');
      }

      const scrapedData = await scrapedRes.json();
      const submittedData = await submittedRes.json();

      // Normalize user-submitted data to match scraped data structure
      const normalizedSubmitted = submittedData.map((item) => {
        // Extract all questions from different categories
        const allQuestions = [];
        const roundwiseQuestions = {};
        
        // Process technical questions
        if (item.technicalQuestions?.length > 0) {
          const techQuestions = item.technicalQuestions.map(q => q.question || q);
          allQuestions.push(...techQuestions);
          if (techQuestions.length > 0) {
            roundwiseQuestions['Technical Round'] = techQuestions;
          }
        }
        
        // Process behavioral questions
        if (item.behavioralQuestions?.length > 0) {
          const behavioralQuestions = item.behavioralQuestions.map(q => q.question || q);
          allQuestions.push(...behavioralQuestions);
          if (behavioralQuestions.length > 0) {
            roundwiseQuestions['Behavioral Round'] = behavioralQuestions;
          }
        }
        
        // Process system design questions
        if (item.systemDesignQuestions?.length > 0) {
          const systemQuestions = item.systemDesignQuestions.map(q => q.question || q);
          allQuestions.push(...systemQuestions);
          if (systemQuestions.length > 0) {
            roundwiseQuestions['System Design Round'] = systemQuestions;
          }
        }
        
        // Process coding questions
        if (item.codingQuestions?.length > 0) {
          const codingQuestions = item.codingQuestions.map(q => q.question || q);
          allQuestions.push(...codingQuestions);
          if (codingQuestions.length > 0) {
            roundwiseQuestions['Coding Round'] = codingQuestions;
          }
        }
        
        // Create enhanced highlights
        const highlights = [];
        if (item.experience && item.experience.trim()) {
          highlights.push(item.experience);
        }
        if (item.overallExperience && item.overallExperience.trim()) {
          highlights.push(`Overall: ${item.overallExperience}`);
        }
        if (item.tips && item.tips.trim()) {
          highlights.push(`Tip: ${item.tips}`);
        }
        if (item.preparationTime && item.preparationTime.trim()) {
          highlights.push(`Preparation Time: ${item.preparationTime}`);
        }
        if (item.interviewType && item.interviewType.trim()) {
          highlights.push(`Interview Type: ${item.interviewType}`);
        }
        if (item.salary && item.salary.trim()) {
          highlights.push(`Salary: ₹${item.salary}`);
        }
        if (item.location && item.location.trim()) {
          highlights.push(`Location: ${item.location}`);
        }
        if (item.experienceLevel && item.experienceLevel.trim()) {
          highlights.push(`Experience Level: ${item.experienceLevel}`);
        }
        
        // Fallback to default highlight if none exist
        if (highlights.length === 0) {
          highlights.push("Experience submitted successfully");
        }
        
        return {
          title: `${item.company || 'Unknown'} - ${item.role || 'Unknown Role'}`,
          company: item.company || 'Unknown',
          role: item.role || 'Unknown',
          verdict: item.verdict || 'N/A',
          difficulty: item.difficulty || 'N/A',
          feedback_sentiment: item.sentiment_analysis?.sentiment || item.feedback_sentiment || 'neutral',
          highlights: highlights,
          raw_questions: allQuestions,
          roundwise_questions: Object.keys(roundwiseQuestions).length > 0 ? roundwiseQuestions : null,
          totalRounds: item.totalRounds || Object.keys(roundwiseQuestions).length || 1,
          source: "User Submission"
        };
      });

      const allData = [...scrapedData, ...normalizedSubmitted];

      setExperiences(allData);
      setFilteredExperiences(allData);

      const companies = Array.from(new Set(allData.map(exp => exp.company).filter(Boolean)));
      const roles = Array.from(new Set(allData.map(exp => exp.role).filter(Boolean)));
      setFilterOptions({ companies, roles });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    let filtered = experiences;

    if (filters.company !== 'all') {
      filtered = filtered.filter(exp => exp.company && exp.company.toLowerCase() === filters.company.toLowerCase());
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(exp => exp.role && exp.role.toLowerCase().includes(filters.role.toLowerCase()));
    }

    setFilteredExperiences(filtered);
  }, [filters, experiences]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ company: 'all', role: 'all' });
  };

  const toggleExpanded = (idx) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleHighlight = (idx) => {
    setExpandedHighlights(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getSentimentColor = (sentiment) => {
    switch ((sentiment || '').toLowerCase()) {
      case 'positive': return 'text-emerald-600 bg-emerald-50';
      case 'neutral': return 'text-amber-600 bg-amber-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVerdictColor = (verdict) => {
    if (!verdict) return 'text-gray-600 bg-gray-50';
    const v = verdict.toLowerCase();
    return v.includes('reject') ? 'text-red-600 bg-red-50' : 
           v.includes('select') || v.includes('offer') || v.includes('shortlisted') ? 'text-emerald-600 bg-emerald-50' : 
           'text-gray-600 bg-gray-50';
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-gray-600 bg-gray-50';
    const d = difficulty.toLowerCase();
    return d === 'easy' ? 'text-emerald-600 bg-emerald-50' : 
           d === 'medium' ? 'text-amber-600 bg-amber-50' : 
           d === 'hard' ? 'text-red-600 bg-red-50' : 
           'text-gray-600 bg-gray-50';
  };

  const getSentimentIcon = (sentiment) => {
    switch ((sentiment || '').toLowerCase()) {
      case 'positive': return '👍';
      case 'neutral': return '😐';
      case 'negative': return '👎';
      default: return '❓';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(f => f !== 'all').length;

  return (
    <div className="bg-gradient-to-br from-blue-900 to-white  overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Experiences</h1>
              <p className="text-gray-600 mt-1">Real insights from candidates like you</p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {filteredExperiences.length} experiences
                </span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-medium text-gray-900">Refine your search</h4>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Filter */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Company</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="company"
                        checked={filters.company === 'all'}
                        onChange={() => handleFilterChange('company', 'all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">All Companies</span>
                    </label>
                    {filterOptions.companies.map(company => (
                      <label key={company} className="flex items-center">
                        <input
                          type="radio"
                          name="company"
                          checked={filters.company === company}
                          onChange={() => handleFilterChange('company', company)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{company}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Job Role</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        checked={filters.role === 'all'}
                        onChange={() => handleFilterChange('role', 'all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">All Roles</span>
                    </label>
                    {filterOptions.roles.map(role => (
                      <label key={role} className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={filters.role === role}
                          onChange={() => handleFilterChange('role', role)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading experiences...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredExperiences.map((exp, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  {/* Card Header */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{exp.company || 'Unknown Company'}</h3>
                        <p className="text-lg text-blue-600 font-medium mb-3">{exp.role || 'Role not specified'}</p>
                        
                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getVerdictColor(exp.verdict)}`}>
                            {exp.verdict || 'N/A'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(exp.feedback_sentiment)}`}>
                            {getSentimentIcon(exp.feedback_sentiment)}
                            {(exp.feedback_sentiment || 'N/A').charAt(0).toUpperCase() + (exp.feedback_sentiment || 'N/A').slice(1)} Experience
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exp.difficulty)}`}>
                            {exp.difficulty || 'N/A'} Difficulty
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          {exp.source || 'Unknown Source'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-5 space-y-6">
                    {/* Experience Highlights */}
                    {exp.highlights && Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Key Highlights
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <ul className="space-y-2">
                            {(expandedHighlights[idx] ? exp.highlights : exp.highlights.slice(0, 3)).map((highlight, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                          {exp.highlights.length > 3 && (
                            <button
                              onClick={() => toggleHighlight(idx)}
                              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {expandedHighlights[idx] ? 'Show Less' : `Show ${exp.highlights.length - 3} More`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interview Rounds */}
                    {exp.rounds?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Interview Rounds
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.rounds.map((round, i) => (
                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {round}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interview Questions */}
                    {(exp.roundwise_questions || exp.raw_questions?.length > 0) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Interview Questions
                        </h4>
                        <div className="bg-purple-50 rounded-lg p-4">
                          {exp.roundwise_questions ? (
                            <div className="space-y-4">
                              {Object.entries(exp.roundwise_questions).slice(0, expandedCards[idx] ? undefined : 2).map(([round, questions], qIdx) => (
                                <div key={qIdx} className="border-l-3 border-purple-200 pl-4">
                                  <h5 className="font-medium text-purple-900 mb-2">{round}</h5>
                                  <ul className="space-y-2">
                                    {questions.slice(0, expandedCards[idx] ? undefined : 3).map((q, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-purple-400 font-bold mt-0.5">Q:</span>
                                        <span>{q}</span>
                                      </li>
                                    ))}
                                    {!expandedCards[idx] && questions.length > 3 && (
                                      <li className="text-sm text-purple-600 font-medium">
                                        +{questions.length - 3} more questions
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ul className="space-y-2">
                              {(expandedCards[idx] ? exp.raw_questions : exp.raw_questions.slice(0, 4)).map((q, qIdx) => (
                                <li key={qIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-purple-400 font-bold mt-0.5">Q:</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {((exp.roundwise_questions && Object.keys(exp.roundwise_questions).length > 2) || 
                            (exp.raw_questions && exp.raw_questions.length > 4)) && (
                            <button
                              onClick={() => toggleExpanded(idx)}
                              className="mt-4 inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              {expandedCards[idx] ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Show All Questions
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}