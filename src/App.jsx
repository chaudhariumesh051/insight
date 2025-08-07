// import './App.css'
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import Home from "./pages/Home";
// import SubmitExperience from "./pages/SubmitExperience";
// import Analytics from "./pages/Analytics";
// import BrowseExperiences from './pages/BrowseExperiences';
// import Questions from './components/Questions';
// import InterviewTracker from './pages/InterviewTracker';
// import Navigation from './components/Navigation';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import ProtectedRoute from './components/ProtectedRoute'
// import BottomNav from "./components/BottomNav";
// import ErrorBoundary from "./components/ErrorBoundary";
// import { AuthProvider } from './components/AuthContext';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary'; // Assuming you have this
import BottomNav from './components/BottomNav'; // Your existing component
import Home from './pages/Home'; // Your existing component
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseExperiences from './pages/BrowseExperiences'; // Your existing component
import SubmitExperience from './pages/SubmitExperience';
import InterviewTracker from './pages/InterviewTracker';
import Questions from './components/Questions';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
   
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
       <Navigation />
      <main className={isHomePage ? "" : "container mx-auto px-4 py-8 pb-20"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/browse" element={<BrowseExperiences />} />
          <Route path="/questions" element={<Questions />} />
          
          {/* Protected Routes */}
          <Route path="/submit" element={
            <ProtectedRoute>
              <SubmitExperience />
            </ProtectedRoute>
          } />
          <Route path="/tracker" element={
            <ProtectedRoute>
              <InterviewTracker />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home instead of submit */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;