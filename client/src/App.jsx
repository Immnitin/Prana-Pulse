import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAssessmentPage } from './pages/NewAsessmentPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes that anyone can access */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes that require a user to be logged in */}
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

                {/* The root path redirects to the dashboard if logged in */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Navigate to="/dashboard" />
                        </ProtectedRoute>
                    } 
                />
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
