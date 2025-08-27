import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Send, User, Heart, Droplet, ArrowLeft, FileText, RefreshCw, HelpCircle } from 'lucide-react';
import { auth, db } from '../firebase-config'; // Ensure this path is correct for your project
import { doc, getDoc, collection, addDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

// --- Reusable UI Components ---

const MessageBubble = ({ msg }) => {
    const isBot = msg.type === 'bot';
    return (
        <div className={`flex items-end gap-3 w-full ${isBot ? 'justify-start' : 'justify-end'} animate-popIn`}>
            {isBot && <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><HeartPulse className="h-5 w-5" /></div>}
            <div className={`max-w-lg px-5 py-3 rounded-2xl shadow-md ${isBot ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none'}`}>
                <div className="text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
            </div>
            {!isBot && <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-gradient-to-br from-green-500 to-emerald-600 text-white"><User className="h-5 w-5" /></div>}
        </div>
    );
};

const QuickReplyGroup = ({ msg, onReply }) => (
    <div className="w-full max-w-lg ml-14 mt-[-0.5rem] mb-2">
        <div className="flex flex-wrap gap-2 animate-slideInUp">
            {msg.options.map((opt) => (
                <button key={opt} onClick={() => onReply(opt)} disabled={msg.isAnswered} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gray-100 border border-gray-200 text-gray-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105">
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const QuickReplyTable = ({ msg, onSelect }) => {
    const { headers, rows } = msg.tableOptions;
    return (
        <div className="w-full max-w-lg ml-14 mt-[-0.5rem] mb-2 animate-slideInUp">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} onClick={() => !msg.isAnswered && onSelect(row[0])} className={`border-b hover:bg-blue-50 transition-colors duration-200 ${msg.isAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className={`px-6 py-4 ${cellIndex === 0 ? 'font-medium text-gray-900' : ''}`}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AssessmentSelector = ({ msg, onSelect }) => (
    <div className="w-full max-w-lg ml-14 mt-[-0.5rem] mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slideInUp">
            <button disabled={msg.isAnswered} onClick={() => onSelect('heart', '❤️ Heart Disease')} className="group flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-all duration-200 transform hover:scale-[1.03] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Heart className="h-6 w-6 text-red-500" /><span className="text-md font-semibold text-red-800">Heart Disease</span>
            </button>
            <button disabled={msg.isAnswered} onClick={() => onSelect('diabetes', '🩸 Diabetes')} className="group flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-[1.03] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Droplet className="h-6 w-6 text-blue-500" /><span className="text-md font-semibold text-blue-800">Diabetes</span>
            </button>
        </div>
    </div>
);

const TypingIndicator = () => (
    <div className="flex items-end gap-3 animate-popIn">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><HeartPulse className="h-5 w-5" /></div>
        <div className="bg-white px-5 py-4 rounded-2xl shadow-md border border-gray-200 rounded-bl-none">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-short"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-short animation-delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-short animation-delay-300"></div>
            </div>
        </div>
    </div>
);

const FinalActions = ({ onNavigateToReport, onRestart }) => (
    <div className="w-full max-w-lg ml-14 mt-[-0.5rem] mb-2">
        <div className="flex flex-wrap gap-3 animate-slideInUp">
            <button onClick={onNavigateToReport} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-sm">
                <FileText className="h-4 w-4" /> View Full Report
            </button>
            <button onClick={onRestart} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700 transform hover:scale-105 shadow-sm">
                <RefreshCw className="h-4 w-4" /> Start New Assessment
            </button>
        </div>
    </div>
);

// --- Data Cleaning Helper Functions ---
const sanitizeTextForDB = (text) => {
    if (typeof text !== 'string' || !text) return text;
    return text.replace(/\*\*/g, '').trim();
};

const getCleanedExplanation = (explanationObject) => {
    if (typeof explanationObject !== 'object' || explanationObject === null) return explanationObject;
    const cleanedExplanation = {};
    for (const key in explanationObject) {
        if (Object.prototype.hasOwnProperty.call(explanationObject, key)) {
            cleanedExplanation[key] = sanitizeTextForDB(explanationObject[key]);
        }
    }
    return cleanedExplanation;
};


export function NewAssessmentPage() {
    // --- State and Refs ---
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [currentInput, setCurrentInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(-1);
    const [assessmentType, setAssessmentType] = useState(null);
    const [formData, setFormData] = useState({});
    const [userInputLog, setUserInputLog] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [expectingTextInput, setExpectingTextInput] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const conversationStarted = useRef(false);

    // --- Data Definitions with Table Options ---
    const heartDiseaseQuestions = [
        { id: 'age', text: "To start, how old are you?", type: 'number', apiField: 'age', validation: { min: 18, max: 100 } },
        { id: 'sex', text: "What is your biological sex?", type: 'select', options: ['Male', 'Female'], apiField: 'sex', transform: (val) => val === 'Male' ? 1 : 0 },
        { 
            id: 'chest_pain', 
            text: "Have you experienced chest pain? If so, please select the type that best describes it from the table below.", 
            type: 'table', 
            apiField: 'cp', 
            transform: (val) => ({ 'Typical Angina': 0, 'Atypical Angina': 1, 'Non-anginal Pain': 2, 'Asymptomatic': 3 }[val]),
            tableOptions: {
                headers: ['Type', 'Description'],
                rows: [
                    ['Typical Angina', 'Chest pain related to heart stress'],
                    ['Atypical Angina', 'Chest pain not typical for heart issues'],
                    ['Non-anginal Pain', 'Chest pain not related to the heart'],
                    ['Asymptomatic', 'No chest pain experienced']
                ]
            }
        },
        { id: 'resting_bp', text: "Great. Now, what's your resting systolic blood pressure (the top number) in mm Hg?", type: 'number', apiField: 'trestbps', validation: { min: 90, max: 200 } },
        { id: 'cholesterol', text: "Thank you. Could you provide your total cholesterol level in mg/dl?", type: 'number', apiField: 'chol', validation: { min: 100, max: 600 } },
        { id: 'fasting_sugar', text: "Is your fasting blood sugar over 120 mg/dl?", type: 'select', options: ['Yes', 'No'], apiField: 'fbs', transform: (val) => val === 'Yes' ? 1 : 0 },
        { id: 'rest_ecg', text: "What were your resting ECG results?", type: 'select', options: ['Normal', 'ST-T abnormality', 'LV hypertrophy'], apiField: 'restecg', transform: (val) => ({ 'Normal': 0, 'ST-T abnormality': 1, 'LV hypertrophy': 2 }[val]) },
        { id: 'max_heart_rate', text: "What's the maximum heart rate you've achieved during exercise?", type: 'number', apiField: 'thalach', validation: { min: 60, max: 220 } },
        { id: 'exercise_angina', text: "Do you get angina (chest pain) during exercise?", type: 'select', options: ['Yes', 'No'], apiField: 'exang', transform: (val) => val === 'Yes' ? 1 : 0 },
        { id: 'st_depression', text: "What is your ST depression induced by exercise?", type: 'number', apiField: 'oldpeak', validation: { min: 0, max: 7 } },
        { id: 'st_slope', text: "What is the slope of your peak exercise ST segment?", type: 'select', options: ['Upsloping', 'Flat', 'Downsloping'], apiField: 'slope', transform: (val) => ({ 'Upsloping': 0, 'Flat': 1, 'Downsloping': 2 }[val]) },
        { id: 'vessels', text: "How many major vessels (0-4) were colored by fluoroscopy?", type: 'number', apiField: 'ca', validation: { min: 0, max: 4 } },
        { id: 'thalassemia', text: "Finally, what was your thalassemia stress test result?", type: 'select', options: ['Normal', 'Fixed Defect', 'Reversible Defect'], apiField: 'thal', transform: (val) => ({ 'Normal': 1, 'Fixed Defect': 2, 'Reversible Defect': 3 }[val]) }
    ];
    const diabetesQuestions = [
        { id: 'gender', text: "To start, what is your gender?", type: 'select', options: ['Male', 'Female', 'Other'], apiField: 'gender' },
        { id: 'age', text: "And how old are you?", type: 'number', apiField: 'age', validation: { min: 1, max: 100 } },
        { id: 'hypertension', text: "Have you ever been diagnosed with hypertension (high blood pressure)?", type: 'select', options: ['Yes', 'No'], apiField: 'hypertension', transform: (val) => val === 'Yes' ? 1 : 0 },
        { id: 'heart_disease', text: "Got it. Do you have a history of heart disease?", type: 'select', options: ['Yes', 'No'], apiField: 'heart_disease', transform: (val) => val === 'Yes' ? 1 : 0 },
        { 
            id: 'smoking', 
            text: "What's your smoking history? Please choose the option that best fits.", 
            type: 'table', 
            apiField: 'smoking_history',
            tableOptions: {
                headers: ['Status', 'Description'],
                rows: [
                    ['never', 'I have never smoked.'],
                    ['former', 'I used to smoke but have quit.'],
                    ['current', 'I currently smoke.'],
                    ['not current', 'I smoke occasionally, but not daily.'],
                    ['ever', 'I have smoked at some point in my life.'],
                    ['No Info', 'I prefer not to say.']
                ]
            }
        },
        { id: 'bmi', text: "Thanks. What is your Body Mass Index (BMI)? You can use an online calculator if you're unsure.", type: 'number', apiField: 'bmi', validation: { min: 10, max: 70 } },
        { id: 'hba1c', text: "Almost there. What is your most recent HbA1c level?", type: 'number', apiField: 'HbA1c_level', validation: { min: 3, max: 15 } },
        { id: 'glucose', text: "Finally, what is your current blood glucose level in mg/dl?", type: 'number', apiField: 'blood_glucose_level', validation: { min: 80, max: 300 } }
    ];

    // --- Effects ---
    useEffect(() => {
        const initializeChat = async () => {
            if (conversationStarted.current) return;
            conversationStarted.current = true;
            const user = auth.currentUser;
            if (!user) { navigate('/login'); return; }
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const name = userDoc.exists() ? userDoc.data().name : "User";
            setUserName(name);
            setIsLoading(false);
            startConversation(name);
        };
        initializeChat();
    }, [navigate]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, isTyping]);
    
    // --- Core Logic ---
    const addMessage = (type, text) => new Promise(resolve => {
        const delay = type === 'bot' ? Math.min(Math.max(text.length * 15, 400), 1000) : 0;
        if (type === 'bot') setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { type, text, isAnswered: false, id: Date.now() }]);
            if (type === 'bot') setIsTyping(false);
            resolve();
        }, delay);
    });

    const startConversation = (name) => {
        addMessage('bot', `Hello <strong>${name}</strong>! I'm here to help you with a preliminary health risk assessment.`).then(() =>
            addMessage('bot', 'Which assessment would you like to perform today?')
        ).then(() => {
            setMessages(prev => [...prev, { type: 'assessment-selection', id: Date.now() }]);
        });
    };

    const handleSelectAssessment = async (type, label) => {
        setMessages(prev => prev.map(m => m.type === 'assessment-selection' ? { ...m, isAnswered: true } : m));
        await addMessage('user', label);
        const assessmentName = type === 'heart' ? 'Heart Disease' : 'Diabetes';
        await addMessage('bot', `Great choice. Let's begin the <strong>${assessmentName}</strong> assessment.`);
        setAssessmentType(type);
        await askNextQuestion(type, 0);
    };

    const handleQuickReply = async (reply) => {
        setMessages(prev => prev.map(m => (m.type === 'question-options' && !m.isAnswered) ? { ...m, isAnswered: true } : m));
        await handleAnswer(reply);
    };

    const handleTableSelect = async (selection) => {
        setMessages(prev => prev.map(m => (m.type === 'question-table' && !m.isAnswered) ? { ...m, isAnswered: true } : m));
        await handleAnswer(selection);
    };

    const handleTextInput = async () => {
        if (!currentInput.trim()) return;
        const valueToSubmit = currentInput;
        setCurrentInput('');
        await handleAnswer(valueToSubmit);
    };
    
    const handleAnswer = async (answer) => {
        const questions = assessmentType === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
        const q = questions[currentQuestion];
        
        await addMessage('user', answer);

        if (q.type === 'number') {
            const numValue = parseFloat(answer);
            const { validation } = q;
            if (isNaN(numValue)) {
                await addMessage('bot', "Sorry, that doesn't look like a valid number. Could you please try again?");
                await askNextQuestion(assessmentType, currentQuestion);
                return;
            }
            if (validation && (numValue < validation.min || numValue > validation.max)) {
                await addMessage('bot', `Please provide a value between <strong>${validation.min}</strong> and <strong>${validation.max}</strong>. Let's try that again.`);
                await askNextQuestion(assessmentType, currentQuestion);
                return;
            }
        }
        
        setUserInputLog(prev => ({ ...prev, [q.apiField]: answer }));
        const value = q.transform ? q.transform(answer) : (q.type === 'number' ? parseFloat(answer) : answer);
        const updatedFormData = { ...formData, [q.apiField]: value };
        setFormData(updatedFormData);

        const nextIndex = currentQuestion + 1;
        if (nextIndex < questions.length) {
            await askNextQuestion(assessmentType, nextIndex);
        } else {
            setIsComplete(true);
            setExpectingTextInput(false);
            await generateReport(updatedFormData);
        }
    };
    
    const askNextQuestion = async (type, index) => {
        setCurrentQuestion(index);
        const questions = type === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
        const q = questions[index];
        await addMessage('bot', q.text);

        if (q.type === 'select') {
            setExpectingTextInput(false);
            setMessages(prev => [...prev, { type: 'question-options', options: q.options, id: Date.now() }]);
        } else if (q.type === 'table') {
            setExpectingTextInput(false);
            setMessages(prev => [...prev, { type: 'question-table', tableOptions: q.tableOptions, id: Date.now() }]);
        } else {
            setExpectingTextInput(true);
        }
    };

    const getSeverity = (score) => {
        if (score <= 0.3) return 'Low Risk';
        if (score <= 0.7) return 'Medium Risk';
        return 'High Risk';
    };

    const formatReportMessage = (results, type) => {
        const riskScore = (results.risk_score * 100).toFixed(1);
        const severity = getSeverity(results.risk_score);
        const conditionName = type === 'heart' ? 'Heart Disease' : 'Diabetes';
        let message = `<h3 class="font-bold text-lg mb-2">Assessment Complete: ${conditionName}</h3>`;
        message += `<p class="mb-1">Based on your info, here is your preliminary risk analysis:</p>`;
        message += `<p class="mb-1"><strong>AI-Predicted Risk Score:</strong> <span class="text-2xl font-bold text-blue-600">${riskScore}%</span></p>`;
        message += `<p class="mb-3"><strong>Interpretation:</strong> This corresponds to a <strong>${severity}</strong> level.</p>`;
        message += `<hr class="my-3 border-gray-300" />`;
        message += `<p class="text-xs text-gray-500"><strong>Disclaimer:</strong> This is not a medical diagnosis. Please consult with a healthcare professional for guidance.</p>`;
        return message;
    };

    const generateReport = async (finalData) => {
        await addMessage('bot', "Perfect, that's everything I need. Analyzing your information... This can take up to a minute, please wait.");
        setIsTyping(true);

        try {
            const apiUrl = assessmentType === 'heart' ? 'https://prana-pulse-api.onrender.com/predict/heart' : 'https://prana-pulse-api.onrender.com/predict/diabetes';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API Error: ${response.statusText}`);
            }

            const results = await response.json();

            const cleanedExplanation = getCleanedExplanation(results.explanation);
            const dataToStore = {
                ...results,
                explanation: cleanedExplanation,
                assessmentType,
                userInput: userInputLog,
                createdAt: serverTimestamp(),
                userId: auth.currentUser?.uid,
            };

            let newAssessmentId = null;
            const user = auth.currentUser;
            if (user) {
                const userAssessmentsRef = collection(db, 'users', user.uid, 'assessments');
                const newDocRef = await addDoc(userAssessmentsRef, dataToStore);
                newAssessmentId = newDocRef.id;

                const topLevelDocRef = doc(db, 'assessments', newAssessmentId);
                await setDoc(topLevelDocRef, dataToStore);

                const summaryRecord = {
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    type: "AI Assessment",
                    value: `${(results.risk_score * 100).toFixed(1)}% Risk`,
                    status: getSeverity(results.risk_score).split(' ')[0].toLowerCase()
                };
                const userDocRef = doc(db, 'users', user.uid);
                const updatePayload = assessmentType === 'diabetes'
                    ? { diabetesRecords: arrayUnion(summaryRecord), latestDiabetesPrediction: { probability: (results.risk_score * 100).toFixed(1), severity: summaryRecord.status } }
                    : { heartDiseaseRecords: arrayUnion(summaryRecord), latestHeartPrediction: { probability: (results.risk_score * 100).toFixed(1), severity: summaryRecord.status } };
                await updateDoc(userDocRef, updatePayload);
            }
            
            setIsTyping(false);

            const reportMessage = formatReportMessage(results, assessmentType);
            await addMessage('bot', reportMessage);

            setMessages(prev => [...prev, {
                type: 'final-actions',
                id: Date.now(),
                reportData: {
                    results,
                    assessmentType,
                    userInput: userInputLog,
                    assessmentId: newAssessmentId
                }
            }]);

        } catch (error) {
            console.error("Failed to generate report:", error);
            setIsTyping(false);
            await addMessage('bot', `I'm sorry, an error occurred: <strong>${error.message}</strong>. Please try again later.`);
            setIsComplete(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-center"><HeartPulse className="h-12 w-12 text-blue-600 animate-pulse" /></div>;
    }

    return (
        <div className="h-screen bg-gray-100 flex flex-col font-sans bg-grid animate-fadeIn">
            <header className="relative z-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100" aria-label="Go to Dashboard">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md"><HeartPulse className="h-5 w-5 text-white" /></div>
                            <div>
                                <h1 className="font-bold text-gray-800">AI Health Assessment</h1>
                                <p className="text-gray-500 text-xs">A conversation with Prana-Pulse</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-lg">
                            <User className="h-4 w-4 text-gray-600" />
                            <p className="text-gray-800 text-sm font-semibold">{userName}</p>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-[calc(100vh-77px)] overflow-hidden p-4">
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                        {messages.map(msg => {
                            if (msg.type === 'assessment-selection') return <AssessmentSelector key={msg.id} msg={msg} onSelect={handleSelectAssessment} />;
                            if (msg.type === 'question-options') return <QuickReplyGroup key={msg.id} msg={msg} onReply={handleQuickReply} />;
                            if (msg.type === 'question-table') return <QuickReplyTable key={msg.id} msg={msg} onSelect={handleTableSelect} />;
                            if (msg.type === 'final-actions') return <FinalActions key={msg.id} onNavigateToReport={() => navigate('/report', { state: msg.reportData })} onRestart={() => window.location.reload()} />;
                            return <MessageBubble key={msg.id} msg={msg} />;
                        })}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                    {!isComplete && (
                        <div className="mt-auto pt-2 z-10">
                            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80 p-2">
                                <div className="flex gap-2 items-center">
                                    <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTextInput()} placeholder={expectingTextInput ? "Type your answer here..." : "Please select an option above"} className="w-full px-4 py-3 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-800 placeholder-gray-500 text-sm transition-all disabled:bg-gray-200" disabled={!expectingTextInput || isTyping} />
                                    <button onClick={handleTextInput} disabled={!expectingTextInput || isTyping || !currentInput.trim()} className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-sm flex items-center gap-2 font-semibold text-sm"><Send className="h-4 w-4" /><span>Send</span></button>
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                                        <RefreshCw className="h-3 w-3" /> Restart
                                    </button>
                                    <button onClick={() => addMessage('bot', "I am Prana-Pulse, an AI assistant designed to help you with preliminary health risk assessments. How can I assist you today?")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                                        <HelpCircle className="h-3 w-3" /> Help
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <style>{`
                .scrollbar-hide { scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .bg-grid { background-color: #f3f4f6; background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px); background-size: 2rem 2rem; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.8s ease-in-out forwards; }
                @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .animate-popIn { animation: popIn 0.4s ease-out forwards; }
                @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideInUp { animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
                @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                .animate-bounce-short { animation: bounce-short 1.2s infinite ease-in-out; }
                .animation-delay-150 { animation-delay: 0.15s; }
                .animation-delay-300 { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
}
