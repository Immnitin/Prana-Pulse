import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Download, Mail, ArrowLeft, Send, Bot, User, Sparkles, Activity, Shield, AlertTriangle, CheckCircle, Heart, Droplet, X, RefreshCw, ChevronDown, Table, TestTube, Clock, Star, Zap, Brain, Flame } from 'lucide-react';
// FIREBASE: Import your firebase config and services
import { auth, db } from '../firebase-config'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const MessageBubble = ({ message }) => {
  const isBot = message.type === 'bot';
  return (
    <div
      className={`flex gap-4 ${!isBot ? 'flex-row-reverse' : ''} animate-fadeInUp`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border-2 ${
          isBot
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-200'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-200'
        }`}
      >
        {isBot ? <span className="text-lg">{message.icon || '🤖'}</span> : <User className="h-6 w-6" />}
      </div>
      <div
        className={`max-w-xl px-6 py-4 rounded-2xl shadow-sm border ${
          isBot
            ? 'bg-white/90 backdrop-blur-sm text-blue-900 border-blue-200'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-300'
        }`}
      >
        <div
          className="text-sm leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: message.text
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
              .replace(/\n/g, '<br />'),
          }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
          <p className="text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {isBot && <CheckCircle className="h-3 w-3 text-green-500" />}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-4 animate-fadeInUp">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm border-2 border-blue-200">
      <Brain className="h-6 w-6" />
    </div>
    <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-blue-200">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <p className="text-sm text-blue-900 font-semibold">AI is thinking...</p>
      </div>
    </div>
  </div>
);



export function NewAssessmentPage(){
    const navigate = useNavigate(); // <-- Add this line

  // At the top of your NewAssessmentPage component
const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [assessmentType, setAssessmentType] = useState(null);
  const [formData, setFormData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [userName, setUserName] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [conversationStep, setConversationStep] = useState('greeting');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const conversationStarted = useRef(false);
const userNearBottomRef = useRef(true);
  // Complete question arrays for both assessments
  const heartDiseaseQuestions = [
    { id: 'age', text: "What's your age in years?", field: 'age', type: 'number', validation: (val) => val > 0 && val <= 120, icon: '🎂', apiField: 'age', hint: "Please enter your age (0-120 years)" },
    { id: 'sex', text: "What's your biological sex?", field: 'sex', type: 'select', options: ['Male', 'Female'], icon: '⚕️', apiField: 'sex', transform: (val) => val === 'Male' ? 1 : 0 },
    { id: 'chest_pain', text: "Do you experience chest pain? What type?", field: 'cp', type: 'select', options: ['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'No Chest Pain/Asymptomatic'], icon: '💔', apiField: 'cp', transform: (val) => ({ 'Typical Angina': 0, 'Atypical Angina': 1, 'Non-anginal Pain': 2, 'No Chest Pain/Asymptomatic': 3 }[val]) },
    { id: 'resting_bp', text: "What's your resting blood pressure (systolic) in mm Hg?", field: 'trestbps', type: 'number', validation: (val) => val >= 80 && val <= 220, icon: '🩺', apiField: 'trestbps', hint: "Normal range: 90-140 mm Hg" },
    { id: 'cholesterol', text: "What's your serum cholesterol level in mg/dl?", field: 'chol', type: 'number', validation: (val) => val >= 100 && val <= 500, icon: '🧪', apiField: 'chol', hint: "Normal range: 150-300 mg/dl" },
    { id: 'fasting_sugar', text: "Is your fasting blood sugar greater than 120 mg/dl?", field: 'fbs', type: 'select', options: ['Yes', 'No'], icon: '🍯', apiField: 'fbs', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'rest_ecg', text: "What are your resting electrocardiographic results?", field: 'restecg', type: 'select', options: ['Normal', 'ST-T wave abnormality', 'Left ventricular hypertrophy'], icon: '📈', apiField: 'restecg', transform: (val) => ({ 'Normal': 0, 'ST-T wave abnormality': 1, 'Left ventricular hypertrophy': 2 }[val]) },
    { id: 'max_heart_rate', text: "What's your maximum heart rate achieved during exercise?", field: 'thalach', type: 'number', validation: (val) => val >= 60 && val <= 220, icon: '💓', apiField: 'thalach', hint: "Normal range: 60-220 BPM" },
    { id: 'exercise_angina', text: "Do you experience chest pain when exercising?", field: 'exang', type: 'select', options: ['Yes', 'No'], icon: '🏃‍♂️', apiField: 'exang', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'st_depression', text: "What's your ST depression value from exercise testing? (Enter 0 if unknown)", field: 'oldpeak', type: 'number', validation: (val) => val >= 0 && val <= 10, icon: '📊', apiField: 'oldpeak', hint: "Typical range: 0-6, enter 0 if unknown" },
    { id: 'st_slope', text: "What's the slope of your peak exercise ST segment?", field: 'slope', type: 'select', options: ['Upsloping', 'Flat', 'Downsloping'], icon: '📈', apiField: 'slope', transform: (val) => ({ 'Upsloping': 0, 'Flat': 1, 'Downsloping': 2 }[val]) },
    { id: 'vessels', text: "How many major vessels (0-4) were colored by fluoroscopy? (Enter 0 if unknown)", field: 'ca', type: 'number', validation: (val) => val >= 0 && val <= 4, icon: '🫀', apiField: 'ca', hint: "Range: 0-4, enter 0 if unknown" },
    { id: 'thalassemia', text: "What's your thalassemia stress test result?", field: 'thal', type: 'select', options: ['Normal', 'Fixed Defect', 'Reversible Defect'], icon: '🔬', apiField: 'thal', transform: (val) => ({ 'Normal': 1, 'Fixed Defect': 2, 'Reversible Defect': 3 }[val]) }
  ];

  const diabetesQuestions = [
    { id: 'gender', text: "What's your gender?", field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'], icon: '⚕️', apiField: 'gender' },
    { id: 'age', text: "What's your age in years?", field: 'age', type: 'number', validation: (val) => val > 0 && val <= 120, icon: '🎂', apiField: 'age', hint: "Please enter your age (0-120 years)" },
    { id: 'hypertension', text: "Do you have hypertension (high blood pressure)?", field: 'hypertension', type: 'select', options: ['Yes', 'No'], icon: '🩺', apiField: 'hypertension', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'heart_disease', text: "Do you have a history of heart disease?", field: 'heart_disease', type: 'select', options: ['Yes', 'No'], icon: '💔', apiField: 'heart_disease', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'smoking', text: "What's your smoking history?", field: 'smoking_history', type: 'select', options: ['never', 'former', 'current', 'not current', 'ever', 'No Info'], icon: '🚭', apiField: 'smoking_history' },
    { id: 'bmi', text: "What's your Body Mass Index (BMI)?", field: 'bmi', type: 'number', validation: (val) => val >= 15 && val <= 50, icon: '📊', apiField: 'bmi', hint: "Normal range: 18.5-30 kg/m²" },
    { id: 'hba1c', text: "What's your HbA1c level?", field: 'HbA1c_level', type: 'number', validation: (val) => val >= 4 && val <= 15, icon: '🔬', apiField: 'HbA1c_level', hint: "Normal: below 5.7%, range: 4-15%" },
    { id: 'glucose', text: "What's your current blood glucose level in mg/dl?", field: 'blood_glucose_level', type: 'number', validation: (val) => val >= 50 && val <= 400, icon: '🍯', apiField: 'blood_glucose_level', hint: "Normal fasting: 70-100 mg/dl" }
  ];

  const scrollToBottom = (behavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 100);
  };


   const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const scrollThreshold = container.clientHeight * 0.4; // 40% of the viewport height
      const distanceScrolledFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      
      setShowScrollToBottom(distanceScrolledFromBottom > scrollThreshold);
      userNearBottomRef.current = distanceScrolledFromBottom < 100; // User is "near bottom" if less than 100px away
    }
  };
  
  // Smarter auto-scroll: only scrolls if the user is already near the bottom.
  useEffect(() => {
    if (userNearBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping]);

 useEffect(() => {
    // This listener checks for login/logout state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, set their details
        setUserDetails(user);

        // Fetch their profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // If profile exists, get the name and start the conversation
          const userData = docSnap.data();
          setUserName(userData.name);
          startConversationFlow(userData.name);
        } else {
          // No profile found, start conversation to collect the name
          console.log("New user or no profile in Firestore. Collecting name.");
          startConversationFlow(null);
        }
      } else {
        // User is logged out, reset state
        setUserDetails(null);
        setUserName('');
        // You might want to clear messages or show a login prompt here
      }
      // Finished loading, hide the initial loading screen
      setIsInitialLoad(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
}, []); // Empty array ensures this runs only once
  
  // Enhanced conversation flow with proper timing
  const startConversationFlow = async (name) => {
    setIsInitialLoad(false);
    
    // Phase 1: Personalized Greeting
    await new Promise(res => setTimeout(res, 800));
    await addBotMessage(`Hello ${name}! 👋 Welcome to your personal health assessment!`, '🌟');
    
    await new Promise(res => setTimeout(res, 1500));
    await addBotMessage(`I'm Prana-Pulse, your AI-powered health companion! 🤖`, '💙');
    
    await new Promise(res => setTimeout(res, 1800));
    await addBotMessage(`I offer two comprehensive health screenings:\n\n❤️ **Heart Disease Risk Assessment**\n• 13 clinical indicators\n• AI-powered analysis\n\n🩸 **Diabetes Risk Assessment**\n• 8 metabolic factors\n• Early detection insights`, '📋');
    
    await new Promise(res => setTimeout(res, 2000));
    await addBotMessage(`Ready to begin? Choose the assessment you'd like to start with! 🚀`, '✨');
    
    setConversationStep('selection');
    // Delayed quick replies for better UX
    setTimeout(() => {
      setShowQuickReplies(true);
    }, 800);
  };

  // Enhanced message system with animations
  const addBotMessage = (text, icon = '🤖') => {
    return new Promise(resolve => {
      setIsTyping(true);
      
      // Dynamic typing duration for realism
      const typingDuration = Math.min(Math.max(text.length * 25, 800), 2500);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text,
          icon,
          timestamp: new Date(),
          animate: true
        }]);
        setIsTyping(false);
        setTimeout(resolve, 300);
      }, typingDuration);
    });
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'user',
      text,
      timestamp: new Date(),
      animate: true
    }]);
  };

  // Enhanced error handling
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  // Comprehensive input validation
  const validateInput = (value, question) => {
    if (!value || value.toString().trim() === '') {
      return { valid: false, error: 'Please provide an answer before continuing.' };
    }

    if (question.type === 'number') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { valid: false, error: 'Please enter a valid number.' };
      }
      if (question.validation && !question.validation(numValue)) {
        return { 
          valid: false, 
          error: `Please enter a value in the expected range. ${question.hint || ''}` 
        };
      }
    } else if (question.type === 'select' && !question.options.includes(value)) {
      return { 
        valid: false, 
        error: 'Please select one of the provided options.' 
      };
    }
    return { valid: true };
  };

  // Enhanced assessment selection
  const handleAssessmentSelection = async (type, label) => {
    if (isTyping || assessmentType) return;
    
    addUserMessage(label);
    setAssessmentType(type);
    setShowQuickReplies(false);
    setConversationStep('questions');
    
    await new Promise(res => setTimeout(res, 1000));
    const assessmentName = type === 'heart' ? 'Heart Disease' : 'Diabetes';
    await addBotMessage(`Excellent choice! Let's begin your ${assessmentName} risk assessment. 🎯`, '✨');
    
    await new Promise(res => setTimeout(res, 1500));
    await addBotMessage(`I'll guide you through a series of questions to build your health profile. 📊`, '💡');
    
    await new Promise(res => setTimeout(res, 1800));
    
    const questions = type === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    setCurrentQuestion(0);
    await addBotMessage(`Let's start with question 1 of ${questions.length}:\n\n**${questions[0].text}**`, questions[0].icon);
    
    // Delayed quick replies
    setTimeout(() => {
      setShowQuickReplies(true);
    }, 1200);
  };

  // Enhanced message handling
  const handleSendMessage = async (inputText = currentInput) => {
    if (!inputText.trim() || isTyping || currentQuestion === -1) return;
    
    const questions = assessmentType === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    const currentQ = questions[currentQuestion];
    const validation = validateInput(inputText, currentQ);
    
    if (!validation.valid) {
      showErrorMessage(validation.error);
      return;
    }

    addUserMessage(inputText);
    setCurrentInput('');
    setShowQuickReplies(false);

    // Process the input value
    const rawValue = currentQ.type === 'number' ? parseFloat(inputText) : inputText;
    const processedValue = currentQ.transform ? currentQ.transform(rawValue) : rawValue;
    
    const newApiData = {
      ...formData,
      [currentQ.apiField]: processedValue,
    };
    setFormData(newApiData);

    const nextQuestionIndex = currentQuestion + 1;
    
    if (nextQuestionIndex < questions.length) {
      // Positive reinforcement
      await new Promise(res => setTimeout(res, 800));
      const encouragements = [
        'Perfect! Moving to the next question... ✅', 
        'Great response! Continuing... �', 
        'Excellent! Next question coming up... ✨'
      ];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      await addBotMessage(randomEncouragement, '👍');
      
      await new Promise(res => setTimeout(res, 1200));
      setCurrentQuestion(nextQuestionIndex);
      const nextQuestion = questions[nextQuestionIndex];
      
      await addBotMessage(`Question ${nextQuestionIndex + 1} of ${questions.length}:\n\n**${nextQuestion.text}**`, nextQuestion.icon);
      
      // Delayed quick replies
      setTimeout(() => {
        setShowQuickReplies(true);
      }, 1000);
    } else {
      // Completion sequence
      setIsComplete(true);
      await new Promise(res => setTimeout(res, 1200));
      await addBotMessage(`🎉 All questions completed! Analyzing your data now...`, '✅');
      
      await new Promise(res => setTimeout(res, 1800));
      await generateReport(newApiData);
    }
  };

  // API call function
  const generateReport = async (finalFormData) => {
  try {
    await addBotMessage(`🔬 Processing your health assessment... This may take a moment.`, '🔄');

    // For now, let's assume the existing API endpoint returns the detailed LLM response.
    // You might have a different endpoint for the LLM call.
    const apiUrl = assessmentType === 'heart'
      ? 'https://prana-pulse-api.onrender.com/predict/heart' // Example LLM endpoint
      : 'https://prana-pulse-api.onrender.com/predict/diabetes';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalFormData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status}. ${errorData.message || 'The server returned an error.'}`);
    }

    // This 'llmResponse' is the detailed JSON object from your API
    const llmResponse = await response.json();

    await addBotMessage(`✨ Analysis complete! Generating your personalized report...`, '🚀');

    // Prepare the data to be passed to the report page
    const navigationState = {
      llmResponse: llmResponse,     // The full response from your LLM
      userInputs: finalFormData,    // The data the user entered
      userDetails: {
        name: userName,
        assessmentType: assessmentType
      }
    };

    // A short delay so the user can read the message, then redirect.
    setTimeout(() => {
      navigate('/report', { state: navigationState });
    }, 1500);

  } catch (error) {
    console.error("API Error in generateReport:", error);
    await addBotMessage(`⚠️ Apologies, there was an issue processing your assessment. This could be due to a network or server error. Please try again later.`, '😔');
  }
};

  // Enhanced keyboard interaction
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick reply handler
  const handleQuickReply = (option) => {
    if (currentQuestion > -1 || conversationStep === 'selection') {
      handleSendMessage(option);
    }
  };

  // Enhanced reset functionality
  const resetAssessment = () => {
    setMessages([]);
    setCurrentInput('');
    setCurrentQuestion(-1);
    setAssessmentType(null);
    setFormData({});
    setIsComplete(false);
    setResults(null);
    setShowQuickReplies(false);
    setConversationStep('greeting');
    setIsInitialLoad(true);
    
    setTimeout(async () => {
      await startConversationFlow(userName);
    }, 800);
  };

  // Enhanced quick replies with proper spacing
  const renderQuickReplies = () => {
    if (isComplete || isTyping || !showQuickReplies) return null;
    
    if (currentQuestion === -1 && conversationStep === 'selection') {
      return (
        <div className="bg-white/95 backdrop-blur-xl border-t border-blue-200 shadow-lg animate-slideInUp">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900 mb-1">Choose Your Assessment</p>
                <p className="text-sm text-blue-600">Select the health screening to begin</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => handleAssessmentSelection('heart', '❤️ Heart Disease Assessment')}
                className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 text-blue-900 rounded-2xl p-6 hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center border border-red-200">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-blue-900 mb-1">Heart Disease</h3>
                    <p className="text-red-600 text-sm">Cardiovascular Assessment</p>
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <span>13 clinical questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <span>AI-powered risk analysis</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-red-600 bg-red-100 px-3 py-1 rounded-full">~5 minutes</span>
                  <div className="text-red-600 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
              
              <button
                onClick={() => handleAssessmentSelection('diabetes', '🩸 Diabetes Assessment')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-900 rounded-2xl p-6 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200">
                    <Droplet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-blue-900 mb-1">Diabetes</h3>
                    <p className="text-blue-600 text-sm">Blood Sugar Assessment</p>
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>8 metabolic questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Early detection insights</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">~4 minutes</span>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Confidential & scientifically validated</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const questions = assessmentType === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    const currentQ = questions[currentQuestion];
    
    if (currentQ?.type === 'select') {
      return (
        <div className="bg-white/95 backdrop-blur-xl border-t border-blue-200 shadow-lg animate-slideInUp">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-bold text-blue-900">Quick Select</p>
                <p className="text-sm text-blue-600">Choose your answer below</p>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleQuickReply(option)}
                  className="group relative overflow-hidden px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 hover:shadow-md hover:border-blue-300 animate-slideInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <span>{option}</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                  </span>
                </button>
              ))}
            </div>
            
            {currentQ.hint && (
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 animate-slideInUp">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">💡 Helpful Guide</p>
                    <p className="text-sm text-amber-700">{currentQ.hint}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentQ?.type === 'number' && currentQ.hint) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border-t border-blue-200 shadow-lg animate-slideInUp">
          <div className="p-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                  <Star className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">📊 Reference Range</p>
                  <p className="text-sm text-blue-700">{currentQ.hint}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="fixed top-6 right-6 z-50 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slideInRight max-w-md">
          <div className="p-2 bg-red-100 rounded-xl">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">Input Error</p>
            <p className="text-xs text-red-600">{errorMessage}</p>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="ml-2 hover:bg-red-100 rounded-full p-2 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => console.log('Navigate to dashboard')}
                className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 group border border-blue-200"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600 group-hover:text-blue-800 transition-colors group-hover:-translate-x-1" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                    <HeartPulse className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div>
                  <h1 className="font-bold text-2xl text-blue-900 mb-1">
                    Prana-Pulse
                  </h1>
                  <p className="text-blue-600 flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4" />
                    AI Health Assessment • {isTyping ? 'Processing...' : isInitialLoad ? 'Loading...' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-semibold text-blue-900">Secure & Private</p>
                  <p className="text-xs text-blue-600">HIPAA Compliant</p>
                </div>
              </div>
              
              {userName && (
                <div className="flex items-center gap-3 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-900 text-sm font-semibold">{userName}</p>
                    <p className="text-blue-600 text-xs">Health Assessment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Loading State */}
        {isInitialLoad && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <div className="relative w-32 h-32 mb-8 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-xl"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <HeartPulse className="h-16 w-16 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Initializing Prana-Pulse
              </h2>
              <p className="text-blue-600 text-lg mb-4">Setting up your AI health assistant</p>
              <p className="text-blue-500 text-sm mb-6">Loading profile and assessment modules...</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {!isInitialLoad && (
          <>
            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200 mb-4 scrollbar-hide"
              style={{ minHeight: '400px' }}
            >
              <div className="p-6 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''} ${
                      message.animate ? 'animate-fadeInUp' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border-2 ${
                        message.type === 'bot'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-200'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-200'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <span className="text-lg">{message.icon || '🤖'}</span>
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div
                      className={`max-w-xl px-6 py-4 rounded-2xl shadow-sm border ${
                        message.type === 'bot'
                          ? 'bg-white/90 backdrop-blur-sm text-blue-900 border-blue-200'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-300'
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ 
                          __html: message.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                            .replace(/\n/g, '<br />')
                        }}
                      />
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
                        <p className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.type === 'bot' && (
                          <div className="flex items-center gap-1 text-xs opacity-60">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>AI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-4 animate-fadeInUp">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm border-2 border-blue-200">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-blue-200 max-w-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div>
                          <p className="text-sm text-blue-900 font-semibold">AI is thinking...</p>
                          <p className="text-xs text-blue-600">Processing response</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollToBottom  && (
              <button
                onClick={() => scrollToBottom()}
                className="fixed bottom-32 right-8 z-20 bg-white/90 backdrop-blur-xl p-3 rounded-xl shadow-lg hover:bg-white transition-all animate-fadeInUp border border-blue-200 group"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="h-5 w-5 text-blue-600 group-hover:translate-y-1 transition-transform" />
              </button>
            )}

            {/* Quick Replies - Fixed positioning to prevent overlap */}
            {renderQuickReplies()}

            {/* Input Area - Proper spacing from quick replies */}
            {!isComplete && !isInitialLoad && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200 p-4 mt-2">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        currentQuestion === -1
                          ? "Please select an option above..."
                          : "Type your answer here..."
                      }
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 text-sm transition-all duration-300"
                      disabled={isTyping || currentQuestion === -1}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {isTyping && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-400 animate-spin" />
                          <span className="text-xs text-blue-500">Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!currentInput.trim() || isTyping || currentQuestion === -1}
                    className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center gap-2 font-semibold text-sm border border-blue-300"
                  >
                    <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>Send</span>
                  </button>
                </div>
                
                {/* Progress indicator */}
                {assessmentType && currentQuestion >= 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Progress</p>
                          <p className="text-xs text-blue-600">Question {currentQuestion + 1} of {assessmentType === 'heart' ? heartDiseaseQuestions.length : diabetesQuestions.length}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          {Math.round(((currentQuestion + 1) / (assessmentType === 'heart' ? heartDiseaseQuestions.length : diabetesQuestions.length)) * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex-1 bg-blue-100 rounded-full h-3 overflow-hidden border border-blue-200">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                          style={{ width: `${((currentQuestion + 1) / (assessmentType === 'heart' ? heartDiseaseQuestions.length : diabetesQuestions.length)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
