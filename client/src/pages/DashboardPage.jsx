import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config'; // Make sure this path is correct


// --- ENHANCED ICONS ---
const LogOutIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const SettingsIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const HeartPulse = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const ShieldCheckIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const ActivityIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
const FileTextIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>);
const UsersIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const ArrowUpIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>);
const ArrowDownIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>);
const CheckCircleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const ClockIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const AlertTriangleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>);
const TrendingUpIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);
const BrainIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);
const CalendarIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>);
const HeartIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>);
const DropletIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>);

export function DashboardPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isClinicianView, setIsClinicianView] = useState(false);

  useEffect(() => {
    // `onAuthStateChanged` is the recommended way to get the current user.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in. `user.uid` is the unique ID.
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // If the document exists, set the user profile state.
          setUserProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } else {
        // User is signed out.
        navigate('/login');
      }
    });
    // Cleanup the listener when the component unmounts.
    return () => unsubscribe();
  }, [navigate]); // Dependency array

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const getGreeting = () => { 
    const h = new Date().getHours(); 
    if (h < 12) return "Good Morning"; 
    if (h < 18) return "Good Afternoon"; 
    return "Good Evening"; 
  };

  // Enhanced Card component with glass effect
  const Card = ({ children, className = '', gradient = false, glow = false }) => (
    <div className={`
      bg-white/90 backdrop-blur-lg rounded-3xl border border-white/30 
      shadow-2xl hover:shadow-3xl transition-all duration-500 
      ${gradient ? 'bg-gradient-to-br from-white/95 to-white/80' : ''}
      ${glow ? 'shadow-blue-500/20 hover:shadow-blue-500/30' : ''}
      ${className}
    `}>
      {children}
    </div>
  );

  // Risk Score Circle Component
  const RiskScoreCircle = ({ score, label, color }) => (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
        <circle 
          cx="60" cy="60" r="45" fill="none" 
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${score * 2.83} 283`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-gray-500 font-medium text-center">{label}</span>
      </div>
    </div>
  );

  // Disease Prediction Card
  const DiseasePredictionCard = ({ disease, probability, timeframe, severity }) => {
    const severityColors = {
      low: 'bg-green-50 text-green-800 border-green-200',
      medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      high: 'bg-red-50 text-red-800 border-red-200'
    };

    return (
      <div className="p-5 bg-gradient-to-r from-white/80 to-gray-50/80 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 text-sm">{disease}</h4>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[severity]}`}>
            {severity.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{timeframe}</span>
          <span className="text-lg font-bold text-blue-600">{probability}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>
    );
  };

  // Past Record Summary Card
  const PastRecordCard = ({ title, icon, color, records, summary }) => (
    <Card className="h-full" glow>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Historical Analysis</p>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">Summary Report</h4>
          <p className="text-sm text-blue-800">{summary}</p>
        </div>

        <div className="space-y-3">
          {records.map((record, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">{record.date}</p>
                <p className="text-xs text-gray-500">{record.type}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${record.status === 'Normal' ? 'text-green-600' : record.status === 'Elevated' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {record.value}
                </p>
                <p className="text-xs text-gray-500">{record.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const UserView = () => (
    <div className="space-y-8">
      {/* Past Records Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PastRecordCard
          title="Heart Disease Records"
          icon={<HeartIcon className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-red-500 to-pink-500"
          summary="Your cardiovascular health shows stable patterns with occasional elevated readings. Recent ECG indicates normal sinus rhythm. Blood pressure trending towards optimal range with current medication."
          records={[
            { date: "Jan 15, 2025", type: "ECG", value: "Normal", status: "Normal" },
            { date: "Dec 10, 2024", type: "Blood Pressure", value: "138/89", status: "Elevated" },
          ]}
        />

        <PastRecordCard
          title="Diabetes Records"
          icon={<DropletIcon className="h-6 w-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          summary="Blood glucose levels show good control with HbA1c within target range. Recent insulin adjustments have improved post-meal glucose spikes. Continue current dietary management and monitoring."
          records={[
            { date: "Jan 20, 2025", type: "HbA1c", value: "6.8%", status: "Normal" },
            { date: "Jan 05, 2025", type: "Fasting Glucose", value: "118 mg/dL", status: "Elevated" },
          ]}
        />
      </div>

  {/* Health Score Overview */}
<Card className="col-span-full" gradient glow>
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Health Score Overview
        </h3>
        <p className="text-gray-500 mt-2 text-lg">AI-powered comprehensive risk assessment</p>
      </div>
      <BrainIcon className="h-10 w-10 text-blue-500" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
        <RiskScoreCircle score={78} label="Health" color="#10b981" />
        <p className="text-sm font-medium text-green-700 mt-3">Good</p>
        <p className="text-xs text-gray-500 mt-1">Above average</p>
      </div>
      <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
        <RiskScoreCircle score={65} label="Cardiac" color="#f59e0b" />
        <p className="text-sm font-medium text-yellow-700 mt-3">Monitor</p>
        <p className="text-xs text-gray-500 mt-1">Needs work</p>
      </div>
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
        <RiskScoreCircle score={85} label="Metabolic" color="#06b6d4" />
        <p className="text-sm font-medium text-blue-700 mt-3">Excellent</p>
        <p className="text-xs text-gray-500 mt-1">Keep it up</p>
      </div>
    </div>
  </div>
</Card>

      {/* Early Disease Prediction */}
      <Card glow>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <AlertTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Early Disease Prediction</h3>
              <p className="text-gray-500">AI-powered 5-10 year risk forecasting</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DiseasePredictionCard 
              disease="Type 2 Diabetes" 
              probability={23} 
              timeframe="5-7 years" 
              severity="medium"
            />
            <DiseasePredictionCard 
              disease="Hypertension" 
              probability={35} 
              timeframe="3-5 years" 
              severity="medium"
            />
            <DiseasePredictionCard 
              disease="Cardiovascular Disease" 
              probability={18} 
              timeframe="8-10 years" 
              severity="low"
            />
          </div>
        </div>
      </Card>

      {/* Enhanced CTA Section */}
      <Card className="overflow-hidden" gradient glow>
        <div className="p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-3xl font-bold mb-3">Ready for Your Next Assessment?</h3>
              <p className="text-blue-100 text-lg mb-4">
                Get updated risk predictions and personalized health insights in just 5 minutes.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  AI-Powered Analysis
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  Early Disease Detection
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  Personalized Recommendations
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/assessment" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform duration-300"
              >
                <ActivityIcon className="h-6 w-6" />
                Start Assessment
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const ClinicianView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-3" gradient>
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Patient Cohort Risk Stratification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg">
              <p className="text-red-100 font-medium mb-2">Critical Risk</p>
              <p className="text-4xl font-bold mb-1">8</p>
              <p className="text-red-100 text-sm">Immediate attention needed</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
              <p className="text-orange-100 font-medium mb-2">High Risk</p>
              <p className="text-4xl font-bold mb-1">23</p>
              <p className="text-orange-100 text-sm">Enhanced monitoring</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl text-white shadow-lg">
              <p className="text-yellow-100 font-medium mb-2">Medium Risk</p>
              <p className="text-4xl font-bold mb-1">67</p>
              <p className="text-yellow-100 text-sm">Regular check-ups</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white shadow-lg">
              <p className="text-green-100 font-medium mb-2">Low Risk</p>
              <p className="text-4xl font-bold mb-1">142</p>
              <p className="text-green-100 text-sm">Preventive care</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2" glow>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Priority Outreach Queue</h3>
          <p className="text-gray-500 mb-6">Patients requiring immediate intervention based on AI risk assessment</p>
          
          <div className="space-y-4">
            {[
              { name: 'Jane Cooper', risk: 89, condition: 'Pre-diabetic + Hypertension', lastSeen: '3 weeks', urgency: 'critical' },
              { name: 'Robert Chen', risk: 82, condition: 'High Cholesterol + Family History', lastSeen: '1 month', urgency: 'high' },
              { name: 'Maria Garcia', risk: 78, condition: 'Metabolic Syndrome', lastSeen: '2 weeks', urgency: 'high' }
            ].map((patient, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${patient.urgency === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                    <span className="text-lg font-bold text-red-600">{patient.risk}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{patient.condition}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last seen: {patient.lastSeen} ago</span>
                  <button className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Predictive Analytics</h3>
          <p className="text-gray-500 mb-6">Disease prediction trends across your patient population</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Diabetes Risk</span>
                <span className="text-purple-600 font-bold">↑ 15%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">68 patients at risk</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Cardiovascular</span>
                <span className="text-blue-600 font-bold">↑ 8%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">45 patients at risk</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Prevention Success</span>
                <span className="text-green-600 font-bold">↑ 22%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Early intervention working</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Fixed Sidebar */}
      <aside className="hidden w-80 flex-col border-r bg-white/90 backdrop-blur-xl md:flex shadow-2xl fixed h-full z-40">
        <div className="flex h-20 items-center border-b border-gray-200/50 px-8">
          <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Prana Pulse
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 overflow-y-auto">
          <ul className="space-y-3">
            <li>
              <Link to="/dashboard" className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/assessment" className="flex items-center gap-4 rounded-2xl px-6 py-4 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300">
                <ActivityIcon className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                <span>Health Assessment</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="flex items-center gap-4 rounded-2xl px-6 py-4 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300">
                <FileTextIcon className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                <span>Health Reports</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="flex items-center gap-4 rounded-2xl px-6 py-4 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300">
                <UsersIcon className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                <span>Patient Management</span>
              </Link>
            </li>
          </ul>

          {/* Enhanced Health Insights Widget */}
          <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-800">Health Tip</span>
            </div>
            <p className="text-sm text-green-700 leading-relaxed mb-3">
              Your recent activity levels show improvement! Keep maintaining 30+ minutes of daily exercise.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Goal achieved this week</span>
            </div>
          </div>


{/* Quick Stats Widget */}
<div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200/50 shadow-lg">
  <h4 className="font-semibold text-blue-900 mb-4">Quick Stats</h4>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-blue-700">Health Score</span>
      <span className="font-bold text-blue-900">78%</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-blue-700">Status</span>
      <span className="font-bold text-green-600">Improving</span>
    </div>
  </div>
</div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col md:ml-80">
        {/* Enhanced Fixed Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/30 bg-white/90 backdrop-blur-xl px-4 md:px-8 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">View Mode:</span>
            <div className="relative inline-flex items-center rounded-2xl bg-gray-100/90 p-1 shadow-inner">
              <button 
                onClick={() => setIsClinicianView(false)} 
                className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  !isClinicianView 
                    ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Patient
              </button>
              <button 
                onClick={() => setIsClinicianView(true)} 
                className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  isClinicianView 
                    ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clinician
              </button>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-6">
            {/* Enhanced Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-medium">Risk Score</p>
                <p className="text-sm font-bold text-green-700">78%</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-medium">Last Check</p>
                <p className="text-sm font-bold text-blue-700">2 days</p>
              </div>
            </div>

            {/* Enhanced User Profile */}
            <div className="relative group">
              <button className="flex items-center gap-3 rounded-2xl border border-gray-200/50 p-2 pr-4 hover:bg-gray-50/80 transition-all hover:shadow-lg duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
                  {userProfile?.name?.[0].toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-sm font-semibold text-gray-900 block">{userProfile?.name}</span>
                  <span className="text-xs text-gray-500">Health Score: 78%</span>
                </div>
              </button>
              
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 hidden group-hover:block">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{userProfile?.name}</p>
                  <p className="text-sm text-gray-500">Age: {userProfile?.age} • ID: #HP2025</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Healthy Status</span>
                  </div>
                </div>
                <Link to="#" className="w-full text-left flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors">
                  <SettingsIcon className="mr-3 h-4 w-4" /> 
                  Account Settings
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors border-t border-gray-100"
                >
                  <LogOutIcon className="mr-3 h-4 w-4" /> 
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="mx-auto w-full max-w-8xl">
            {/* Enhanced Welcome Section */}
            <div className="mb-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                    {getGreeting()}, {userProfile?.name?.split(' ')[0] || 'User'}!
                  </h1>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Your personalized health insights powered by advanced AI analysis
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      July 27, 2025
                    </span>
                    <span className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      Last updated: 2 hours ago
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-center lg:text-right p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200/50 shadow-lg">
                    <p className="text-sm text-blue-600 font-medium mb-1">Overall Health Trend</p>
                    <p className="text-3xl font-bold text-blue-800 mb-2">↗ Improving</p>
                    <p className="text-xs text-blue-600">+5% since last month</p>
                  </div>
                </div>
              </div>
            </div>

            {isClinicianView ? <ClinicianView /> : <UserView />}
          </div>
        </main>
      </div>
    </div>
  );
}