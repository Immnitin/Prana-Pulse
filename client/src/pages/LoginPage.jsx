import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import { MessageBox } from '../components/MessageBox';
import { Spinner } from '../components/Spinner';
import { PageLayout } from '../components/PageLayout';

// --- SVG ICONS ---
const HeartPulseIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const ActivityIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>);
const ShieldCheckIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const TrendingUpIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);

/**
 * A reusable component for the feature cards on the right side of the login page.
 */
const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-blue-200">{description}</p>
    </div>
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
        {/* Left Column: Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl mb-4 shadow-lg">
                <HeartPulseIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Prana Pulse</h1>
              <p className="text-lg text-gray-600 mt-2">Welcome Back!</p>
              <p className="text-sm text-gray-500 mt-4 max-w-xs mx-auto">
                Access your AI-powered health insights and personalized disease risk predictions.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">AI Predictions</span>
                <span className="text-xs font-medium text-violet-600 bg-violet-100 px-3 py-1 rounded-full">Prevention Tips</span>
              </div>
            </div>

            {error && <MessageBox message={error} type="error" />}

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                  <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                  <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]">
                  {isLoading ? <Spinner /> : 'Access Dashboard'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                Start Your Health Journey
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Feature Showcase */}
        <div className="hidden lg:flex items-center justify-center p-12 flex-col bg-gradient-to-br from-blue-700 via-indigo-800 to-violet-900">
            <div className="w-full max-w-sm space-y-6">
                <FeatureCard 
                    icon={<ActivityIcon className="h-6 w-6 text-green-300" />}
                    title="Instant Risk Scoring"
                    description="AI analyzes your health data in real-time."
                />
                <FeatureCard 
                    icon={<ShieldCheckIcon className="h-6 w-6 text-blue-300" />}
                    title="Prevention Strategies"
                    description="Evidence-based recommendations tailored for you."
                />
                <FeatureCard 
                    icon={<TrendingUpIcon className="h-6 w-6 text-orange-300" />}
                    title="Progress Tracking"
                    description="Monitor your health journey over time."
                />
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
