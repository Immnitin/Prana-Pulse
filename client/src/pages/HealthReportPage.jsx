import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { HeartPulse, ArrowLeft, Download, Share2, User, Calendar, Mail, Phone, AlertTriangle, CheckCircle, Activity, Utensils, Target, TrendingUp, Clock, Heart, Droplet, FileText } from 'lucide-react';
import { auth, db } from '../firebase-config'; // Ensure path is correct
import { doc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Functions & Components ---

// Fetches user data from Firestore
const fetchUserFromFirestore = async (userId) => {
    if (!userId) return null;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
};

// A component to parse and format the AI's text explanations
const FormattedExplanation = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-3">
            {lines.map((line, index) => {
                if (line.endsWith(':')) {
                    return <h4 key={index} className="font-semibold text-gray-800 mt-4">{line.slice(0, -1)}</h4>;
                }
                if (line.startsWith('•') || line.startsWith('-') || /^\W/.test(line.trim())) {
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1">&#8226;</span>
                            <p className="text-gray-700 flex-1">{line.replace(/^[•\-]\s*/, '').trim()}</p>
                        </div>
                    );
                }
                return <p key={index} className="text-gray-700">{line}</p>;
            })}
        </div>
    );
};

// A component to display the user's submitted data
const UserInputReview = ({ data }) => {
    if (!data) return null;
    return (
        <div className="rounded-2xl border bg-white p-8 shadow-md">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Your Submitted Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-gray-800">{String(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export function HealthReportPage() {
    // --- State and Hooks ---
    const [userInfo, setUserInfo] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [userInput, setUserInput] = useState(null);
    const [assessmentType, setAssessmentType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const reportRef = useRef(null); // Ref for the PDF capture

    useEffect(() => {
        const { state } = location;
        if (!state?.results || !state?.assessmentType || !state?.userInput) {
            navigate('/assessment');
            return;
        }
        
        const loadPageData = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedUser = await fetchUserFromFirestore(user.uid);
                setUserInfo(fetchedUser);
                setReportData(state.results);
                setAssessmentType(state.assessmentType);
                setUserInput(state.userInput);
            } else {
                navigate('/login');
            }
            setIsLoading(false);
        };

        loadPageData();
    }, [location, navigate]);

    // --- Handlers ---
    const handleDownloadReport = () => {
        const input = reportRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`Health_Report_${userInfo?.fullName?.replace(' ', '_') || 'User'}.pdf`);
        });
    };

    const handleShareReport = async () => {
        const riskLevel = getRiskLevel(reportData?.risk_score || 0).level;
        const shareData = {
            title: 'Health Assessment Report',
            text: `Here is my ${assessmentName} risk assessment summary from Prana-Pulse:\n\nRisk Level: ${riskLevel}\nRisk Score: ${((reportData.risk_score || 0) * 100).toFixed(1)}%\n\nThis is an AI-generated summary and not a medical diagnosis.`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('Web Share API is not supported in your browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getRiskLevel = (score) => {
        if (score <= 0.3) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
        if (score <= 0.7) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
        return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    };
    
    // --- Loading and Error States ---
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-center"><HeartPulse className="h-12 w-12 text-blue-600 animate-pulse" /><p className="ml-4 text-xl font-semibold text-gray-700">Preparing Your Report...</p></div>;
    }

    if (!reportData || !userInfo) {
        return <div className="flex h-screen flex-col items-center justify-center p-4 text-center"><AlertTriangle className="h-12 w-12 text-red-500" /><h2 className="mt-4 text-2xl font-bold">Report Error</h2><p className="mt-2 text-gray-600">Could not load report data. Please try again.</p><button onClick={() => navigate('/assessment')} className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Go Back</button></div>;
    }

    // --- Derived State for Rendering ---
    const assessmentIcon = assessmentType === 'heart' ? Heart : Droplet;
    const assessmentName = assessmentType === 'heart' ? 'Heart Disease' : 'Diabetes';
    const riskInfo = getRiskLevel(reportData?.risk_score || 0);

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/assessment')} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
                        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"><HeartPulse className="h-6 w-6 text-white" /></div><div><h1 className="font-bold text-xl text-gray-800">Health Assessment Report</h1><p className="text-sm text-gray-500">{assessmentName} Risk Analysis</p></div></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleShareReport} className="flex items-center gap-2 rounded-lg border-2 border-blue-200 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"><Share2 className="h-4 w-4" /> Share</button>
                        <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700"><Download className="h-4 w-4" /> Download</button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside className="lg:col-span-1"><div className="sticky top-28 rounded-2xl border bg-white p-6 shadow-md"><div className="mb-6 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md"><User className="h-7 w-7 text-white" /></div><div><h2 className="font-bold text-lg text-gray-800">Patient Information</h2></div></div><div className="space-y-4"><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><User className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Full Name</p><p className="font-semibold text-gray-800">{userInfo.fullName}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><Calendar className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Age</p><p className="font-semibold text-gray-800">{userInfo.age || 'N/A'}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><Mail className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Email</p><p className="break-all text-sm font-semibold text-gray-800">{userInfo.email}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><Clock className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Assessment Date</p><p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p></div></div></div></div></aside>

                    <section className="space-y-8 lg:col-span-3" ref={reportRef}>
                        <div className={`rounded-2xl border-2 bg-white p-8 shadow-md ${riskInfo.borderColor}`}><div className="mb-6 flex items-center gap-6"><div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 ${riskInfo.bgColor} ${riskInfo.borderColor}`}>{React.createElement(assessmentIcon, { className: `h-10 w-10 ${riskInfo.color}` })}</div><div><h2 className="mb-2 text-3xl font-bold text-gray-800">{assessmentName} Risk Assessment</h2><p className="text-lg text-gray-600">Comprehensive AI-powered health analysis</p></div></div><div className="grid gap-6 md:grid-cols-3"><div className={`rounded-xl border-2 p-6 ${riskInfo.bgColor} ${riskInfo.borderColor}`}><div className="mb-3 flex items-center gap-3"><TrendingUp className={`h-6 w-6 ${riskInfo.color}`} /><span className="font-bold text-gray-700">Risk Level</span></div><p className={`mb-2 text-4xl font-bold ${riskInfo.color}`}>{riskInfo.level}</p></div><div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6"><div className="mb-3 flex items-center gap-3"><Activity className="h-6 w-6 text-blue-600" /><span className="font-bold text-gray-700">Risk Score</span></div><p className="mb-2 text-4xl font-bold text-blue-600">{((reportData.risk_score || 0) * 100).toFixed(1)}%</p></div><div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6"><div className="mb-3 flex items-center gap-3"><HeartPulse className="h-6 w-6 text-indigo-600" /><span className="font-bold text-gray-700">Assessment</span></div><p className="text-lg font-bold text-indigo-600">{assessmentName}</p></div></div></div>
                        
                        <UserInputReview data={userInput} />

                        <div className="rounded-2xl border bg-white p-8 shadow-md"><div className="mb-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"><Target className="h-6 w-6 text-blue-600" /></div><h3 className="text-2xl font-bold text-gray-800">Risk Assessment Summary</h3></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-6"><FormattedExplanation text={reportData.explanation?.risk_assessment} /></div></div>
                        <div className="rounded-2xl border bg-white p-8 shadow-md"><div className="mb-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100"><AlertTriangle className="h-6 w-6 text-yellow-600" /></div><h3 className="text-2xl font-bold text-gray-800">Health Vitals Analysis</h3></div><div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6"><FormattedExplanation text={reportData.explanation?.key_factors_analysis} /></div></div>
                        <div className="rounded-2xl border bg-white p-8 shadow-md"><div className="mb-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100"><CheckCircle className="h-6 w-6 text-green-600" /></div><h3 className="text-2xl font-bold text-gray-800">Lifestyle Recommendations</h3></div><div className="rounded-xl border border-green-200 bg-green-50 p-6"><FormattedExplanation text={reportData.explanation?.lifestyle_recommendations} /></div></div>
                        <div className="rounded-2xl border bg-white p-8 shadow-md"><div className="mb-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100"><Utensils className="h-6 w-6 text-orange-600" /></div><h3 className="text-2xl font-bold text-gray-800">Personalized Diet Plan</h3></div><div className="rounded-xl border border-orange-200 bg-orange-50 p-6"><FormattedExplanation text={reportData.explanation?.diet_plan} /></div></div>
                    </section>
                </div>
            </main>
        </div>
    );
}