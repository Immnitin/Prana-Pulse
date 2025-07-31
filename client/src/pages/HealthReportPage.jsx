import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { HeartPulse, ArrowLeft, Download, Share2, User, Calendar, Mail, Phone, AlertTriangle, CheckCircle, Activity, Utensils, Target, TrendingUp, Clock, Heart, Droplet, FileText } from 'lucide-react';
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

// A component to parse and format the AI's text explanations
const FormattedExplanation = ({ text }) => {
    if (!text) return null;

    // Enhanced parsing to handle bolding with asterisks and lists
    const createMarkup = (line) => {
        const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return { __html: boldedLine };
    };

    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-3 text-base">
            {lines.map((line, index) => {
                if (line.endsWith(':') && !line.startsWith('**')) {
                    return <h4 key={index} className="font-semibold text-gray-800 mt-4 text-lg">{line.slice(0, -1)}</h4>;
                }
                if (line.startsWith('•') || line.startsWith('-') || /^\W/.test(line.trim().substring(0, 2))) {
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1.5">&#8226;</span>
                            <p className="text-gray-700 flex-1" dangerouslySetInnerHTML={createMarkup(line.replace(/^[•\-*]\s*/, '').trim())} />
                        </div>
                    );
                }
                return <p key={index} className="text-gray-700" dangerouslySetInnerHTML={createMarkup(line.replace(/\*/g, ''))} />;
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
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                    <FileText className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Your Submitted Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-3">
                        <span className="text-base text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-gray-800 text-base">{String(value)}</span>
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
    const [assessmentId, setAssessmentId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { reportId } = useParams(); // For sharable links

    useEffect(() => {
        const loadPageData = async () => {
            setIsLoading(true);
            try {
                let data, user, assessmentDocId;

                if (reportId) {
                    // Loading from a shared link
                    const reportDocRef = doc(db, 'assessments', reportId);
                    const reportDoc = await getDoc(reportDocRef);
                    if (reportDoc.exists()) {
                        data = reportDoc.data();
                        assessmentDocId = reportId;
                        // Fetch user info based on userId stored in the assessment
                        if (data.userId) {
                            const fetchedUser = await fetchUserFromFirestore(data.userId);
                            setUserInfo(fetchedUser);
                        }
                    } else {
                        throw new Error("Report not found.");
                    }
                } else if (location.state) {
                    // Loading after completing an assessment
                    data = location.state.results;
                    assessmentDocId = location.state.assessmentId; // Assuming assessmentId is passed in state
                    user = auth.currentUser;
                    if (user) {
                        const fetchedUser = await fetchUserFromFirestore(user.uid);
                        setUserInfo(fetchedUser);
                    } else {
                        navigate('/login');
                        return;
                    }
                } else {
                    navigate('/assessment');
                    return;
                }

                setReportData(data);
                setAssessmentType(data.assessmentType);
                setUserInput(data.userInput);
                setAssessmentId(assessmentDocId);

            } catch (error) {
                console.error("Error loading report data:", error);
                navigate('/assessment'); // Redirect on error
            } finally {
                setIsLoading(false);
            }
        };

        loadPageData();
    }, [location, navigate, reportId]);

    // --- Handlers ---
    const handleDownloadReport = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const addContentToPage = async (elementIds) => {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.width = '800px'; // A fixed width for consistent rendering
            container.style.background = 'white';

            elementIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    container.appendChild(element.cloneNode(true));
                }
            });

            document.body.appendChild(container);

            const canvas = await html2canvas(container, { scale: 2 });
            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/png');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgHeight = (pdfWidth - margin * 2) / ratio;

            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight);
        };

        // Page 1
        await addContentToPage(['pdf-summary', 'pdf-userInput', 'pdf-riskAssessment']);

        // Page 2
        pdf.addPage();
        await addContentToPage(['pdf-vitals']);

        // Page 3
        pdf.addPage();
        await addContentToPage(['pdf-lifestyle', 'pdf-diet']);

        pdf.save(`Health_Report_${userInfo?.name?.replace(' ', '_') || 'User'}.pdf`);
    };


    const handleShareReport = async () => {
        if (!assessmentId) {
            alert("Cannot share this report as it has no unique ID.");
            return;
        }
        const shareUrl = `${window.location.origin}/report/${assessmentId}`;
        const shareData = {
            title: 'Health Assessment Report',
            text: `Check out my health assessment summary.`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(shareUrl);
                alert('Report link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Could not share the report.');
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
                        <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700"><Download className="h-4 w-4" /> Download</button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside className="lg:col-span-1"><div className="sticky top-28 rounded-2xl border bg-white p-6 shadow-md"><div className="mb-6 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md"><User className="h-7 w-7 text-white" /></div><div><h2 className="font-bold text-lg text-gray-800">Patient Information</h2></div></div><div className="space-y-4"><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><User className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Full Name</p><p className="font-semibold text-gray-800">{userInfo.name}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><Mail className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Email</p><p className="break-all text-sm font-semibold text-gray-800">{userInfo.email}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4"><Clock className="h-5 w-5 text-gray-600" /><div><p className="text-sm font-medium text-gray-500">Assessment Date</p><p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p></div></div></div></div></aside>

                    <section className="space-y-8 lg:col-span-3">
                        <div id="pdf-summary" className={`rounded-2xl border-2 bg-white p-8 shadow-md ${riskInfo.borderColor}`}>
                            <div className="mb-6 flex items-center gap-6">
                                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 ${riskInfo.bgColor} ${riskInfo.borderColor}`}>
                                    {React.createElement(assessmentIcon, { className: `h-10 w-10 ${riskInfo.color}` })}
                                </div>
                                <div>
                                    <h2 className="mb-2 text-3xl font-bold text-gray-800">{assessmentName} Risk Assessment</h2>
                                    <p className="text-lg text-gray-600">Comprehensive AI-powered health analysis</p>
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className={`rounded-xl border-2 p-6 ${riskInfo.bgColor} ${riskInfo.borderColor}`}>
                                    <div className="mb-3 flex items-center gap-3">
                                        <TrendingUp className={`h-6 w-6 ${riskInfo.color}`} />
                                        <span className="font-bold text-gray-700 text-lg">Risk Level</span>
                                    </div>
                                    <p className={`mb-2 text-5xl font-bold ${riskInfo.color}`}>{riskInfo.level}</p>
                                </div>
                                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <Activity className="h-6 w-6 text-blue-600" />
                                        <span className="font-bold text-gray-700 text-lg">Risk Score</span>
                                    </div>
                                    <p className="mb-2 text-5xl font-bold text-blue-600">{((reportData.risk_score || 0) * 100).toFixed(1)}%</p>
                                </div>
                                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <HeartPulse className="h-6 w-6 text-indigo-600" />
                                        <span className="font-bold text-gray-700 text-lg">Assessment</span>
                                    </div>
                                    <p className="text-xl font-bold text-indigo-600">{assessmentName}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div id="pdf-userInput">
                           <UserInputReview data={userInput} />
                        </div>

                        <div id="pdf-riskAssessment" className="rounded-2xl border bg-white p-8 shadow-md">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                                    <Target className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Risk Assessment Summary</h3>
                            </div>
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                                <FormattedExplanation text={reportData.explanation?.risk_assessment} />
                            </div>
                        </div>

                        <div id="pdf-vitals" className="rounded-2xl border bg-white p-8 shadow-md pdf-page">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100">
                                    <AlertTriangle className="h-7 w-7 text-yellow-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Health Vitals Analysis</h3>
                            </div>
                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                                <FormattedExplanation text={reportData.explanation?.key_factors_analysis} />
                            </div>
                        </div>

                        <div id="pdf-lifestyle" className="rounded-2xl border bg-white p-8 shadow-md pdf-page">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                                    <CheckCircle className="h-7 w-7 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Lifestyle Recommendations</h3>
                            </div>
                            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                                <FormattedExplanation text={reportData.explanation?.lifestyle_recommendations} />
                            </div>
                        </div>

                        <div id="pdf-diet" className="rounded-2xl border bg-white p-8 shadow-md pdf-page">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                                    <Utensils className="h-7 w-7 text-orange-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800">Personalized Diet Plan</h3>
                            </div>
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
                                <FormattedExplanation text={reportData.explanation?.diet_plan} />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}