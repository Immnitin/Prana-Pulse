import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { HeartPulse, ArrowLeft, Download, User, Mail, Clock, Heart, Droplet, FileText, Target, Activity, CheckCircle, Utensils, AlertTriangle } from 'lucide-react';
import { auth, db } from '../firebase-config'; // Ensure path is correct
import { doc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Functions & Components ---

// Fetches user data from Firestore by User ID
const fetchUserFromFirestore = async (userId) => {
    if (!userId) return null;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
};

// --- REFINED COMPONENT: UserInputReview ---
// Displays user-submitted data in a compact, clean format.
const UserInputReview = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return <p className="text-sm text-gray-500">Submitted information could not be loaded.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-medium text-gray-800">{String(value)}</p>
                </div>
            ))}
        </div>
    );
};

// --- REFINED COMPONENT: FormattedExplanation ---
// This component correctly handles both raw text (with **) and clean text (without **).
const FormattedExplanation = ({ text }) => {
    if (!text) return <p className="text-sm text-gray-500">No detailed explanation available.</p>;

    const createMarkup = (line) => {
        // This will bold the text if `**` is present, and do nothing if it's not.
        const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        return { __html: boldedLine };
    };

    return (
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
            {text.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                // Check for list items (works with clean data)
                if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    return (
                        <div key={index} className="flex items-start gap-2.5">
                            <span className="text-blue-500 mt-1">&#8226;</span>
                            <p className="flex-1" dangerouslySetInnerHTML={createMarkup(line.replace(/^[•\-*]\s*/, ''))} />
                        </div>
                    );
                }
                return <p key={index} dangerouslySetInnerHTML={createMarkup(line)} />;
            })}
        </div>
    );
};


