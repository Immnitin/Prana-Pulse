import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase-config'; // Make sure this path is correct

// --- SVG Icon Components ---
const LogOutIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const SettingsIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l-.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const HeartPulse = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" /></svg>);
const ShieldCheckIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
const ActivityIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
const FileTextIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>);
const UsersIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const ClockIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const AlertTriangleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>);
const BrainIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>);
const CalendarIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>);
const HeartIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>);
const DropletIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>);
const AppleIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>);
const SunriseIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>);
const SunIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>);
const MoonIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>);

// --- Reusable UI Components ---
const Card = ({ children, className = '', gradient = false, glow = false }) => ( <div className={`bg-white/90 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 ${gradient ? 'bg-gradient-to-br from-white/95 to-white/80' : ''} ${glow ? 'shadow-blue-500/10 hover:shadow-blue-500/20' : ''} ${className}`}> {children} </div> );


const DiseasePredictionCard = ({ disease, prediction }) => {
    if (!prediction) {
        return <div className="p-4 text-center bg-gray-50 rounded-xl border"><p className="text-sm text-gray-500">No prediction data available.</p><Link to="/assessment" className="text-sm text-blue-600 hover:underline mt-2 block">Take Assessment</Link></div>
    }
    const { probability, timeframe, severity } = prediction;
    const severityColors = { low: 'bg-green-100 text-green-800 border-green-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', high: 'bg-red-100 text-red-800 border-red-200' };
    return ( <div className="p-5 bg-gradient-to-r from-white/80 to-gray-50/80 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold text-gray-900 text-base">{disease}</h4><span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${severityColors[severity]}`}>{severity.toUpperCase()}</span></div><div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-600">{timeframe}</span><span className="text-lg font-bold text-blue-600">{probability}%</span></div><div className="bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${probability}%` }} /></div></div> );
};

