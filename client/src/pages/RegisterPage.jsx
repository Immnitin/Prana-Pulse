// ===================================================================================
// FILE: src/pages/RegisterPage.jsx (REPLACE THIS FILE)
// This is the correct version of your enhanced registration page.
// ===================================================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { MessageBox } from '../components/MessageBox';
import { Spinner } from '../components/Spinner';
import { PageLayout } from '../components/PageLayout';

// --- ICONS ---
const HeartPulse = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const UserIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const PhoneIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const MapPinIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const CalendarIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);


export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', name: '', age: '', sex: 'male', phonenumber: '', location: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.address;
          const locationString = `${address.city || address.town || address.village || ''}, ${address.country || ''}`;
          setFormData(prev => ({ ...prev, location: locationString }));
        } catch (err) {
          setError("Could not fetch location details. Please enter manually.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please grant permission or enter manually.");
        setIsFetchingLocation(false);
      }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step === 1) {
        nextStep();
        return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const userProfile = { name: formData.name, age: formData.age, sex: formData.sex, phonenumber: formData.phonenumber, location: formData.location, email: user.email };
      await setDoc(doc(db, "users", user.uid), userProfile);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };

  const nextStep = () => { if (step < 2) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const renderStep1 = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label><div className="relative"><UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required /></div></div>
        <div className="space-y-2"><label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label><div className="relative"><CalendarIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'age' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} onFocus={() => setFocusedField('age')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="30" required /></div></div>
      </div>
      <div className="space-y-2"><label htmlFor="sex" className="text-sm font-medium text-gray-700">Sex</label><select id="sex" name="sex" value={formData.sex} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
      <div className="space-y-2"><label htmlFor="phonenumber" className="text-sm font-medium text-gray-700">Phone Number</label><div className="relative"><PhoneIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'phonenumber' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="phonenumber" name="phonenumber" type="tel" value={formData.phonenumber} onChange={handleInputChange} onFocus={() => setFocusedField('phonenumber')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="+1 (555) 123-4567" required /></div></div>
      <div className="space-y-2"><label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label><div className="flex gap-2"><div className="relative flex-1"><MapPinIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'location' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} onFocus={() => setFocusedField('location')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="City, Country" required /></div><button type="button" onClick={handleGetLocation} disabled={isFetchingLocation} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-50">{isFetchingLocation ? '...' : 'Get'}</button></div></div>
      <button type="button" onClick={nextStep} className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">Continue</button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label><div className="relative"><MailIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required /></div></div>
      <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label><div className="relative"><LockIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'}`} /><input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Must be 6+ characters" required /></div><p className="text-xs text-gray-500">Password must be at least 6 characters long</p></div>
      <div className="flex items-center"><input id="terms" type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" required /><label htmlFor="terms" className="ml-2 text-sm text-gray-600">I agree to the <Link to="#" className="text-blue-600 hover:underline font-medium">Terms</Link> and <Link to="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link></label></div>
      <div className="flex gap-4"><button type="button" onClick={prevStep} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">Back</button><button type="submit" disabled={isLoading} className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">{isLoading ? <Spinner /> : 'Create Account'}</button></div>
    </>
  );

  return (
    <PageLayout>
        <div className="min-h-screen w-full bg-gray-50 lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
                <HeartPulse className="h-20 w-20 mb-6" />
                <h1 className="text-4xl font-bold">Your Health Journey Starts Here</h1>
                <p className="mt-4 text-lg text-blue-100 max-w-sm">
                "The greatest wealth is health." - Virgil
                </p>
            </div>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                        <p className="text-gray-600">Join Prana Pulse to start your health journey</p>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-500 ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}>1</div>
                            <div className={`flex-1 h-1 transition-colors duration-500 mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-500 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}>2</div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <span className={`${step === 1 ? 'font-bold text-blue-600' : ''}`}>Personal Info</span>
                            <span className={`${step === 2 ? 'font-bold text-blue-600' : ''}`}>Account Setup</span>
                        </div>
                    </div>

                    {error && <MessageBox message={error} type="error" />}
                    
                    <form onSubmit={handleRegister} className="space-y-4 mt-6">
                        {step === 1 ? renderStep1() : renderStep2()}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </PageLayout>
  );
}