export function HealthReportPage() {
    // --- State and Hooks ---
    const [userInfo, setUserInfo] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { reportId } = useParams();

    useEffect(() => {
        const loadPageData = async () => {
            setIsLoading(true);
            try {
                let data, user;
                // Scenario 1: Loading from a shared link (/report/:reportId)
                if (reportId) {
                    const reportDocRef = doc(db, 'assessments', reportId);
                    const reportDoc = await getDoc(reportDocRef);
                    if (reportDoc.exists()) {
                        data = reportDoc.data(); // This data is CLEAN from Firestore
                        if (data.userId) {
                            user = await fetchUserFromFirestore(data.userId);
                        }
                    } else {
                        throw new Error("Report not found.");
                    }
                } 
                // Scenario 2: Loading after completing an assessment
                else if (location.state) {
                    // The entire reportData object is passed in the state
                    data = location.state; // This data is RAW from state, with markdown
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        user = await fetchUserFromFirestore(currentUser.uid);
                    } else {
                        navigate('/login');
                        return;
                    }
                } 
                // Scenario 3: No data available
                else {
                    navigate('/dashboard');
                    return;
                }

                setReportData(data);
                setUserInfo(user);

            } catch (error) {
                console.error("Error loading report data:", error);
                navigate('/dashboard'); // Redirect on error
            } finally {
                setIsLoading(false);
            }
        };

        loadPageData();
    }, [location, navigate, reportId]);

    // --- Handlers ---
    const handleDownloadReport = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        document.body.classList.add('pdf-rendering');
        
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            windowWidth: reportElement.scrollWidth,
            windowHeight: reportElement.scrollHeight,
        });

        document.body.classList.remove('pdf-rendering');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(`Health_Report_${userInfo?.name?.replace(' ', '_') || 'User'}.pdf`);
    };

    // --- UI Data and Mappings ---
    const getRiskLevel = (score) => {
        if (score <= 0.3) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50', ringColor: 'ring-green-200' };
        if (score <= 0.7) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', ringColor: 'ring-yellow-200' };
        return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50', ringColor: 'ring-red-200' };
    };

    const explanationSections = {
        risk_assessment: { title: "Risk Assessment Summary", icon: Target, color: "text-blue-600", bgColor: "bg-blue-100" },
        key_factors_analysis: { title: "Health Vitals Analysis", icon: Activity, color: "text-yellow-600", bgColor: "bg-yellow-100" },
        lifestyle_recommendations: { title: "Lifestyle Recommendations", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
        diet_plan: { title: "Personalized Diet Plan", icon: Utensils, color: "text-orange-600", bgColor: "bg-orange-100" },
    };

    // --- Loading and Error States ---
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-center"><HeartPulse className="h-10 w-10 text-blue-600 animate-pulse" /><p className="ml-4 text-lg font-semibold text-gray-700">Preparing Your Report...</p></div>;
    }
    if (!reportData || !userInfo) {
        return <div className="flex h-screen flex-col items-center justify-center p-4 text-center"><AlertTriangle className="h-12 w-12 text-red-500" /><h2 className="mt-4 text-2xl font-bold">Report Error</h2><p className="mt-2 text-gray-600">Could not load report data. Please try again.</p><button onClick={() => navigate('/dashboard')} className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Go Back</button></div>;
    }

    // --- Derived State for Rendering ---
    const { assessmentType, userInput, results, createdAt } = reportData;
    const risk_score = results?.risk_score || 0;
    const explanation = results?.explanation || {};
    const assessmentName = assessmentType === 'heart' ? 'Heart Disease' : 'Diabetes';
    const assessmentIcon = assessmentType === 'heart' ? Heart : Droplet;
    const riskInfo = getRiskLevel(risk_score);
    const reportDate = createdAt?.toDate ? createdAt.toDate() : new Date();

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <style>{`.pdf-rendering { background: #fff !important; }`}</style>
            <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-3 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/dashboard')} className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Go to Dashboard"><ArrowLeft className="h-5 w-5" /></button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-md"><HeartPulse className="h-5 w-5 text-white" /></div>
                            <div>
                                <h1 className="font-bold text-lg text-gray-800">Health Assessment Report</h1>
                                <p className="text-xs text-gray-500">{assessmentName} Risk Analysis</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <Download className="h-4 w-4" /> Download
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="sticky top-24 rounded-xl border bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">Patient Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3"><User className="h-4 w-4 text-gray-500 mt-0.5" /><div className="text-sm"><p className="font-medium text-gray-800">{userInfo.name}</p></div></div>
                                <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-gray-500 mt-0.5" /><div className="text-sm"><p className="break-all font-medium text-gray-800">{userInfo.email}</p></div></div>
                                <div className="flex items-start gap-3"><Clock className="h-4 w-4 text-gray-500 mt-0.5" /><div className="text-sm"><p className="font-medium text-gray-800">{reportDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
                            </div>
                        </div>
                    </aside>

                    <section id="report-content" className="lg:col-span-9 bg-white rounded-2xl border shadow-lg overflow-hidden">
                        {/* --- Report Header & Summary --- */}
                        <div className={`p-6 sm:p-8 border-b-4 ${riskInfo.ringColor.replace('ring-','border-')}`}>
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                <div>
                                    {React.createElement(assessmentIcon, { className: `h-10 w-10 mb-3 ${riskInfo.color}` })}
                                    <h2 className="text-2xl font-bold text-gray-900">{assessmentName} Risk Report</h2>
                                    <p className="text-sm text-gray-600 mt-1">AI-powered analysis based on your provided health data.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full sm:w-auto shrink-0">
                                    <div className={`rounded-lg p-4 text-center ring-1 ${riskInfo.ringColor} ${riskInfo.bgColor}`}>
                                        <p className="text-xs font-semibold text-gray-600">Risk Level</p>
                                        <p className={`text-2xl font-bold ${riskInfo.color}`}>{riskInfo.level}</p>
                                    </div>
                                    <div className="rounded-lg p-4 text-center ring-1 ring-blue-200 bg-blue-50">
                                        <p className="text-xs font-semibold text-gray-600">Risk Score</p>
                                        <p className="text-2xl font-bold text-blue-600">{(risk_score * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- User Submitted Data Section --- */}
                        <div className="p-6 sm:p-8">
                             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500"/>
                                Your Submitted Information
                             </h3>
                             <UserInputReview data={userInput} />
                        </div>
                        
                        <hr/>

                        {/* --- Dynamic Explanation Sections --- */}
                        <div className="p-6 sm:p-8 space-y-8">
                            {Object.entries(explanationSections).map(([key, { title, icon: Icon, color, bgColor }]) => (
                                explanation[key] && (
                                    <div key={key}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor} shrink-0`}>
                                                <Icon className={`h-5 w-5 ${color}`} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                        </div>
                                        <div className="pl-11 border-l-2 border-gray-200 ml-4">
                                           <div className="pl-6">
                                                <FormattedExplanation text={explanation[key]} />
                                           </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
