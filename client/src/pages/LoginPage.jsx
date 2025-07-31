import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase-config';
import { MessageBox } from '../components/MessageBox';
import { Spinner } from '../components/Spinner';
import { PageLayout } from '../components/PageLayout';

// --- SVG ICONS ---
const HeartPulseIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const ActivityIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>);
const ShieldCheckIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const TrendingUpIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);
const UserIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const LockIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const EyeIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>);
const BrainIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);
const ZapIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const SmartphoneIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>);
const TargetIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);

// Slideshow data
const slideshowData = [
  {
    id: 1,
    icon: <BrainIcon className="h-8 w-8" />,
    title: "AI-Powered Health Intelligence",
    subtitle: "Smart Risk Assessment",
    description: "Advanced machine learning algorithms analyze your health data to predict cardiovascular risks with 94% accuracy, providing insights that go beyond traditional health apps.",
    gradient: "from-purple-600 via-pink-600 to-red-500",
    iconColor: "text-purple-300"
  },
  {
    id: 2,
    icon: <ZapIcon className="h-8 w-8" />,
    title: "Real-Time Health Monitoring",
    subtitle: "Instant Insights",
    description: "Connect wearables and get instant feedback on your vital signs. Our AI continuously learns your patterns to provide personalized health recommendations.",
    gradient: "from-blue-600 via-cyan-600 to-teal-500",
    iconColor: "text-cyan-300"
  },
  {
    id: 3,
    icon: <EyeIcon className="h-8 w-8" />,
    title: "Predictive Health Analytics",
    subtitle: "See Your Future Health",
    description: "Visualize your health trajectory with interactive charts and predictions. Make informed decisions today that will benefit your health for years to come.",
    gradient: "from-green-600 via-emerald-600 to-teal-500",
    iconColor: "text-emerald-300"
  },
  {
    id: 4,
    icon: <TargetIcon className="h-8 w-8" />,
    title: "Personalized Action Plans",
    subtitle: "Your Health Roadmap",
    description: "Get customized exercise routines, nutrition plans, and lifestyle modifications designed specifically for your health profile and goals.",
    gradient: "from-orange-600 via-amber-600 to-yellow-500",
    iconColor: "text-amber-300"
  },
];

/**
 * Enhanced Slide Component with better animations
 */
const SlideComponent = ({ slide, isActive }) => (
  <AnimatePresence mode="wait">
    {isActive && (
      <motion.div
        key={slide.id}
        className="h-full flex flex-col justify-center"
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Floating Icon */}
        <motion.div
          className={`w-20 h-20 bg-gradient-to-br ${slide.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${slide.iconColor}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
        >
          {slide.icon}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-sm font-medium text-blue-300 mb-2 tracking-wide uppercase">
            {slide.subtitle}
          </h3>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h2>
          <p className="text-lg text-blue-200/90 leading-relaxed">
            {slide.description}
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * Progress Indicator Component
 */
const ProgressIndicator = ({ slides, currentSlide, onSlideChange }) => (
  <div className="flex space-x-3 justify-center mt-8">
    {slides.map((_, index) => (
      <motion.button
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${
          index === currentSlide
            ? 'bg-white w-8'
            : 'bg-white/30 w-2 hover:bg-white/50'
        }`}
        onClick={() => onSlideChange(index)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
    ))}
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
        {/* Left Column: Enhanced Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-400/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          <motion.div
            className="w-full max-w-md space-y-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo and Header */}
            <div className="text-center">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-violet-600 rounded-3xl mb-4 shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HeartPulseIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Prana Pulse
              </h1>
              <p className="text-lg text-gray-600 mt-3 font-medium">
                Your Intelligent Health Companion
              </p>
            </div>

            {error && <MessageBox message={error} type="error" />}

            <motion.form
              onSubmit={handleLogin}
              className="mt-8 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="space-y-5">
                {/* Enhanced Email Input */}
                <motion.div
                  className="relative group"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label htmlFor="email" className="sr-only">Email Address</label>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <MailIcon className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 group-focus-within:shadow-lg group-focus-within:bg-white"
                  />
                </motion.div>

                {/* Enhanced Password Input */}
                <motion.div
                  className="relative group"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <LockIcon className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 group-focus-within:shadow-lg group-focus-within:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Enhanced Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-700 hover:via-purple-700 hover:to-violet-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? <Spinner /> : 'Access Your Health Dashboard'}
              </motion.button>
            </motion.form>

            <motion.p
              className="mt-8 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              New to Prana Pulse?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Start your health journey
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Right Column: Enhanced Slideshow */}
        <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 w-full max-w-lg">
            {/* Slideshow Container */}
            <div className="relative h-96 mb-8">
              {slideshowData.map((slide, index) => (
                <div key={slide.id} className="absolute inset-0">
                  <SlideComponent
                    slide={slide}
                    isActive={index === currentSlide}
                  />
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator
              slides={slideshowData}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
            />

            {/* Additional Info */}
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}