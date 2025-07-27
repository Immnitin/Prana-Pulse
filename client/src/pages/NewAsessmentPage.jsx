import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { HeartPulse, Download, Mail, ArrowLeft, Send, Bot, User, Sparkles, Activity, Shield, AlertTriangle, CheckCircle, Heart, Droplet, X, RefreshCw, ChevronDown, Table, TestTube } from 'lucide-react';

// Sub-components
const BMITable = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
      <Table className="h-5 w-5 text-blue-500" />
      <span>BMI Categories (WHO)</span>
    </h4>
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="bg-gray-100 text-gray-800">
        <tr>
          <th className="px-4 py-2 rounded-l-lg">Category</th>
          <th className="px-4 py-2 rounded-r-lg">BMI Range (kg/m²)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="px-4 py-2">Underweight</td>
          <td className="px-4 py-2">&lt; 18.5</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2 font-semibold text-emerald-700">Normal weight</td>
          <td className="px-4 py-2 font-semibold text-emerald-700">18.5 – 24.9</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2">Overweight</td>
          <td className="px-4 py-2">25.0 – 29.9</td>
        </tr>
        <tr>
          <td className="px-4 py-2">Obesity</td>
          <td className="px-4 py-2">≥ 30.0</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const BPTable = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
      <HeartPulse className="h-5 w-5 text-red-500" />
      <span>Blood Pressure (AHA)</span>
    </h4>
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="bg-gray-100 text-gray-800">
        <tr>
          <th className="px-4 py-2 rounded-l-lg">Category</th>
          <th className="px-4 py-2">Systolic</th>
          <th className="px-4 py-2 rounded-r-lg">Diastolic</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="px-4 py-2 font-semibold text-emerald-700">Normal</td>
          <td className="px-4 py-2 font-semibold text-emerald-700">&lt; 120 mmHg</td>
          <td className="px-4 py-2 font-semibold text-emerald-700">&lt; 80 mmHg</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2">Elevated</td>
          <td className="px-4 py-2">120 – 129 mmHg</td>
          <td className="px-4 py-2">&lt; 80 mmHg</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2">Hypertension St. 1</td>
          <td className="px-4 py-2">130 – 139 mmHg</td>
          <td className="px-4 py-2">80 – 89 mmHg</td>
        </tr>
        <tr>
          <td className="px-4 py-2">Hypertension St. 2</td>
          <td className="px-4 py-2">≥ 140 mmHg</td>
          <td className="px-4 py-2">≥ 90 mmHg</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const GlucoseTable = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
      <Droplet className="h-5 w-5 text-pink-500" />
      <span>Fasting Glucose (ADA)</span>
    </h4>
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="bg-gray-100 text-gray-800">
        <tr>
          <th className="px-4 py-2 rounded-l-lg">Category</th>
          <th className="px-4 py-2 rounded-r-lg">Level (mg/dL)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="px-4 py-2 font-semibold text-emerald-700">Normal</td>
          <td className="px-4 py-2 font-semibold text-emerald-700">&lt; 100</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2">Prediabetes</td>
          <td className="px-4 py-2">100 – 125</td>
        </tr>
        <tr>
          <td className="px-4 py-2">Diabetes</td>
          <td className="px-4 py-2">≥ 126</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const CholesterolTable = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
      <TestTube className="h-5 w-5 text-purple-500" />
      <span>Total Cholesterol</span>
    </h4>
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="bg-gray-100 text-gray-800">
        <tr>
          <th className="px-4 py-2 rounded-l-lg">Category</th>
          <th className="px-4 py-2 rounded-r-lg">Level (mg/dL)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="px-4 py-2 font-semibold text-emerald-700">Desirable</td>
          <td className="px-4 py-2 font-semibold text-emerald-700">&lt; 200</td>
        </tr>
        <tr className="border-b">
          <td className="px-4 py-2">Borderline High</td>
          <td className="px-4 py-2">200 – 239</td>
        </tr>
        <tr>
          <td className="px-4 py-2">High</td>
          <td className="px-4 py-2">≥ 240</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const NewAssessmentPage = () => {
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

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const conversationStarted = useRef(false);
  const navigate = useNavigate();

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
    { id: 'gender', text: "What's your gender?", field: 'gender', type: 'select', options: ['Male', 'Female'], icon: '⚕️', apiField: 'gender' },
    { id: 'age', text: "What's your age in years?", field: 'age', type: 'number', validation: (val) => val > 0 && val <= 120, icon: '🎂', apiField: 'age', hint: "Please enter your age (0-120 years)" },
    { id: 'hypertension', text: "Do you have hypertension (high blood pressure)?", field: 'hypertension', type: 'select', options: ['Yes', 'No'], icon: '🩺', apiField: 'hypertension', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'heart_disease', text: "Do you have a history of heart disease?", field: 'heart_disease', type: 'select', options: ['Yes', 'No'], icon: '💔', apiField: 'heart_disease', transform: (val) => val === 'Yes' ? 1 : 0 },
    { id: 'smoking', text: "What's your smoking history?", field: 'smoking_history', type: 'select', options: ['Never', 'Former', 'Current', 'Not Current', 'Ever', 'No Info'], icon: '🚭', apiField: 'smoking_history', transform: (val) => val.toLowerCase() },
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
      const isScrolledUp = container.scrollHeight - container.scrollTop > container.clientHeight + 150;
      setShowScrollTop(isScrolledUp);
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationStarted.current) return;
    conversationStarted.current = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserName(userData.name);
          setUserDetails(userData);
          await addBotMessage(`Hello ${userData.name}! Which health assessment would you like to take?`, '👋');
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const addBotMessage = (text, icon = '🤖') => {
    return new Promise(resolve => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text,
          icon,
          timestamp: new Date(),
          animate: true
        }]);
        setIsTyping(false);
        setTimeout(resolve, 200);
      }, Math.random() * 600 + 600);
    });
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const validateInput = (value, question) => {
    if (question.type === 'number') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return { valid: false, error: 'Please enter a valid number.' };
      if (question.validation && !question.validation(numValue)) return { valid: false, error: `Please enter a value in the expected range. ${question.hint || ''}` };
    } else if (question.type === 'select' && !question.options.includes(value)) {
      return { valid: false, error: 'Please select one of the provided options.' };
    }
    return { valid: true };
  };

  const handleAssessmentSelection = async (type, label) => {
    if (isTyping || assessmentType) return;
    addUserMessage(label);
    setAssessmentType(type);
    setCurrentQuestion(0);
    
    await new Promise(res => setTimeout(res, 500));
    const questions = type === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    await addBotMessage(questions[0].text, questions[0].icon);
  };

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

    const processedValue = currentQ.transform ? currentQ.transform(inputText) : (currentQ.type === 'number' ? parseFloat(inputText) : inputText);
    const newFormData = {
      ...formData,
      [currentQ.apiField]: processedValue,
      [currentQ.field]: inputText
    };
    setFormData(newFormData);

    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      const nextQuestion = questions[nextQuestionIndex];
      await new Promise(res => setTimeout(res, 800));
      await addBotMessage(nextQuestion.text, nextQuestion.icon);
    } else {
      setIsComplete(true);
      await new Promise(res => setTimeout(res, 800));
      await addBotMessage(`Assessment complete. Analyzing your data...`, '🔬');
      await generateReport(newFormData);
    }
  };
    
  const generateReport = (data) => {
    const diabetesReport = {
      "explanation": {
        "diet_plan": "Here's a Sample 3-Day Indian Meal Plan focused on diabetic-friendly cuisine:\n\nDay 1:\n- Breakfast: Poha (flattened rice) with peanuts, mustard seeds, curry leaves, and onions. Serve with a side of low-fat yogurt.\n- Lunch: Roti (whole wheat rotis) with lentil dal and mixed vegetable sabzi. Include a small bowl of raw salad with lemon juice dressing.\n- Dinner: Brown rice with mixed vegetable khichdi. Serve with a side of low-fat yogurt and a piece of fruit for dessert.\n\nDay 2:\n- Breakfast: Idli with sambar (lentil soup). Accompany with a small bowl of curd.\n- Lunch: Roti (whole wheat) with chana masala (chickpea curry) and saag (spinach) atop brown rice.\n- Dinner: Vegetable k pizza made with whole wheat base and low-fat cheese. Serve with a side of mixed vegetable stir-fry.\n\nDay 3:\n- Breakfast: Chilla (chickpea flour crepe) with coriander chutney. Serve with a side of seasonal fruit.\n- Lunch: Bhora bhaji (spiced brinjal fry) served with brown rice and dal.\n- Dinner: Rajma (kidney beans curry) with brown rice. Accompany with a small bowl of raw salad with lemon juice dressing.",
        "key_factors_analysis": "Here's a brief analysis of your health vitals:\n\n- Gender: Male (Neutral factor)\n- Age: 30.0 (Neutral factor, age plays a role in diabetes risk but at a young age, the risk is typically lower)\n- Hypertension: 0 (Good, normal blood pressure is beneficial for diabetes management)\n- Heart Disease: 0 (Good, no history of heart disease)\n- Smoking History: 'never' (Excellent, non-smokers have reduced risk of diabetes)\n- BMI: 22.5 (Good, optimal BMI for adults is 18.5 - 24.9)\n- HbA1c_level: 5.2 (Borderline high. HbA1c measures average blood glucose over 2-3 months. Aim for less than 5.7%)\n- Blood Glucose Level: 90 (Good, normal fasting blood glucose is 70-100 mg/dL)",
        "lifestyle_recommendations": "To maintain a healthy lifestyle, consider the following modifications:\n\n- Physical Activity: Incorporate daily activities like brisk walking, cycling, or yoga and pranayama. Aim for 30 minutes of physical activity 5 days a week.\n- Stress Management: Practice meditation (dhyana), mindfulness, deep breathing exercises, or relaxation techniques for at least 10-20 minutes daily.\n- Sleep: Strive for 7-8 hours of quality sleep every night.",
        "risk_assessment": "Your calculated risk level for Type 2 Diabetes is low, which is commendable at the age of 30. However, it's crucial to maintain this trend by adopting a healthy lifestyle for continued prevention."
      },
      "risk_score": 0.0
    };
    
    const heartReport = {
      "explanation": {
        "diet_plan": {
          "Breakfast": "Day 1: Poha (flat rice flakes) with vegetables and low-fat curd; Day 2: Idli (steamed rice cakes) with sambar (lentil-based soup) and fresh coconut chutney; Day 3: Whole wheat roti with moong dal khichdi and a side salad.",
          "Dinner": "Day 1: Vegetable upma (semolina dish) with a small side of curd; Day 2: Moong dal khichdi with a green leafy vegetable; Day 3: Whole wheat roti with chana dal (split Bengal gram) khichdi and a side of cucumber raita.",
          "Lunch": "Day 1: Rice (preferably brown) with mixed vegetable dal (lentil soup) and a variety of seasonal vegetables; Day 2: Vegetable biryani made with olive oil, served with raita (yogurt-based side); Day 3: Roti with mixed vegetable (low-fat) curry and a side of green leafy salad."
        },
        "key_factors_analysis": {
          "age": "Your age of 63 is a factor in your risk for heart disease. As age increases, the likelihood of heart disease also tends to rise.",
          "ca": "The presence or absence of significant coronary artery disease (ca=0) could not be determined.",
          "chol": "Your cholesterol (chol=233) is high, well above the healthy range. High cholesterol contributes to plaque buildup in the arteries, increasing your risk of heart disease.",
          "cp": "Your chest pain at rest (cp=3) is already present, which could be an indication of heart disease.",
          "exang": "The exercise-induced angina (exang=0) is not present, which is a favorable sign.",
          "fbs": "Your Fasting Blood Sugar (fbs=1) indicates that you may have diabetes, which is a strong risk factor for heart disease.",
          "oldpeak": "Your ST depression induced by exercise relative to rest (oldpeak=2.3) suggests that there was some degree of ischemia (insufficient blood supply to the heart muscle), which could be a sign of heart disease.",
          "restecg": "Your resting electrocardiographic results (restecg=0) are normal, which is a good sign.",
          "sex": "Males generally have a higher risk of heart disease compared to females due to biology and lifestyle factors.",
          "slope": "Your slope of the peak exercise ST segment (slope=0) indicates a normal response.",
          "thal": "Your typical (thal=1) or atypical (thal=2,3) exercise ECG pattern doesn't show any concern as more details are needed about the ST segment shifts and assessment of risks.",
          "thalach": "Your maximum heart rate attained (thalach=150) during the exercise test is within normal limits.",
          "trestbps": "Your resting blood pressure (trestbps=145), while not extremely high, borderlines on hypertension, which is a significant risk factor for heart disease."
        },
        "lifestyle_recommendations": {
          "Physical Activity": "Incorporate brisk walking, cycling, or low-impact exercises, like yoga and pranayama, into your daily routine for at least 30 minutes, five times a week.",
          "Sleep": "Aim for 7-8 hours of restful sleep each night. Maintaining good sleep hygiene can contribute to better heart health.",
          "Stress Management": "Practice meditation (dhyana), mindfulness, and deep breathing exercises daily. Aim for at least 15 minutes of stress reduction techniques twice a day."
        },
        "risk_assessment": "Your risk for heart disease is currently high. It's crucial to address this condition promptly to minimize potential complications."
      },
      "risk_score": 0.88
    };

    const mockApiResponse = assessmentType === 'diabetes' ? diabetesReport : heartReport;
    const fullUserDetails = { ...userDetails, assessmentType };
    navigate('/report', { state: { reportData: mockApiResponse, userDetails: fullUserDetails } });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (option) => {
    if (currentQuestion > -1) {
      handleSendMessage(option);
    }
  };

  const resetAssessment = () => {
    setMessages([]);
    setCurrentInput('');
    setCurrentQuestion(-1);
    setAssessmentType(null);
    setFormData({});
    setIsComplete(false);
    setResults(null);
    setTimeout(async () => {
      await addBotMessage(`Hello ${userName}! Ready for another assessment?`, '👋');
    }, 500);
  };
    
  const renderQuickReplies = () => {
    if (isComplete || isTyping) return null;
    
    if (currentQuestion === -1) {
      return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Choose your assessment:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleAssessmentSelection('heart', '❤️ Heart Disease Assessment')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              <Heart className="h-5 w-5" />
              Heart Disease Assessment
            </button>
            <button
              onClick={() => handleAssessmentSelection('diabetes', '🩸 Diabetes Assessment')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              <Droplet className="h-5 w-5" />
              Diabetes Assessment
            </button>
          </div>
        </div>
      );
    }

    const questions = assessmentType === 'heart' ? heartDiseaseQuestions : diabetesQuestions;
    const currentQ = questions[currentQuestion];
    
    if (currentQ?.type === 'select') {
      return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Select your answer:
          </p>
          <div className="flex flex-wrap gap-2">
            {currentQ.options.map((option) => (
              <button
                key={option}
                onClick={() => handleQuickReply(option)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                {option}
              </button>
            ))}
          </div>
          {currentQ.hint && (
            <p className="text-xs text-gray-500 mt-2 italic">💡 {currentQ.hint}</p>
          )}
        </div>
      );
    }

    if (currentQ?.type === 'number' && currentQ.hint) {
      return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            💡 {currentQ.hint}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fadeInUp">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">{errorMessage}</span>
          <button
            onClick={() => setShowError(false)}
            className="ml-2 hover:bg-red-600 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100/80 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <HeartPulse className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-bounce shadow-md">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prana-Pulse
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Health Assessment • Online
              </p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-4 w-4 text-emerald-500" />
            Secure & Private
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col relative">
        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-white/90 backdrop-blur-sm rounded-t-3xl shadow-2xl border border-white/20 hide-scrollbar"
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
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.type === 'bot'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {message.type === 'bot' ? (
                    <span className="text-sm">{message.icon || '🤖'}</span>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`max-w-sm lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                    message.type === 'bot'
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  <p
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
                  ></p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4 animate-fadeInUp">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Prana-Pulse is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollTop && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-8 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-gray-200 transition-all animate-fadeInUp"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-6 w-6 text-gray-700" />
          </button>
        )}

        {/* Quick Replies */}
        {renderQuickReplies()}

        {/* Input Area */}
        {!isComplete && (
          <div className="bg-white/90 backdrop-blur-sm rounded-b-3xl shadow-2xl border border-white/20 border-t-0">
            <div className="p-6 flex gap-4 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentQuestion === -1
                      ? "Please select an option above..."
                      : `Type your answer here...`
                  }
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                  disabled={isTyping || currentQuestion === -1}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-400">Press Enter ↵</span>
                </div>
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!currentInput.trim() || isTyping || currentQuestion === -1}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 font-semibold"
              >
                <Send className="h-5 w-5" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};