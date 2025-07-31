import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase-config';
import { MessageBox } from '../components/MessageBox';
import { Spinner } from '../components/Spinner';
import { PageLayout } from '../components/PageLayout';

// --- ICONS ---
const HeartPulseIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const UserIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const PhoneIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const MapPinIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const CalendarIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const CheckIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20,6 9,17 4,12"/></svg>);
const ShieldIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const EyeIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>);
const DatabaseIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>);
const UsersIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const StethoscopeIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>);
const BrainIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);

// Slideshow data
const registrationSlides = [
    { id: 1, icon: <UserIcon className="h-8 w-8" />, title: "Personalized Health Profile", subtitle: "Your Digital Health Twin", description: "Create a comprehensive health profile that learns from your data and lifestyle for tailored insights.", gradient: "from-emerald-600 via-teal-600 to-cyan-500", iconColor: "text-emerald-300" },
    { id: 2, icon: <BrainIcon className="h-8 w-8" />, title: "AI Health Assistant", subtitle: "Smart Health Guidance", description: "Your personal AI assistant provides early warnings, preventive measures, and 24/7 support.", gradient: "from-purple-600 via-violet-600 to-indigo-500", iconColor: "text-purple-300" },
    { id: 3, icon: <DatabaseIcon className="h-8 w-8" />, title: "Unified Health Records", subtitle: "All Your Data, Secured", description: "Securely store and organize your entire medical history in one centralized, accessible platform.", gradient: "from-blue-600 via-indigo-600 to-purple-500", iconColor: "text-blue-300" },
    { id: 4, icon: <StethoscopeIcon className="h-8 w-8" />, title: "Expert Network", subtitle: "Connect with Specialists", description: "Gain exclusive access to a network of verified healthcare professionals for expert consultations.", gradient: "from-rose-600 via-pink-600 to-purple-500", iconColor: "text-rose-300" },
    { id: 5, icon: <UsersIcon className="h-8 w-8" />, title: "Family Health Management", subtitle: "Care for Your Loved Ones", description: "Easily manage and monitor the health profiles and progress for your entire family in one app.", gradient: "from-orange-600 via-amber-600 to-yellow-500", iconColor: "text-orange-300" },
];