const NoDataCard = ({ title, message }) => ( <div className="text-center p-8"><h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2><p className="text-base text-gray-500 mb-6">{message}</p><Link to="/assessment" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-all text-base shadow-md hover:shadow-lg"><ActivityIcon className="h-5 w-5" /> Start Assessment</Link></div> );

const analyzeRecords = (records) => {
    if (!records || records.length < 2) {
        return "Your health patterns are stable. Keep up the good work with regular monitoring and maintain healthy lifestyle choices.";
    }
    
    const scores = records.map(record => parseFloat(record.value)).filter(score => !isNaN(score));
    if (scores.length === 0) return "Continue regular health monitoring for better insights.";
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const latestScore = scores[scores.length - 1];
    const previousScore = scores.length > 1 ? scores[scores.length - 2] : latestScore;
    
    let trendAnalysis = "";
    if (latestScore < previousScore) {
        trendAnalysis = "Recent trends show positive improvement in your health metrics. ";
    } else if (latestScore > previousScore) {
        trendAnalysis = "Recent trends indicate elevated risk factors requiring attention. ";
    } else {
        trendAnalysis = "Your health patterns remain stable with consistent monitoring. ";
    }
    
    let riskLevel = "";
    if (averageScore < 0.3) {
        riskLevel = "Your average risk profile is low - excellent work maintaining healthy habits. Continue with regular exercise, balanced nutrition, and routine health check-ups.";
    } else if (averageScore < 0.6) {
        riskLevel = "Your average risk profile is moderate. Focus on lifestyle improvements including diet optimization, increased physical activity, and stress management techniques.";
    } else {
        riskLevel = "Your average risk profile indicates higher concern. Immediate lifestyle interventions recommended - consult with healthcare providers for personalized treatment plans.";
    }
    
    return trendAnalysis + riskLevel;
};

const NutritionPlanCard = ({ latestNutritionPlan }) => {
    const [activeDay, setActiveDay] = useState(1);

    if (!latestNutritionPlan) {
        return (
            <Card className="h-full" glow>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                            <AppleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Your Nutrition Plan</h3>
                            <p className="text-sm text-gray-500">Personalized dietary recommendations</p>
                        </div>
                    </div>
                    <NoDataCard title="No Nutrition Plan Available" message="Complete a health assessment to get your personalized nutrition recommendations." />
                </div>
            </Card>
        );
    }

    const { assessmentType, explanation, createdAt } = latestNutritionPlan;

    const formatDate = (timestamp) => {
        if (!timestamp) return "Recently";
        try {
            return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric' 
            });
        } catch {
            return "Recently";
        }
    };

    const formatDietPlan = (dietPlan) => {
        if (!dietPlan) return [];
        return dietPlan.split('**Day').slice(1).map((day, index) => ({
            day: index + 1,
            meals: day.split('- ').slice(1).map(meal => meal.trim())
        }));
    };

    const dietDays = formatDietPlan(explanation?.diet_plan);
    const activeDayData = dietDays.find(d => d.day === activeDay);

    const mealIcons = {
        'Breakfast': <SunriseIcon className="h-6 w-6 text-orange-400" />,
        'Lunch': <SunIcon className="h-6 w-6 text-yellow-500" />,
        'Dinner': <MoonIcon className="h-6 w-6 text-indigo-400" />,
    };

    return (
        <Card className="h-full" glow>
            <div className="p-6">
                {/* --- Header --- */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                            <AppleIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Your Nutrition Plan</h3>
                            <p className="text-sm text-gray-500">Based on {assessmentType} assessment • {formatDate(createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* --- Lifestyle Recommendations --- */}
                {explanation?.lifestyle_recommendations && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-1 text-base">Lifestyle Recommendations</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">{explanation.lifestyle_recommendations}</p>
                    </div>
                )}

                {/* --- Interactive Meal Plan --- */}
                {dietDays.length > 0 && (
                    <div>
                        {/* Tabs for Day Selection */}
                        <div className="flex border-b border-gray-200 mb-4">
                            {dietDays.map(({ day }) => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-300 ${activeDay === day ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                                >
                                    Day {day}
                                </button>
                            ))}
                        </div>

                        {/* Content for Active Day */}
                        <div className="space-y-4">
                            {activeDayData?.meals.map((meal, index) => {
                                const colonIndex = meal.indexOf(':');
                                if (colonIndex === -1) return null;

                                const mealType = meal.substring(0, colonIndex).trim();
                                const mealDesc = meal.substring(colonIndex + 1).trim();
                                const icon = mealIcons[mealType] || <AppleIcon className="h-6 w-6 text-gray-400" />;

                                return (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-white/70 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-300">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{mealType}</p>
                                            <p className="text-gray-600 text-sm">{mealDesc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* --- Footer Link --- */}
                <div className="mt-6 pt-4 border-t border-gray-200/80">
                    <Link to="/assessment" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold group">
                        <ActivityIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
                        Get a New Plan
                    </Link>
                </div>
            </div>
        </Card>
    );
};


const PastRecordCard = ({ title, icon, color, records }) => {
    const summary = analyzeRecords(records);
    return (
        <Card className="h-full" glow>
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">Historical Analysis</p>
                    </div>
                </div>
                {records && records.length > 0 ? (
                    <>
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Comprehensive Health Summary</h4>
                            <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
                        </div>
                        <div className="space-y-3">
                            {records.slice(-3).map((record, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{record.date}</p>
                                        <p className="text-sm text-gray-500">{record.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-sm ${record.status === 'low' ? 'text-green-600' : record.status === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{record.value}</p>
                                        <p className="text-sm text-gray-500 capitalize">{record.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <NoDataCard title="No Records Found" message="Complete health assessments to track your progress." />
                )}
            </div>
        </Card>
    );
};

// --- Views ---
const UserView = ({ userProfile }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PastRecordCard
                title="Heart Disease Records"
                icon={<HeartIcon className="h-5 w-5 text-white" />}
                color="bg-gradient-to-r from-red-500 to-pink-500"
                records={userProfile?.heartDiseaseRecords || []}
            />
            <PastRecordCard
                title="Diabetes Records"
                icon={<DropletIcon className="h-5 w-5 text-white" />}
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                records={userProfile?.diabetesRecords || []}
            />
        </div>

        <NutritionPlanCard latestNutritionPlan={userProfile?.latestNutritionPlan} />

        <Card glow>
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <AlertTriangleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Latest Disease Prediction</h3>
                        <p className="text-sm text-gray-500">AI-powered risk forecasting</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DiseasePredictionCard disease="Type 2 Diabetes" prediction={userProfile?.latestDiabetesPrediction} />
                    <DiseasePredictionCard disease="Cardiovascular Disease" prediction={userProfile?.latestHeartPrediction} />
                </div>
            </div>
        </Card>

        <Card className="overflow-hidden" gradient glow>
            <div className="p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                        <h3 className="text-2xl font-bold mb-2">Ready for Your Next Assessment?</h3>
                        <p className="text-blue-100 text-base mb-4">Get updated risk predictions and personalized health insights.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link to="/assessment" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-300 text-base">
                            <ActivityIcon className="h-5 w-5" /> Start Assessment
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
            <div className="p-6">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Patient Risk Stratification</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div className="p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg">
                        <p className="text-red-100 font-semibold mb-1 text-sm">Critical Risk</p>
                        <p className="text-3xl font-bold mb-1">8</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white shadow-lg">
                        <p className="text-orange-100 font-semibold mb-1 text-sm">High Risk</p>
                        <p className="text-3xl font-bold mb-1">23</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl text-white shadow-lg">
                        <p className="text-yellow-100 font-semibold mb-1 text-sm">Medium Risk</p>
                        <p className="text-3xl font-bold mb-1">67</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
                        <p className="text-green-100 font-semibold mb-1 text-sm">Low Risk</p>
                        <p className="text-3xl font-bold mb-1">142</p>
                    </div>
                </div>
            </div>
        </Card>
        <Card className="lg:col-span-2" glow>
            <div className="p-6">
                <h3 className="text-lg font-bold mb-3">Priority Outreach Queue</h3>
                <p className="text-gray-500 mb-4 text-sm">Patients requiring immediate intervention</p>
                <div className="space-y-4">
                    {[
                        { name: 'Jane Cooper', risk: 89, condition: 'Pre-diabetic + Hypertension', lastSeen: '3 weeks', urgency: 'critical' },
                        { name: 'Robert Chen', risk: 82, condition: 'High Cholesterol + Family History', lastSeen: '1 month', urgency: 'high' },
                        { name: 'Maria Garcia', risk: 78, condition: 'Metabolic Syndrome', lastSeen: '2 weeks', urgency: 'high' }
                    ].map((patient, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-sm transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm">{patient.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${patient.urgency === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                    <span className="text-base font-bold text-red-600">{patient.risk}%</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{patient.condition}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Last seen: {patient.lastSeen} ago</span>
                                <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">Contact</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
        <Card>
            <div className="p-6">
                <h3 className="text-lg font-bold mb-3">Predictive Analytics</h3>
                <p className="text-gray-500 mb-4 text-sm">Disease trends across patients</p>
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Diabetes Risk</span>
                            <span className="text-purple-600 font-bold text-sm">↑ 15%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div></div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Cardiovascular</span>
                            <span className="text-blue-600 font-bold text-sm">↑ 8%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div></div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Prevention Success</span>
                            <span className="text-green-600 font-bold text-sm">↑ 22%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div></div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);


export function DashboardPage() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClinicianView, setIsClinicianView] = useState(false);

    useEffect(() => {
        // Define no-op cleanup functions to be reassigned later
        let unsubscribeUserDoc = () => {};
        let unsubscribeAssessments = () => {};

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Subscribe to user profile
                const userDocRef = doc(db, "users", user.uid);
                unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        console.log("No user profile found in database!");
                    }
                });

                // Fetch latest nutrition plan from the user's assessments subcollection
                const assessmentsQuery = query(
                    collection(db, 'users', user.uid, 'assessments'), 
                    where("userEmail", "==", user.email),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );
                
                unsubscribeAssessments = onSnapshot(assessmentsQuery, (querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const latestAssessment = querySnapshot.docs[0].data();
                        setUserProfile(prevProfile => ({
                            ...(prevProfile || {}), // Guard against prevProfile being null
                            ...prevProfile,
                            latestNutritionPlan: latestAssessment
                        }));
                    }
                    // Data fetching attempts are complete, so stop loading
                    setIsLoading(false);
                }, (error) => {
                    // Also stop loading on error
                    console.error("Error fetching assessments:", error);
                    setIsLoading(false);
                });
            } else {
                navigate('/login');
            }
        });

        // This is the cleanup function for the useEffect hook.
        // It will be called when the component unmounts.
        return () => {
            unsubscribeAuth();
            unsubscribeUserDoc();
            unsubscribeAssessments();
        };
    }, [navigate]);

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

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-center"><HeartPulse className="h-20 w-20 text-blue-600 animate-pulse" /></div>;
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <aside className="hidden w-64 flex-col border-r bg-white/90 backdrop-blur-xl md:flex shadow-xl fixed h-full z-40">
                <div className="flex h-16 items-center border-b border-gray-200/50 px-6">
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
                            <HeartPulse className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Prana Pulse</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        <li><Link to="/dashboard" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"><ShieldCheckIcon className="h-4 w-4" /><span>Dashboard</span></Link></li>
                        <li><Link to="/assessment" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300 text-sm"><ActivityIcon className="h-4 w-4 group-hover:text-blue-600 transition-colors" /><span>Health Assessment</span></Link></li>
                        <li><Link to="/ask-prana" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300 text-sm"><BrainIcon className="h-4 w-4 group-hover:text-blue-600 transition-colors" /><span>Ask Prana-Pulse</span></Link></li>
                        <li><Link to="/reports" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all hover:bg-gray-100/80 hover:text-gray-900 group hover:scale-105 duration-300 text-sm"><FileTextIcon className="h-4 w-4 group-hover:text-blue-600 transition-colors" /><span>Health Reports</span></Link></li>
                    </ul>
                </nav>
            </aside>
            <div className="flex flex-1 flex-col md:ml-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/30 bg-white/90 backdrop-blur-xl px-4 md:px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600">View Mode:</span>
                        <div className="relative inline-flex items-center rounded-xl bg-gray-100/90 p-0.5 shadow-inner">
                            <button onClick={() => setIsClinicianView(false)} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${!isClinicianView ? 'bg-white text-blue-600 shadow-sm transform scale-105' : 'text-gray-600 hover:text-gray-900'}`}>Patient</button>
                            <button onClick={() => setIsClinicianView(true)} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${isClinicianView ? 'bg-white text-blue-600 shadow-sm transform scale-105' : 'text-gray-600 hover:text-gray-900'}`}>Clinician</button>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="relative group">
                            <button className="flex items-center gap-2 rounded-xl border border-gray-200/50 p-1.5 pr-3 hover:bg-gray-50/80 transition-all hover:shadow-md duration-300">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">{userProfile?.name?.[0].toUpperCase() || 'U'}</div>
                                <div className="hidden md:block text-left">
                                    <span className="text-xs font-medium text-gray-900 block">{userProfile?.name}</span>
                                    <span className="text-xs text-gray-500">{userProfile?.role || 'Patient'}</span>
                                </div>
                            </button>
                            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-1 z-20 hidden group-hover:block">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-medium text-gray-900 text-xs">{userProfile?.name}</p>
                                    <p className="text-xs text-gray-500">Age: {userProfile?.age}</p>
                                </div>
                                <Link to="/settings" className="w-full text-left flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">
                                    <SettingsIcon className="mr-2 h-3 w-3" /> Settings
                                </Link>
                                <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors border-t border-gray-100">
                                    <LogOutIcon className="mr-2 h-3 w-3" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">{getGreeting()}, {userProfile?.name|| 'User'}!</h1>
                            <p className="text-gray-600 text-sm leading-relaxed">Your personalized health insights powered by AI analysis.</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Last updated: Just now</span>
                            </div>
                        </div>
                        {isClinicianView ? <ClinicianView /> : <UserView userProfile={userProfile} />}
                    </div>
                </main>
            </div>
        </div>
    );
}