import React, { useState, useEffect } from 'react';

const getUnique = (arr, key) => Array.from(new Set(arr.map(q => q[key]).filter(Boolean)));

// Predefined Java topics
const JAVA_TOPICS = [
  'Core Java',
  'Collections',
  'Multithreading',
  'Exception Handling',
  'OOP Concepts',
  'Memory Management',
  'Generics',
  'Lambda & Streams',
  'Design Patterns',
  'JVM Internals',
  'Concurrency',
  'Serialization',
  'Reflection',
  'Annotations',
  'I/O & NIO',
  'Networking',
  'Database Connectivity',
  'Web Technologies',
  'Testing',
  'Build Tools'
];

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({ 
    difficulty: 'all', 
    role: 'all', 
    company: 'all', 
    topic: 'all',
    javaTopic: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const questionsPerPage = 8;
  const [filterOptions, setFilterOptions] = useState({ 
    difficulties: [], 
    roles: [], 
    companies: [], 
    topics: [] 
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let response = await fetch('/java_questions.json');
        let data;
        if (!response.ok) {
          // fallback sample
          data = [
            {
              question: "Why is Java called the 'Platform Independent Programming Language'?",
              answer: "Because Java source code compiles into platform-neutral bytecode, which can run on any OS with a compatible JVM. 'Write Once, Run Anywhere.'",
              source: "GeeksforGeeks",
              difficulty: "Easy",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Core Java"
            },
            {
              question: "Explain the final keyword in Java.",
              answer: "final on variables makes them constants, on methods prevents overriding, and on classes prevents inheritance.",
              source: "GeeksforGeeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Core Java"
            },
            {
              question: "What is the difference between String and StringBuffer?",
              answer: "String is immutable; StringBuffer is mutable and synchronized, making it efficient for frequent modifications.",
              source: "GeeksforGeeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Core Java"
            },
            {
              question: "What is the difference between throw and throws?",
              answer: "\"throw\" actually raises an exception. \"throws\" declares exceptions a method may pass to its caller.",
              source: "GeeksforGeeks",
              difficulty: "Medium",
              company: "Various",
              role: "Backend Developer",
              javaTopic: "Exception Handling"
            },
            {
              question: "What is finalize() in Java and when is it called?",
              answer: "Called by the garbage collector before object reclamation. It's unpredictable and deprecated in Java 9+.",
              source: "GeeksforGeeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Memory Management"
            },
            {
              question: "Difference between Set and List interfaces.",
              answer: "List allows duplicates and preserves insertion order. Set disallows duplicates and doesn't guarantee order.",
              source: "GeeksforGeeks",
              difficulty: "Easy",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Collections"
            },
            {
              question: "Will finally block execute after System.exit(0)?",
              answer: "No. System.exit terminates the JVM before finally executes. If it throws SecurityException, finally runs.",
              source: "GeeksforGeeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Exception Handling"
            },
            {
              question: "Explain JDK, JRE, and JVM.",
              answer: "JVM runs bytecode. JRE bundles JVM and libraries. JDK includes JRE plus development tools like javac.",
              source: "Codefinity",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Core Java"
            },
            {
              question: "What is polymorphism in Java?",
              answer: "Ability to treat objects of different types through a common interface. Achieved via method overloading (compile‑time) and overriding (run‑time).",
              source: "Java Code Geeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "OOP Concepts"
            },
            {
              question: "Is Java 100% object-oriented? Why or why not?",
              answer: "No—because it has primitive types (int, char, etc.) that aren't objects.",
              source: "Java Code Geeks",
              difficulty: "Easy",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "OOP Concepts"
            },
            {
              question: "Describe applet lifecycle methods.",
              answer: "init(), start(), stop(), destroy(): for setup, execute, pause, and teardown respectively.",
              source: "Java Code Geeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Core Java"
            },
            {
              question: "Explain MVC design pattern in Swing.",
              answer: "Swing uses Model–View–Controller: Model stores state, View renders it, Controller handles user input.",
              source: "Java Code Geeks",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Design Patterns"
            },
            {
              question: "What is RMI and its basic architecture?",
              answer: "Remote Method Invocation lets Java call methods on objects in different JVMs. It uses stubs/skeletons and registry.",
              source: "Java Code Geeks",
              difficulty: "Hard",
              company: "Various",
              role: "Senior Software Engineer",
              javaTopic: "Networking"
            },
            {
              question: "Difference between heap and stack memory.",
              answer: "Stack stores primitives and references per thread. Heap holds objects and arrays, shared and garbage-collected.",
              source: "InterviewBit",
              difficulty: "Medium",
              company: "Oracle",
              role: "SDE",
              javaTopic: "Memory Management"
            },
            {
              question: "Why use interfaces over abstract classes?",
              answer: "Interfaces support multiple inheritance of type and can define contracts without state, with default methods.",
              source: "DataCamp",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "OOP Concepts"
            },
            {
              question: "Explain volatile keyword.",
              answer: "Ensures memory visibility: reads/writes go directly to main memory; prevents caching on threads.",
              source: "DataCamp",
              difficulty: "Medium",
              company: "Various",
              role: "Backend Developer",
              javaTopic: "Multithreading"
            },
            {
              question: "How does HashSet work internally?",
              answer: "Backed by HashMap: elements are keys; uses hashCode and equals to manage buckets.",
              source: "DataCamp",
              difficulty: "Medium",
              company: "Various",
              role: "Software Engineer",
              javaTopic: "Collections"
            },
            {
              question: "Difference between Callable and Runnable.",
              answer: "Runnable returns void and can't throw checked exceptions. Callable returns a value and can throw exceptions.",
              source: "DataCamp",
              difficulty: "Medium",
              company: "Various",
              role: "Backend Developer",
              javaTopic: "Multithreading"
            },
            {
              question: "Implement LRU cache in Java.",
              answer: "Use LinkedHashMap with accessOrder=true and override removeEldestEntry, or use a HashMap + doubly‑linked list.",
              source: "LeetCode",
              difficulty: "Hard",
              company: "Uber",
              role: "SDE",
              javaTopic: "Collections"
            }
          ];
        } else {
          data = await response.json();
        }
        setQuestions(data);
        setFilterOptions({
          difficulties: getUnique(data, 'difficulty'),
          roles: getUnique(data, 'role'),
          companies: getUnique(data, 'company'),
          topics: getUnique(data, 'topic')
        });
      } catch (err) {
        setError('Failed to load questions.');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const allVisible = {};
      questions.forEach((_, index) => {
        allVisible[index] = true; // Set all answers to visible by default
      });
      setVisibleAnswers(allVisible);
    }
  }, [questions]);

  const toggleAnswer = (index) => {
    setVisibleAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'software engineer': return 'bg-blue-100 text-blue-800';
      case 'backend developer': return 'bg-purple-100 text-purple-800';
      case 'sde': return 'bg-indigo-100 text-indigo-800';
      case 'senior software engineer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopicColor = (topic) => {
    const colors = [
      'bg-pink-100 text-pink-800',
      'bg-cyan-100 text-cyan-800',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800',
      'bg-rose-100 text-rose-800',
      'bg-sky-100 text-sky-800',
      'bg-lime-100 text-lime-800',
      'bg-violet-100 text-violet-800'
    ];
    const index = JAVA_TOPICS.indexOf(topic);
    return colors[index % colors.length] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: 'all',
      role: 'all',
      company: 'all',
      topic: 'all',
      javaTopic: 'all'
    });
    setCurrentPage(0);
  };

  const filteredQuestions = questions.filter(q => {
    const { difficulty, role, company, topic, javaTopic } = filters;
    return (
      (difficulty === 'all' || (q.difficulty && q.difficulty.toLowerCase() === difficulty.toLowerCase())) &&
      (role === 'all' || (q.role && q.role.toLowerCase() === role.toLowerCase())) &&
      (company === 'all' || (q.company && q.company.toLowerCase() === company.toLowerCase())) &&
      (topic === 'all' || (q.topic && q.topic.toLowerCase() === topic.toLowerCase())) &&
      (javaTopic === 'all' || (q.javaTopic && q.javaTopic.toLowerCase() === javaTopic.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  const activeFiltersCount = Object.values(filters).filter(f => f !== 'all').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Java Interview Questions</h3>
            <p className="text-sm text-gray-600">Loading questions...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-80">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Java Interview Questions</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Java Interview Questions</h3>
          <p className="text-sm text-gray-600">Practice with real interview questions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {filteredQuestions.length} questions
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Filter Questions</h4>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Difficulty Filter */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Difficulty Level
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('difficulty', 'all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.difficulty === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {filterOptions.difficulties.map(difficulty => (
          <button
            key={difficulty}
                    onClick={() => handleFilterChange('difficulty', difficulty)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.difficulty === difficulty
                        ? `${getDifficultyColor(difficulty).replace('bg-', 'bg-').replace('text-', 'text-')} shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Job Role
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('role', 'all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.role === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Roles
                </button>
                {filterOptions.roles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleFilterChange('role', role)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.role === role
                        ? `${getRoleColor(role).replace('bg-', 'bg-').replace('text-', 'text-')} shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Filter */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Company
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('company', 'all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.company === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Companies
                </button>
                {filterOptions.companies.map(company => (
                  <button
                    key={company}
                    onClick={() => handleFilterChange('company', company)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.company === company
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>

            {/* Java Topic Filter */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Java Topics
              </h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('javaTopic', 'all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.javaTopic === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Topics
                </button>
                {JAVA_TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleFilterChange('javaTopic', topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.javaTopic === topic
                        ? `${getTopicColor(topic).replace('bg-', 'bg-').replace('text-', 'text-')} shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Filter (if available) */}
            {filterOptions.topics.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Custom Topics
                </h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('topic', 'all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.topic === 'all'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Topics
                  </button>
                  {filterOptions.topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => handleFilterChange('topic', topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        filters.topic === topic
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {topic}
          </button>
        ))}
      </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium">{activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{filteredQuestions.length} questions found</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentQuestions.map((question, index) => (
          <div
            key={startIndex + index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-3">
                    {startIndex + index + 1}. {question.question}
                  </h4>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(question.role)}`}>
                      {question.role}
                    </span>
                    {question.company && question.company !== 'Various' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {question.company}
                      </span>
                    )}
                  {question.javaTopic && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTopicColor(question.javaTopic)}`}>
                      {question.javaTopic}
                    </span>
                  )}
                </div>
                
                {/* Answer Section - Always visible */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-2">Answer:</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">{question.answer}</p>
                      {question.source && (
                        <div className="mt-3 text-xs text-gray-500">
                          Source: {question.source}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto flex justify-end">
                  <button
                    onClick={() => toggleAnswer(startIndex + index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      visibleAnswers[startIndex + index]
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {visibleAnswers[startIndex + index] ? 'Hide Answer' : 'Show Answer'}
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h4>
          <p className="text-gray-600">Try adjusting your filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Questions; 