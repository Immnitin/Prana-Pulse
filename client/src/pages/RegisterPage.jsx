// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { setDoc, doc } from 'firebase/firestore';
// import { auth, db } from '../firebase-config';
// import { MessageBox } from '../components/MessageBox';
// import { Spinner } from '../components/Spinner';
// import { PageLayout } from '../components/PageLayout';

// // --- ICONS ---
// const HeartPulse = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
// const UserIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
// const MailIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
// const LockIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
// const PhoneIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
// const MapPinIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
// const CalendarIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
// const CheckIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>);
// const ShieldIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
// const ActivityIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>);

// export function RegisterPage() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: '', password: '', name: '', age: '', sex: 'male', phonenumber: '', location: '' });
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetchingLocation, setIsFetchingLocation] = useState(false);
//   const [focusedField, setFocusedField] = useState('');
//   const [step, setStep] = useState(1);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleGetLocation = () => {
//     if (!navigator.geolocation) {
//       setError("Geolocation is not supported by your browser.");
//       return;
//     }
//     setIsFetchingLocation(true);
//     setError(null);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
//           const data = await response.json();
//           const address = data.address;
//           const locationString = `${address.city || address.town || address.village || ''}, ${address.country || ''}`;
//           setFormData(prev => ({ ...prev, location: locationString }));
//         } catch (err) {
//           setError("Could not fetch location details. Please enter manually.");
//         } finally {
//           setIsFetchingLocation(false);
//         }
//       },
//       () => {
//         setError("Unable to retrieve your location. Please grant permission or enter manually.");
//         setIsFetchingLocation(false);
//       }
//     );
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (step === 1) {
//         nextStep();
//         return;
//     }
//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters long.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
//       const user = userCredential.user;
//       const userProfile = { name: formData.name, age: formData.age, sex: formData.sex, phonenumber: formData.phonenumber, location: formData.location, email: user.email };
//       await setDoc(doc(db, "users", user.uid), userProfile);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.message.replace('Firebase: ', ''));
//       setIsLoading(false);
//     }
//   };

//   const nextStep = () => { if (step < 2) setStep(step + 1); };
//   const prevStep = () => { if (step > 1) setStep(step - 1); };

//   const renderStep1 = () => (
//     <div className="space-y-6">
//       <div className="text-center mb-8">
//         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <UserIcon className="h-8 w-8 text-blue-600" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
//         <p className="text-gray-600 text-sm">Tell us a bit about yourself</p>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//             <UserIcon className="h-4 w-4 text-blue-600" />
//             Full Name
//           </label>
//           <div className="relative">
//             <input 
//               id="name" 
//               name="name" 
//               type="text" 
//               value={formData.name} 
//               onChange={handleInputChange} 
//               onFocus={() => setFocusedField('name')} 
//               onBlur={() => setFocusedField('')} 
//               className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//                 focusedField === 'name' 
//                   ? 'border-blue-500 ring-4 ring-blue-100' 
//                   : 'border-gray-200 hover:border-blue-300'
//               }`} 
//               placeholder="Enter your full name" 
//               required 
//             />
//           </div>
//         </div>
        
//         <div className="space-y-2">
//           <label htmlFor="age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//             <CalendarIcon className="h-4 w-4 text-blue-600" />
//             Age
//           </label>
//           <div className="relative">
//             <input 
//               id="age" 
//               name="age" 
//               type="number" 
//               value={formData.age} 
//               onChange={handleInputChange} 
//               onFocus={() => setFocusedField('age')} 
//               onBlur={() => setFocusedField('')} 
//               className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//                 focusedField === 'age' 
//                   ? 'border-blue-500 ring-4 ring-blue-100' 
//                   : 'border-gray-200 hover:border-blue-300'
//               }`} 
//               placeholder="Your age" 
//               required 
//             />
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="sex" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <UserIcon className="h-4 w-4 text-blue-600" />
//           Gender
//         </label>
//         <select 
//           id="sex" 
//           name="sex" 
//           value={formData.sex} 
//           onChange={handleInputChange} 
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
//         >
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="phonenumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <PhoneIcon className="h-4 w-4 text-blue-600" />
//           Phone Number
//         </label>
//         <div className="relative">
//           <input 
//             id="phonenumber" 
//             name="phonenumber" 
//             type="tel" 
//             value={formData.phonenumber} 
//             onChange={handleInputChange} 
//             onFocus={() => setFocusedField('phonenumber')} 
//             onBlur={() => setFocusedField('')} 
//             className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//               focusedField === 'phonenumber' 
//                 ? 'border-blue-500 ring-4 ring-blue-100' 
//                 : 'border-gray-200 hover:border-blue-300'
//             }`} 
//             placeholder="+1 (555) 123-4567" 
//             required 
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <MapPinIcon className="h-4 w-4 text-blue-600" />
//           Location
//         </label>
//         <div className="flex gap-3">
//           <div className="relative flex-1">
//             <input 
//               id="location" 
//               name="location" 
//               type="text" 
//               value={formData.location} 
//               onChange={handleInputChange} 
//               onFocus={() => setFocusedField('location')} 
//               onBlur={() => setFocusedField('')} 
//               className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//                 focusedField === 'location' 
//                   ? 'border-blue-500 ring-4 ring-blue-100' 
//                   : 'border-gray-200 hover:border-blue-300'
//               }`} 
//               placeholder="City, Country" 
//               required 
//             />
//           </div>
//           <button 
//             type="button" 
//             onClick={handleGetLocation} 
//             disabled={isFetchingLocation} 
//             className="px-4 py-3 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 border-2 border-blue-200 transition-all duration-200"
//           >
//             {isFetchingLocation ? 'Getting...' : 'Auto-detect'}
//           </button>
//         </div>
//       </div>

//       <button 
//         type="button" 
//         onClick={nextStep} 
//         className="w-full flex justify-center items-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
//       >
//         Continue to Account Setup
//         <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
//         </svg>
//       </button>
//     </div>
//   );

//   const renderStep2 = () => (
//     <div className="space-y-6">
//       <div className="text-center mb-8">
//         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <ShieldIcon className="h-8 w-8 text-blue-600" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Security</h3>
//         <p className="text-gray-600 text-sm">Create your secure account credentials</p>
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <MailIcon className="h-4 w-4 text-blue-600" />
//           Email Address
//         </label>
//         <div className="relative">
//           <input 
//             id="email" 
//             name="email" 
//             type="email" 
//             value={formData.email} 
//             onChange={handleInputChange} 
//             onFocus={() => setFocusedField('email')} 
//             onBlur={() => setFocusedField('')} 
//             className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//               focusedField === 'email' 
//                 ? 'border-blue-500 ring-4 ring-blue-100' 
//                 : 'border-gray-200 hover:border-blue-300'
//             }`} 
//             placeholder="Enter your email address" 
//             required 
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <LockIcon className="h-4 w-4 text-blue-600" />
//           Password
//         </label>
//         <div className="relative">
//           <input 
//             id="password" 
//             name="password" 
//             type="password" 
//             value={formData.password} 
//             onChange={handleInputChange} 
//             onFocus={() => setFocusedField('password')} 
//             onBlur={() => setFocusedField('')} 
//             className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white focus:outline-none ${
//               focusedField === 'password' 
//                 ? 'border-blue-500 ring-4 ring-blue-100' 
//                 : 'border-gray-200 hover:border-blue-300'
//             }`} 
//             placeholder="Create a strong password" 
//             required 
//           />
//         </div>
//         <div className="flex items-center gap-2 mt-2">
//           <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//           <p className="text-xs text-gray-600">Must be at least 6 characters long</p>
//         </div>
//       </div>

//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <input 
//             id="terms" 
//             type="checkbox" 
//             className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-2" 
//             required 
//           />
//           <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
//             I agree to the{' '}
//             <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
//               Terms of Service
//             </Link>{' '}
//             and{' '}
//             <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
//               Privacy Policy
//             </Link>
//           </label>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <button 
//           type="button" 
//           onClick={prevStep} 
//           className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
//         >
//           <svg className="inline mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
//           </svg>
//           Back
//         </button>
//         <button 
//           type="submit" 
//           disabled={isLoading} 
//           className="flex-1 flex justify-center items-center px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
//         >
//           {isLoading ? <Spinner className="mr-2" /> : <CheckIcon className="mr-2 h-5 w-5" />}
//           {isLoading ? 'Creating Account...' : 'Create Account'}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <PageLayout>
//       <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50">
//         <div className="grid lg:grid-cols-2 min-h-screen">
//           {/* Left Side - Hero Section */}
//           <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
//             {/* Background Pattern */}
//             <div className="absolute inset-0 opacity-10">
//               <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
//               <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
//               <div className="absolute bottom-32 left-20 w-12 h-12 border-2 border-white rounded-full"></div>
//               <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
//             </div>
            
//             <div className="relative z-10 text-center max-w-lg">
//               <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
//                 <HeartPulse className="h-12 w-12 text-white" />
//               </div>
              
//               <h1 className="text-4xl font-bold mb-6 leading-tight">
//                 Your Health Journey
//                 <span className="block text-blue-200">Starts Here</span>
//               </h1>
              
//               <div className="space-y-4 mb-8">
//                 <div className="flex items-center gap-3 text-blue-100">
//                   <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
//                   <p>AI-powered health assessments</p>
//                 </div>
//                 <div className="flex items-center gap-3 text-blue-100">
//                   <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
//                   <p>Personalized recommendations</p>
//                 </div>
//                 <div className="flex items-center gap-3 text-blue-100">
//                   <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
//                   <p>Track your wellness progress</p>
//                 </div>
//               </div>
              
//               <blockquote className="text-lg text-blue-100 italic border-l-4 border-blue-300 pl-4">
//                 "The greatest wealth is health."
//                 <footer className="text-sm text-blue-200 mt-2">— Virgil</footer>
//               </blockquote>
//             </div>
//           </div>

//           {/* Right Side - Registration Form */}
//           <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
//             <div className="w-full max-w-md">
//               {/* Header */}
//               <div className="text-center mb-8">
//                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:hidden">
//                   <ActivityIcon className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
//                 <p className="text-gray-600">Join Prana Pulse to start your health journey</p>
//               </div>
              
//               {/* Progress Indicator */}
//               <div className="mb-8">
//                 <div className="flex items-center">
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
//                     step >= 1 
//                       ? 'bg-blue-500 text-white shadow-lg' 
//                       : 'bg-gray-200 text-gray-500'
//                   }`}>
//                     {step > 1 ? <CheckIcon className="h-5 w-5" /> : '1'}
//                   </div>
//                   <div className={`flex-1 h-2 transition-all duration-500 mx-4 rounded-full ${
//                     step >= 2 ? 'bg-blue-500' : 'bg-gray-200'
//                   }`}></div>
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
//                     step >= 2 
//                       ? 'bg-blue-500 text-white shadow-lg' 
//                       : 'bg-gray-200 text-gray-500'
//                   }`}>
//                     2
//                   </div>
//                 </div>
//                 <div className="flex justify-between mt-3 text-sm">
//                   <span className={`font-medium transition-colors duration-300 ${
//                     step === 1 ? 'text-blue-600' : step > 1 ? 'text-green-600' : 'text-gray-500'
//                   }`}>
//                     Personal Info
//                   </span>
//                   <span className={`font-medium transition-colors duration-300 ${
//                     step === 2 ? 'text-blue-600' : 'text-gray-500'
//                   }`}>
//                     Account Setup
//                   </span>
//                 </div>
//               </div>

//               {/* Error Message */}
//               {error && (
//                 <div className="mb-6">
//                   <MessageBox message={error} type="error" />
//                 </div>
//               )}
              
//               {/* Form */}
//               <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
//                 <form onSubmit={handleRegister}>
//                   {step === 1 ? renderStep1() : renderStep2()}
//                 </form>
//               </div>

//               {/* Footer */}
//               <div className="mt-8 text-center">
//                 <p className="text-sm text-gray-600">
//                   Already have an account?{' '}
//                   <Link 
//                     to="/login" 
//                     className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
//                   >
//                     Sign in here
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </PageLayout>
//   );
// }
  
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
const CheckIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>);
const ShieldIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const BrainIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);
const TrendingUpIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>);

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

    const validateStep1 = () => {
        if (!formData.name.trim()) { setError("Full name is required."); return false; }
        if (!formData.age) { setError("Age is required."); return false; }
        if (formData.age < 18 || formData.age > 120) { setError("Please enter a valid age."); return false; }
        if (!formData.phonenumber.trim()) { setError("Phone number is required."); return false; }
        if (!formData.location.trim()) { setError("Location is required."); return false; }
        setError(null);
        return true;
    };

    const validateStep2 = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) { setError("Please enter a valid email address."); return false; }
        if (formData.password.length < 6) { setError("Password must be at least 6 characters long."); return false; }
        if (!document.getElementById('terms').checked) { setError("You must agree to the terms and privacy policy."); return false; }
        setError(null);
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (step === 1) {
            handleNextStep();
            return;
        }
        if (!validateStep2()) return;

        setIsLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            const userProfile = { 
                name: formData.name, 
                age: formData.age, 
                sex: formData.sex, 
                phonenumber: formData.phonenumber, 
                location: formData.location, 
                email: user.email 
            };
            await setDoc(doc(db, "users", user.uid), userProfile);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email address is already in use. Please try another.");
            } else {
                setError(err.message.replace('Firebase: ', ''));
            }
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-3">
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" required />
                </div>
                <div className="space-y-1">
                    <label htmlFor="age" className="text-xs font-semibold text-gray-700">Age</label>
                    <input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Age" required />
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="sex" className="text-xs font-semibold text-gray-700">Gender</label>
                <select id="sex" name="sex" value={formData.sex} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="space-y-1">
                <label htmlFor="phonenumber" className="text-xs font-semibold text-gray-700">Phone Number</label>
                <input id="phonenumber" name="phonenumber" type="tel" value={formData.phonenumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="+1 (555) 123-4567" required />
            </div>

            <div className="space-y-1">
                <label htmlFor="location" className="text-xs font-semibold text-gray-700">Location</label>
                <div className="flex gap-2">
                    <input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="City, Country" required />
                    <button type="button" onClick={handleGetLocation} disabled={isFetchingLocation} className="px-3 py-2 bg-blue-50 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-100 disabled:opacity-50 border border-blue-200">
                        {isFetchingLocation ? '...' : 'Auto'}
                    </button>
                </div>
            </div>

            <button type="submit" className="w-full flex justify-center items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm text-sm">Continue</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-3">
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><ShieldIcon className="h-6 w-6 text-blue-600" /></div>
                <h3 className="text-base font-semibold text-gray-800">Account Security</h3>
            </div>
            
            <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-gray-700">Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" required />
            </div>

            <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Create password" required />
                <div className="flex items-center gap-2 mt-1"><div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div><p className="text-xs text-gray-600">6+ characters</p></div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                <div className="flex items-start gap-2">
                    <input id="terms" type="checkbox" className="mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" required />
                    <label htmlFor="terms" className="text-xs text-gray-700">I agree to the <Link to="#" className="text-blue-600 font-semibold hover:underline">Terms</Link> and <Link to="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link></label>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 border rounded-md text-gray-700 font-semibold hover:bg-gray-50 text-sm">Back</button>
                <button type="submit" disabled={isLoading} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md shadow-sm text-sm">{isLoading ? <Spinner /> : 'Create Account'}</button>
            </div>
        </div>
    );

    return (
        <PageLayout>
            <div className="min-h-screen w-full bg-gray-50">
                <div className="grid lg:grid-cols-2 h-screen">
                    {/* Left Side - Image */}
                    <div className="hidden lg:block bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
                        <div className="flex flex-col items-center justify-center h-full bg-blue-800 bg-opacity-60 text-white p-12 text-center">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                                <HeartPulse className="h-10 w-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-4">Your Health Journey Starts Here</h1>
                            <p className="text-blue-200">Join Prana Pulse for AI-powered health insights and personalized recommendations.</p>
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-white overflow-y-auto">
                        <div className="w-full max-w-sm mx-auto">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h1>
                                <p className="text-gray-600 text-sm">Start your preventive health journey</p>
                            </div>
                            
                            <div className="mb-6">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= 1 ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>{step > 1 ? <CheckIcon className="h-4 w-4" /> : '1'}</div>
                                    <div className={`flex-1 h-1.5 transition-all duration-500 mx-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= 2 ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>2</div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span className={`font-medium transition-colors duration-300 ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Personal Info</span>
                                    <span className={`font-medium transition-colors duration-300 ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Account Setup</span>
                                </div>
                            </div>

                            {error && <div className="mb-4"><MessageBox message={error} type="error" /></div>}
                            
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
                                <form onSubmit={handleRegister}>
                                    {step === 1 ? renderStep1() : renderStep2()}
                                </form>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-600">Already have an account?{' '}<Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">Sign in here</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}