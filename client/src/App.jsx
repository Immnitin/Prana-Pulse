import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Component/Page Imports
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
// FIX: Corrected typo in the filename from "NewAsessmentPage" to "NewAssessmentPage"
import { NewAssessmentPage } from './pages/NewAssessmentPage'; 
import { ReportPage } from './pages/ReportPage'; 
import { ProtectedRoute } from './components/ProtectedRoute';

// IMPROVEMENT: A simple component for handling 404 Not Found pages.
const NotFoundPage = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <Link to="/" style={{ color: 'blue' }}>Go to Homepage</Link>
  </div>
);


function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/assessment" 
                    element={
                        <ProtectedRoute>
                            <NewAssessmentPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/report" 
                    element={
                        <ProtectedRoute>
                            <ReportPage />
                        </ProtectedRoute>
                    } 
                />

                {/* Root path redirect */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Navigate to="/dashboard" replace />
                        </ProtectedRoute>
                    } 
                />

                {/* IMPROVEMENT: Catches any route that isn't defined above */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}