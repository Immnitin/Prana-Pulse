import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, Send, User, Heart, Droplet, ChevronDown, ChevronUp,
  Bot, Copy, CheckCheck, RotateCcw, Trash2, MapPin, Activity, Brain,
  Stethoscope, Pill, ChevronLeft
} from 'lucide-react';
import { auth, db } from '../firebase-config'; // Ensure this path is correct for your project
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

// --- Reusable UI Components for NewAssessmentPage ---
const MessageBubble = ({ msg }) => {
  const isBot = msg.type === 'bot';
  return (
    <div className={`flex items-end gap-3 w-full ${isBot ? 'justify-start' : 'justify-end'} animate-popIn`}>
      {isBot && <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><HeartPulse className="h-5 w-5" /></div>}
      <div className={`max-w-lg px-5 py-3 rounded-2xl shadow-md ${isBot ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none'}`}>
        <div className="text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-indigo-800">$1</strong>').replace(/\n/g, '<br />') }} />
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

const AssessmentSelector = ({ msg, onSelect }) => (
  <div className="w-full max-w-lg ml-14 mt-[-0.5rem] mb-2">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slideInUp">
      <button disabled={msg.isAnswered} onClick={() => onSelect('heart', '❤️ Heart Disease')} className="group flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-all duration-200 transform hover:scale-[1.03] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
        <Heart className="h-6 w-6 text-red-500" />
        <span className="text-md font-semibold text-red-800">Heart Disease</span>
      </button>
      <button disabled={msg.isAnswered} onClick={() => onSelect('diabetes', '🩸 Diabetes')} className="group flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-[1.03] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
        <Droplet className="h-6 w-6 text-blue-500" />
        <span className="text-md font-semibold text-blue-800">Diabetes</span>
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

  // --- Data Definitions with Guidelines ---
  const heartDiseaseQuestions = [
    { id: 'age', text: "To start, how old are you?", type: 'number', apiField: 'age' },
    { id: 'sex', text: "What is your biological sex?", type: 'select', options: ['Male', 'Female'], apiField: 'sex', transform: (val) => val === 'Male' ? 1 : 0 },
    { id: 'chest_pain', text: "Have you experienced chest pain? If so, what type best describes it?", type: 'select', options: ['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'], apiField: 'cp', transform: (val) => ({ 'Typical Angina': 0, 'Atypical Angina': 1, 'Non-anginal Pain': 2, 'Asymptomatic': 3 }[val]) },
    { id: 'resting_bp', text: "Great. Now, what's your resting systolic blood pressure (the top number) in mm Hg?", type: 'number', apiField: 'trestbps', guideline: { content: `For context, here are the general blood pressure ranges:<br/><br/><table class="info-table"><thead><tr><th class="info-table-th">Category</th><th class="info-table-th">Systolic (mm Hg)</th></tr></thead><tbody><tr><td class="info-table-td">Normal</td><td class="info-table-td">Less than 120</td></tr><tr><td class="info-table-td">Elevated</td><td class="info-table-td">120-129</td></tr><tr><td class="info-table-td">High (Hypertension)</td><td class="info-table-td">130 or higher</td></tr></tbody></table>` } },
    { id: 'cholesterol', text: "Thank you. Could you provide your total cholesterol level in mg/dl?", type: 'number', apiField: 'chol', guideline: { content: `Here are the general cholesterol guidelines:<br/><br/><table class="info-table"><thead><tr><th class="info-table-th">Category</th><th class="info-table-th">Total Cholesterol (mg/dL)</th></tr></thead><tbody><tr><td class="info-table-td">Desirable</td><td class="info-table-td">Less than 200</td></tr><tr><td class="info-table-td">Borderline High</td><td class="info-table-td">200-239</td></tr><tr><td class="info-table-td">High</td><td class="info-table-td">240 or higher</td></tr></tbody></table>` } },
    { id: 'fasting_sugar', text: "Is your fasting blood sugar over 120 mg/dl?", type: 'select', options: ['Yes', 'No'], apiField: 'fbs', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'rest_ecg', text: "What were your resting ECG results?", type: 'select', options: ['Normal', 'ST-T abnormality', 'LV hypertrophy'], apiField: 'restecg', transform: (val) => ({ 'Normal': 0, 'ST-T abnormality': 1, 'LV hypertrophy': 2 }[val]) },
    { id: 'max_heart_rate', text: "What's the maximum heart rate you've achieved during exercise?", type: 'number', apiField: 'thalach' },
    { id: 'exercise_angina', text: "Do you get angina (chest pain) during exercise?", type: 'select', options: ['Yes', 'No'], apiField: 'exang', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'st_depression', text: "What is your ST depression induced by exercise?", type: 'number', apiField: 'oldpeak' },
    { id: 'st_slope', text: "What is the slope of your peak exercise ST segment?", type: 'select', options: ['Upsloping', 'Flat', 'Downsloping'], apiField: 'slope', transform: (val) => ({ 'Upsloping': 0, 'Flat': 1, 'Downsloping': 2 }[val]) },
    { id: 'vessels', text: "How many major vessels (0-4) were colored by fluoroscopy?", type: 'number', apiField: 'ca' },
    { id: 'thalassemia', text: "Finally, what was your thalassemia stress test result?", type: 'select', options: ['Normal', 'Fixed Defect', 'Reversible Defect'], apiField: 'thal', transform: (val) => ({ 'Normal': 1, 'Fixed Defect': 2, 'Reversible Defect': 3 }[val]) }
  ];
  const diabetesQuestions = [
    { id: 'gender', text: "To start, what is your gender?", type: 'select', options: ['Male', 'Female', 'Other'], apiField: 'gender' },
    { id: 'age', text: "And how old are you?", type: 'number', apiField: 'age' },
    { id: 'hypertension', text: "Have you ever been diagnosed with hypertension (high blood pressure)?", type: 'select', options: ['Yes', 'No'], apiField: 'hypertension', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'heart_disease', text: "Got it. Do you have a history of heart disease?", type: 'select', options: ['Yes', 'No'], apiField: 'heart_disease', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'smoking', text: "What's your smoking history?", type: 'select', options: ['never', 'former', 'current', 'not current', 'ever', 'No Info'], apiField: 'smoking_history' },
    { id: 'bmi', text: "Thanks. What is your Body Mass Index (BMI)?", type: 'number', apiField: 'bmi', guideline: { content: `BMI is a measure of body fat. Here's a standard chart to help:<br/><br/><table class="info-table"><thead><tr><th class="info-table-th">Category</th><th class="info-table-th">BMI Range</th></tr></thead><tbody><tr><td class="info-table-td">Underweight</td><td class="info-table-td">&lt; 18.5</td></tr><tr><td class="info-table-td">Normal</td><td class="info-table-td">18.5 – 24.9</td></tr><tr><td class="info-table-td">Overweight</td><td class="info-table-td">25.0 – 29.9</td></tr><tr><td class="info-table-td">Obesity</td><td class="info-table-td">≥ 30.0</td></tr></tbody></table>` } },
    { id: 'hba1c', text: "Almost there. What is your most recent HbA1c level?", type: 'number', apiField: 'HbA1c_level', guideline: { content: `HbA1c levels indicate your average blood sugar over the past 2-3 months.<br/><br/><table class="info-table"><thead><tr><th class="info-table-th">Category</th><th class="info-table-th">HbA1c Level</th></tr></thead><tbody><tr><td class="info-table-td">Normal</td><td class="info-table-td">Below 5.7%</td></tr><tr><td class="info-table-td">Prediabetes</td><td class="info-table-td">5.7% to 6.4%</td></tr><tr><td class="info-table-td">Diabetes</td><td class="info-table-td">6.5% or higher</td></tr></tbody></table>` } },
    { id: 'glucose', text: "Finally, what is your current blood glucose level in mg/dl?", type: 'number', apiField: 'blood_glucose_level' }
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
  const addMessage = (type, text, options = []) => new Promise(resolve => {
    const delay = type === 'bot' ? Math.min(Math.max(text.length * 15, 400), 1000) : 0;
    if (type === 'bot') setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { type, text, options, isAnswered: false, id: Date.now() }]);
      if (type === 'bot') setIsTyping(false);
      resolve();
    }, delay);
  });

  const startConversation = (name) => {
    addMessage('bot', `Hello **${name}**! I'm here to help you with a preliminary health risk assessment.`).then(() =>
      addMessage('bot', 'Which assessment would you like to perform today?')
    ).then(() => {
      setMessages(prev => [...prev, { type: 'assessment-selection', isAnswered: false, id: Date.now() }]);
    });
  };

  const handleSelectAssessment = async (type, label) => {
    setMessages(prev => prev.map(m => m.type === 'assessment-selection' ? { ...m, isAnswered: true } : m));
    await addMessage('user', label);
    await addMessage('bot', `Great choice. Let's begin the ${type === 'heart' ? 'Heart Disease' : 'Diabetes'} assessment.`);
    setAssessmentType(type);
    await askNextQuestion(type, 0);
  };

  const handleQuickReply = async (reply) => {
    setMessages(prev => prev.map(m => (m.type === 'question-options' && !m.isAnswered) ? { ...m, isAnswered: true } : m));
    await handleAnswer(reply);
  };

  const handleTextInput = async () => {
    if (!currentInput.trim()) return;
    await handleAnswer(currentInput);
    setCurrentInput('');
  };

  const handleAnswer = async (answer) => {
    await addMessage('user', answer);
    const questions = assessmentType === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    const q = questions[currentQuestion];
    setUserInputLog(prev => ({ ...prev, [q.apiField]: answer }));
    const value = q.transform ? q.transform(answer) : (q.type === 'number' ? parseFloat(answer) : answer);
    const updatedFormData = { ...formData, [q.apiField]: value };
    setFormData(updatedFormData);
    const nextIndex = currentQuestion + 1;
    if (nextIndex < questions.length) {
      await addMessage('bot', 'Got it.');
      await askNextQuestion(assessmentType, nextIndex);
    } else {
      setIsComplete(true);
      await generateReport(updatedFormData);
    }
  };

  const askNextQuestion = async (type, index) => {
    setCurrentQuestion(index);
    const questions = type === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    const q = questions[index];
    if (q.guideline) await addMessage('bot', q.guideline.content);
    await addMessage('bot', q.text);
    if (q.type === 'select') {
      setExpectingTextInput(false);
      setMessages(prev => [...prev, { type: 'question-options', options: q.options, isAnswered: false, id: Date.now() }]);
    } else {
      setExpectingTextInput(true);
    }
  };

  const generateReport = async (finalData) => {
    await addMessage('bot', "Perfect, that's everything I need. Analyzing your information now...");
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

      // --- Firestore Integration ---
      const user = auth.currentUser;
      if (user) {
        // 1. Save detailed report to subcollection
        const detailedReportData = {
          ...results,
          assessmentType,
          userInput: userInputLog,
          createdAt: serverTimestamp(),
          userEmail: user.email
        };
        const assessmentsColRef = collection(db, 'users', user.uid, 'assessments');
        await addDoc(assessmentsColRef, detailedReportData);

        // 2. Prepare and save summary data to main user doc for the dashboard
        const getSeverity = (score) => {
          if (score <= 0.3) return 'low';
          if (score <= 0.7) return 'medium';
          return 'high';
        }

        const summaryRecord = {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: "AI Assessment",
          value: `${(results.risk_score * 100).toFixed(1)}% Risk`,
          status: getSeverity(results.risk_score)
        };

        const userDocRef = doc(db, 'users', user.uid);
        if (assessmentType === 'diabetes') {
          await updateDoc(userDocRef, {
            diabetesRecords: arrayUnion(summaryRecord),
            latestDiabetesPrediction: {
              probability: (results.risk_score * 100).toFixed(1),
              severity: getSeverity(results.risk_score),
              timeframe: "5-7 years" // Example timeframe
            }
          });
        } else if (assessmentType === 'heart') {
          await updateDoc(userDocRef, {
            heartDiseaseRecords: arrayUnion(summaryRecord),
            latestHeartPrediction: {
              probability: (results.risk_score * 100).toFixed(1),
              severity: getSeverity(results.risk_score),
              timeframe: "8-10 years" // Example timeframe
            }
          });
        }
      }
      // --- End Firestore Integration ---

      navigate('/report', { state: { results, assessmentType, userInput: userInputLog } });
    } catch (error) {
      console.error("Failed to generate report:", error);
      await addMessage('bot', `I'm sorry, an error occurred: **${error.message}**. Please try again later.`);
      setIsTyping(false);
      setIsComplete(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-center"><HeartPulse className="h-12 w-12 text-blue-600 animate-pulse" /></div>;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col font-sans bg-grid animate-fadeIn">
      <header className="relative z-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md border-2 border-white"><HeartPulse className="h-6 w-6 text-white" /></div>
              <div>
                <h1 className="font-bold text-lg text-gray-800">Prana-Pulse</h1>
                <p className="text-gray-500 text-xs">AI Health Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">
              <User className="h-4 w-4 text-gray-600" />
              <p className="text-gray-800 text-sm font-semibold">{userName}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-[calc(100vh-65px)] overflow-hidden p-4">
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {messages.map(msg => {
              if (msg.type === 'assessment-selection') return <AssessmentSelector key={msg.id} msg={msg} onSelect={handleSelectAssessment} />;
              if (msg.type === 'question-options') return <QuickReplyGroup key={msg.id} msg={msg} onReply={handleQuickReply} />;
              return <MessageBubble key={msg.id} msg={msg} />;
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          {!isComplete && (
            <div className="mt-auto pt-2 z-10">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-2">
                <div className="flex gap-2 items-center">
                  <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTextInput()} placeholder={expectingTextInput ? "Type your answer here..." : "Please select an option above"} className="w-full px-4 py-3 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-800 placeholder-gray-500 text-sm transition-all disabled:bg-gray-200" disabled={!expectingTextInput || isTyping} />
                  <button onClick={handleTextInput} disabled={!expectingTextInput || isTyping} className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-sm flex items-center gap-2 font-semibold text-sm">
                    <Send className="h-4 w-4" /><span>Send</span>
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
        .info-table { width: 100%; text-align: left; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.8rem; }
        .info-table-th, .info-table-td { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; }
        .info-table-th { background-color: #f3f4f6; font-weight: 600; color: #374151; }
      `}</style>
    </div>
  );
}

// --- Helper Components for AskPranaPulse ---

const HeartPulseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.7-1.5L11.5 14l1.5-3 1.5 3h5.27" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

// --- Main Chat Component: AskPranaPulse ---

export function AskPranaPulse() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Location-based features
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [nearbyCenters, setNearbyCenters] = useState([]);

  const messagesEndRef = useRef(null);

  // --- Data ---
  const healthQueries = [
    { icon: Heart, text: "Heart health checkup", category: "cardiology" },
    { icon: Activity, text: "Diabetes management", category: "endocrinology" },
    { icon: Brain, text: "Mental wellness", category: "psychology" },
    { icon: Stethoscope, text: "General health screening", category: "general" },
    { icon: Pill, text: "Medication guidance", category: "pharmacy" }
  ];

  // Dynamic nearby centers for Hyderabad/Secunderabad area
  const allNearbyCenters = [
    { name: "Apollo Hospitals, Jubilee Hills", type: 'general', condition: ['heart', 'diabetes'], dist: "8.5 km" },
    { name: "Yashoda Hospitals, Secunderabad", type: 'general', condition: ['heart', 'diabetes'], dist: "2.1 km" },
    { name: "KIMS Hospitals, Secunderabad", type: 'general', condition: ['heart', 'diabetes'], dist: "3.5 km" },
    { name: "Care Hospitals, Banjara Hills", type: 'general', condition: ['heart', 'diabetes'], dist: "7.0 km" },
    { name: "Asian Institute of Gastroenterology", type: 'specialty', condition: [], dist: "10.2 km" },
    { name: "LV Prasad Eye Institute", type: 'specialty', condition: [], dist: "8.1 km" },
    { name: "Fernandez Hospital", type: 'specialty', condition: [], dist: "6.5 km" },
    { name: "Dr. Mohan's Diabetes Specialities Centre", type: 'specialty', condition: ['diabetes'], dist: "5.8 km" },
    { name: "CARE Hospitals - Institute of Heart Sciences", type: 'specialty', condition: ['heart'], dist: "7.2 km" },
  ];

  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    getUserLocation();

    setTimeout(() => setIsPageLoaded(true), 500);

    // Initial greeting message with typing effect
    const greeting = `👋 **Welcome to Prana-Pulse AI!**\n\nI'm your personal health and wellness companion. How can I help you on your wellness journey today?`;
    streamResponse(greeting, Date.now());
  }, []);

  // --- Core Functions ---

  const streamResponse = (text, messageId) => {
    const words = text.split(' ');
    let currentText = '';

    // Add a placeholder message first
    setMessages(prev => [...prev.filter(m => m.id !== messageId), { id: messageId, type: 'bot', content: '', timestamp: new Date(), isTyping: true }]);

    const typeWriter = setInterval(() => {
      if (words.length > 0) {
        currentText += (currentText ? ' ' : '') + words.shift();
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, content: currentText } : msg
        ));
      } else {
        clearInterval(typeWriter);
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, isTyping: false } : msg
        ));
      }
    }, 60); // Typing speed
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

    try {
      const systemPrompt = `You are Prana-Pulse AI, an expert health and wellness assistant. Provide comprehensive, well-structured, and empathetic health information. Use markdown for formatting: ## for headings, - for lists, **bold** for key terms. Include relevant emojis. Always conclude with a reminder to consult a healthcare professional.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content.replace(/<[^>]*>/g, '')
            })),
            { role: "user", content: messageText }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const botContent = data.choices[0].message.content;

      setIsLoading(false);
      streamResponse(botContent, Date.now() + 1);

    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = `## ⚠️ Connection Issue\n\nI'm having trouble connecting right now. Please check your network or try again in a moment. If the problem persists, ensure the API key is correctly configured.`;
      setIsLoading(false);
      streamResponse(errorMessage, Date.now() + 1);
    }
  };

  const regenerateResponse = () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
    if (!lastUserMessage) return;

    // Remove last bot response
    setMessages(prev => {
      const lastBotMsgIndex = prev.map(m => m.type).lastIndexOf('bot');
      if (lastBotMsgIndex > -1) {
        return prev.slice(0, lastBotMsgIndex);
      }
      return prev;
    });

    setTimeout(() => sendMessage(lastUserMessage.content), 100);
  };

  // --- UI Handlers ---

  const handleQuickQuery = (query) => {
    setInputMessage(query);
    setTimeout(() => sendMessage(query), 100);
  };

  const showNearbyTreatmentCenters = (condition) => {
    setSelectedCondition(condition);
    const filteredCenters = allNearbyCenters.filter(center => center.condition.includes(condition));
    setNearbyCenters(filteredCenters);
    setShowLocationModal(true);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, city: 'Your Location' }),
        () => setUserLocation({ latitude: 17.4399, longitude: 78.4983, city: 'Secunderabad' }) // Fallback to Secunderabad
      );
    }
  };

  // --- Utility Functions ---

  const formatMessage = (text) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-200 p-3 rounded-lg my-2 overflow-x-auto"><code class="text-sm">$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-3 mb-2 text-blue-700">$1</h2>')
      .replace(/^\- (.*$)/gim, '<li class="ml-5 list-disc my-1 text-gray-700">$1</li>')
      .replace(/\n/g, '<br />');
  };

  const copyToClipboard = (text, messageId) => {
    const plainText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plainText).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // --- Render Logic ---

  if (!isPageLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl mx-auto animate-bounce">
              <HeartPulseIcon size={36} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Prana-Pulse AI</h1>
          <p className="text-gray-600">Initializing your intelligent health companion...</p>
          <LoadingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 font-sans">

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" title="Back to Dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} className="text-gray-600" />
            </a>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <HeartPulseIcon size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Prana-Pulse AI</h1>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => showNearbyTreatmentCenters('diabetes')} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-1.5 transition-all">
              <Activity size={14} /> Diabetes Centers
            </button>
            <button onClick={() => showNearbyTreatmentCenters('heart')} className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-1.5 transition-all">
              <Heart size={14} /> Heart Centers
            </button>
            <button onClick={regenerateResponse} className="p-2 rounded-lg hover:bg-gray-100" title="Regenerate Response" disabled={isLoading}><RotateCcw size={16} className="text-gray-500" /></button>
            <button onClick={() => setMessages([])} className="p-2 rounded-lg hover:bg-gray-100" title="New Chat"><Trash2 size={16} className="text-gray-500" /></button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message) => (
            <div key={message.id} className={`group flex items-start gap-3 ${message.type === 'user' && 'flex-row-reverse'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white'}`}>
                {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex-1 max-w-2xl ${message.type === 'user' && 'text-right'}`}>
                <div className={`inline-block px-5 py-3 rounded-2xl transition-shadow hover:shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-lg'}`}>
                  <div className="leading-relaxed text-left" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  {message.isTyping && <LoadingDots />}
                </div>
                <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-400">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button onClick={() => copyToClipboard(message.content, message.id)} className="p-1.5 rounded-md hover:bg-gray-200" title="Copy">
                    {copiedMessageId === message.id ? <CheckCheck size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 bg-indigo-500 text-white shadow-md"><Bot size={16} /></div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-lg px-5 py-3 shadow-sm"><LoadingDots /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {healthQueries.map((query, index) => (
                <button key={index} onClick={() => handleQuickQuery(query.text)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-xs text-gray-700 hover:text-blue-600 transition-all">
                  <query.icon size={14} /> {query.text}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask a health question..."
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none bg-white transition-all text-sm"
              rows="1"
            />
            <button onClick={() => sendMessage()} disabled={!inputMessage.trim() || isLoading} className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <Spinner /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-in fade-in-25">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800 capitalize">{selectedCondition} Centers Near {userLocation?.city}</h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {nearbyCenters.length > 0 ? nearbyCenters.map(center => (
                <div key={center.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800">{center.name}</h4>
                  <p className="text-sm text-gray-500">Approx. {center.dist} away</p>
                </div>
              )) : <p className="text-gray-600 p-4 text-center">No specific {selectedCondition} centers found in the immediate list. Try a general hospital.</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLocationModal(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all">Close</button>
              <button onClick={() => { setShowLocationModal(false); handleQuickQuery(`Find best ${selectedCondition} centers near ${userLocation?.city}`); }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">Ask for Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}