const RegistrationSlide = ({ slide, isActive }) => (
    <AnimatePresence mode="wait">
        {isActive && (
            <motion.div key={slide.id} className="h-full flex flex-col justify-center" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}>
                <motion.div className={`w-16 h-16 bg-gradient-to-br ${slide.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl ${slide.iconColor}`} initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}>
                    {slide.icon}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                    <h3 className="text-base font-medium text-blue-300/90 mb-2 tracking-wider uppercase">{slide.subtitle}</h3>
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">{slide.title}</h2>
                    <p className="text-lg text-blue-200/90 leading-relaxed max-w-md">{slide.description}</p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ProgressIndicator = ({ slides, currentSlide, onSlideChange }) => (
    <div className="flex space-x-2 justify-center mt-8">
        {slides.map((_, index) => (
            <motion.button key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-7' : 'bg-white/30 w-2 hover:bg-white/50'}`} onClick={() => onSlideChange(index)} whileHover={{ scale: 1.2 }} />
        ))}
    </div>
);

export function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        age: '',
        sex: 'male',
        phonenumber: '+91 ',
        location: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [step, setStep] = useState(1);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % registrationSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Prevent user from deleting the +91 prefix
        if (name === 'phonenumber' && !value.startsWith('+91 ')) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) { setError("Full name is required."); return false; }
        if (!formData.age) { setError("Age is required."); return false; }
        if (formData.age < 18 || formData.age > 120) { setError("Please enter a valid age (18-120)."); return false; }
        if (formData.phonenumber.trim().length < 13) { setError("Please enter a valid 10-digit phone number."); return false; }
        if (!formData.location.trim()) { setError("Location is required."); return false; }
        setError(null);
        return true;
    };

    const validateStep2 = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) { setError("Please enter a valid email address."); return false; }
        if (formData.password.length < 6) { setError("Password must be at least 6 characters long."); return false; }
        if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return false; }
        if (!document.getElementById('terms').checked) { setError("You must agree to the terms and privacy policy."); return false; }
        setError(null);
        return true;
    };

    const handleNextStep = () => { if (validateStep1()) { setStep(2); } };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        if (step === 1) { handleNextStep(); return; }
        if (!validateStep2()) return;

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                name: formData.name, age: parseInt(formData.age), sex: formData.sex,
                phonenumber: formData.phonenumber, location: formData.location,
                email: user.email, createdAt: new Date().toISOString()
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.code === 'auth/email-already-in-use' ? "This email address is already in use." : err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <motion.div className="space-y-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                <p className="text-gray-600 text-sm">Tell us a bit about yourself.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${focusedField === 'name' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="Your Name" required />
                </div>
                <div>
                    <label htmlFor="age" className="text-sm font-semibold text-gray-700 block mb-1">Age</label>
                    <input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} onFocus={() => setFocusedField('age')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${focusedField === 'age' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="e.g., 25" min="18" max="120" required />
                </div>
            </div>
            <div>
                <label htmlFor="sex" className="text-sm font-semibold text-gray-700 block mb-1">Gender</label>
                <select id="sex" name="sex" value={formData.sex} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="phonenumber" className="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input id="phonenumber" name="phonenumber" type="tel" value={formData.phonenumber} onChange={handleInputChange} onFocus={() => setFocusedField('phonenumber')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${focusedField === 'phonenumber' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="+91 98765 43210" required />
            </div>
            <div>
                <label htmlFor="location" className="text-sm font-semibold text-gray-700 block mb-1">Location</label>
                <input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} onFocus={() => setFocusedField('location')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${focusedField === 'location' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="City, Country" required />
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div className="space-y-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Account Security</h3>
                <p className="text-gray-600 text-sm">Create your secure login.</p>
            </div>
            <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${focusedField === 'email' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="you@example.com" required />
            </div>
            <div>
                <label htmlFor="password" name="password" className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
                <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 pr-10 border-2 rounded-lg text-sm ${focusedField === 'password' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="Create a strong password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
            </div>
             <div>
                <label htmlFor="confirmPassword" name="confirmPassword" className="text-sm font-semibold text-gray-700 block mb-1">Confirm Password</label>
                <div className="relative">
                    <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')} className={`w-full px-3 py-2 pr-10 border-2 rounded-lg text-sm ${focusedField === 'confirmPassword' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'}`} placeholder="Re-enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
          
        </motion.div>
    );

    return (
        <PageLayout>
            <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
                {/* Left Column: Slideshow */}
                <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
                    <div className="absolute inset-0">
                        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>
                    <div className="relative z-10 w-full max-w-lg">
                        <div className="relative h-96 mb-6">
                            {registrationSlides.map((slide, index) => (
                                <div key={slide.id} className="absolute inset-0">
                                    <RegistrationSlide slide={slide} isActive={index === currentSlide} />
                                </div>
                            ))}
                        </div>
                        <ProgressIndicator slides={registrationSlides} currentSlide={currentSlide} onSlideChange={setCurrentSlide} />
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="flex items-center justify-center py-6 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-purple-50/30">
                    <form onSubmit={handleRegister} className="w-full max-w-md">
                         <motion.div className="w-full space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <div className="text-center">
                                <motion.div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-2 shadow-xl" whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <HeartPulseIcon className="h-6 w-6 text-white" />
                                </motion.div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">Join Prana Pulse</h1>
                                <p className="text-base text-gray-600 mt-1 font-medium">Start Your Health Journey</p>
                            </div>
                            
                            {/* Progress Indicator */}
                            <div className="pt-2">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md ${step >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > 1 ? <CheckIcon className="h-4 w-4" /> : '1'}
                                    </div>
                                    <div className={`flex-1 h-1.5 mx-2 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-gray-200'}`} />
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        2
                                    </div>
                                </div>
                            </div>

                            {error && <MessageBox message={error} type="error" />}
                            
                            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-5 shadow-lg">
                                {step === 1 ? renderStep1() : renderStep2()}
                            </div>
                            
                            {/* Form Buttons */}
                            <div className="flex gap-3 pt-1">
                                {step === 2 && (
                                     <motion.button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Back</motion.button>
                                )}
                                <motion.button type="submit" disabled={isLoading} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <Spinner className="mr-2" /> : step === 2 && <CheckIcon className="mr-1.5 h-4 w-4" />}
                                    {isLoading ? 'Processing...' : (step === 1 ? 'Continue' : 'Create Account')}
                                </motion.button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in here</Link>
                            </div>
                        </motion.div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}