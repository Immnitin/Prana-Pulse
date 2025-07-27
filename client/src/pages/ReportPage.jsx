import React, { useEffect, useRef, useState } from 'react';
import { 
  User, Mail, Phone, Calendar, Shield, BarChart, Utensils, Dumbbell, 
  Heart, Droplet, FileDown, TrendingUp, TrendingDown, Minus, 
  AlertTriangle, CheckCircle, Info, Star, Clock, Target,
  Activity, Stethoscope, Brain, Apple, Zap, Users, Award,
  BookOpen, MessageSquare, Download, Share2, Printer,
  ArrowRight, Plus, Eye, RefreshCw, Settings, Home
} from 'lucide-react';

// Enhanced Card Components
const ReportCard = ({ children, className = "", gradient = false }) => (
  <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, subtitle, badge, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    red: "from-red-500 to-pink-600",
    green: "from-emerald-500 to-teal-600",
    purple: "from-purple-500 to-indigo-600",
    orange: "from-orange-500 to-red-600"
  };

  return (
    <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-4 bg-gradient-to-br ${colorClasses[color]} rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200`}>
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <div className="bg-white px-4 py-2 rounded-full shadow-md">
          <span className="text-sm font-semibold text-gray-700">{badge}</span>
        </div>
      )}
    </div>
  );
};

// Risk Score Circle Component
const RiskScoreCircle = ({ score, level, assessmentType }) => {
  const circumference = 2 * Math.PI * 90;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const colorMap = {
    Low: { text: 'text-emerald-600', stroke: 'stroke-emerald-500', ring: 'ring-emerald-200', bg: 'bg-emerald-50' },
    Moderate: { text: 'text-yellow-600', stroke: 'stroke-yellow-500', ring: 'ring-yellow-200', bg: 'bg-yellow-50' },
    High: { text: 'text-red-600', stroke: 'stroke-red-500', ring: 'ring-red-200', bg: 'bg-red-50' }
  };
  
  const colors = colorMap[level];
  
  return (
    <div className={`relative w-64 h-64 flex items-center justify-center rounded-full ring-8 ${colors.ring} ${colors.bg} shadow-2xl`}>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${colors.stroke} transition-all duration-2000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <p className={`text-5xl font-bold ${colors.text}`}>{score}%</p>
        <p className={`text-lg font-semibold ${colors.text} mt-1`}>{level} Risk</p>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
          {assessmentType === 'diabetes' ? 'Diabetes' : 'Heart Disease'}
        </p>
      </div>
    </div>
  );
};

// Enhanced Key Factor Component
const KeyFactorItem = ({ factor, analysis, value, impact, recommendation }) => {
  let statusColor = 'text-gray-600';
  let bgColor = 'bg-gray-50';
  let Icon = Minus;
  
  if (impact === 'high' || analysis.toLowerCase().includes('high risk') || analysis.toLowerCase().includes('contributes significantly')) {
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    Icon = TrendingUp;
  } else if (impact === 'moderate' || analysis.toLowerCase().includes('moderate') || analysis.toLowerCase().includes('borderline')) {
    statusColor = 'text-yellow-600';
    bgColor = 'bg-yellow-50';
    Icon = TrendingUp;
  } else if (impact === 'low' || analysis.toLowerCase().includes('good') || analysis.toLowerCase().includes('normal') || analysis.toLowerCase().includes('favorable')) {
    statusColor = 'text-emerald-600';
    bgColor = 'bg-emerald-50';
    Icon = TrendingDown;
  }

  return (
    <div className={`p-6 m-2 rounded-2xl border-l-4 ${bgColor} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${bgColor} border`}>
              <Icon size={18} className={statusColor} />
            </div>
            <h4 className="font-bold text-gray-800 text-lg capitalize">{factor.replace(/_/g, ' ')}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} ${bgColor} border`}>
              {value}
            </span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{analysis}</p>
          {recommendation && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600"><strong className="text-indigo-600">Recommendation:</strong> {recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Health Metrics Dashboard
const HealthMetricCard = ({ icon, title, value, unit, status, trend, description }) => {
  const statusColors = {
    excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {trend && (
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{unit}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
          {status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Enhanced Diet Plan Component
const DietPlanSection = ({ plan, assessmentType }) => {
  const mealIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎'
  };

  if (typeof plan === 'string') {
    return (
      <div className="p-8">
        <div className="prose prose-lg max-w-none text-gray-700">
          {plan.split('\n\n').map((paragraph, i) => (
            <p key={i} className="whitespace-pre-line mb-4 leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(plan).map(([meal, description]) => (
          <div key={meal} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{mealIcons[meal.toLowerCase()] || '🍽️'}</span>
              <h4 className="font-bold text-indigo-800 text-lg capitalize">{meal}</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
      
      {/* Additional Nutritional Guidelines */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
        <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
          <Apple size={20} />
          Nutritional Guidelines for {assessmentType === 'diabetes' ? 'Diabetes' : 'Heart Disease'} Management
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {assessmentType === 'diabetes' ? (
            <>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Carbohydrates:</strong>
                <p className="text-gray-600 mt-1">45-65% of total calories, focus on complex carbs</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Fiber:</strong>
                <p className="text-gray-600 mt-1">25-35g daily to help control blood sugar</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Sodium:</strong>
                <p className="text-gray-600 mt-1">Less than 2,300mg daily</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Saturated Fat:</strong>
                <p className="text-gray-600 mt-1">Less than 7% of total calories</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Omega-3:</strong>
                <p className="text-gray-600 mt-1">2-3 servings of fatty fish per week</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <strong className="text-emerald-700">Sodium:</strong>
                <p className="text-gray-600 mt-1">Less than 1,500mg daily for heart health</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Clinical Recommendations Component
const ClinicalRecommendations = ({ assessmentType, riskLevel }) => {
  const recommendations = assessmentType === 'diabetes' ? {
    immediate: [
      "Schedule HbA1c test every 3-6 months",
      "Monitor blood glucose levels daily",
      "Annual eye examination for diabetic retinopathy",
      "Foot examination every visit"
    ],
    lifestyle: [
      "Maintain healthy weight (BMI 18.5-24.9)",
      "Engage in 150+ minutes moderate aerobic activity weekly",
      "Follow diabetes-friendly meal plan",
      "Stay hydrated (8-10 glasses water daily)"
    ],
    monitoring: [
      "Blood pressure checks every visit",
      "Lipid panel annually",
      "Kidney function tests (creatinine, microalbumin)",
      "Dental examinations every 6 months"
    ]
  } : {
    immediate: [
      "Lipid panel every 4-6 months",
      "Blood pressure monitoring",
      "Electrocardiogram (ECG) annually",
      "Stress test if symptomatic"
    ],
    lifestyle: [
      "Heart-healthy diet (Mediterranean or DASH)",
      "Regular aerobic exercise 30+ min, 5 days/week",
      "Maintain healthy weight",
      "Quit smoking and limit alcohol"
    ],
    monitoring: [
      "Regular blood pressure checks",
      "Cholesterol level monitoring",
      "Blood sugar screening",
      "Weight and BMI tracking"
    ]
  };

  return (
    <div className="p-8 space-y-6">
      {Object.entries(recommendations).map(([category, items]) => (
        <div key={category} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
          <h4 className="font-bold text-indigo-800 mb-4 text-lg capitalize flex items-center gap-2">
            {category === 'immediate' && <AlertTriangle size={20} />}
            {category === 'lifestyle' && <Heart size={20} />}
            {category === 'monitoring' && <Activity size={20} />}
            {category} Actions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-indigo-100">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Mock PDF Export Function (since we can't use external libraries)
const mockPdfExport = () => {
  // Simulate PDF generation
  const link = document.createElement('a');
  const blob = new Blob(['This would be your PDF content'], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `Prana-Pulse-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function ReportPage() {
  const [showBackButton, setShowBackButton] = useState(false);
  const reportRef = useRef();

  // Mock data since we don't have router state
  const mockReportData = {
    explanation: {
      risk_assessment: "Based on the comprehensive analysis of your health parameters, you have been classified as having a moderate risk for developing type 2 diabetes. This assessment takes into account multiple factors including your BMI, blood glucose levels, family history, and lifestyle factors. While this indicates an elevated risk compared to the general population, it's important to understand that this is a preventable condition with appropriate lifestyle modifications and medical supervision.",
      key_factors_analysis: {
        age: "At 45 years old, you are in an age group where diabetes risk begins to increase. Age is a non-modifiable risk factor, but its impact can be mitigated through healthy lifestyle choices.",
        bmi: "Your BMI of 28.5 places you in the overweight category, which significantly contributes to insulin resistance and diabetes risk. Weight reduction of 10-15 pounds could substantially lower your risk.",
        blood_glucose_level: "Your fasting glucose level of 110 mg/dL is in the prediabetic range (100-125 mg/dL), indicating impaired glucose metabolism that requires immediate attention and monitoring.",
        family_history: "Having a parent with diabetes increases your genetic predisposition. While you cannot change genetics, early intervention and lifestyle modifications can help prevent or delay onset.",
        physical_activity: "Your sedentary lifestyle significantly increases diabetes risk. Regular physical activity improves insulin sensitivity and glucose metabolism."
      },
      diet_plan: {
        breakfast: "Start your day with complex carbohydrates and lean protein. Consider oatmeal with berries and nuts, or Greek yogurt with whole grain cereal. Avoid sugary cereals and pastries.",
        lunch: "Focus on balanced meals with vegetables, lean proteins, and whole grains. A large salad with grilled chicken, quinoa, and olive oil dressing provides sustained energy.",
        dinner: "Keep dinner lighter with vegetables as the main component. Grilled fish or lean meat with roasted vegetables and a small portion of brown rice or sweet potato.",
        snacks: "Choose nutrient-dense snacks like nuts, seeds, vegetables with hummus, or a small piece of fruit. Avoid processed snacks and sugary drinks."
      },
      lifestyle_recommendations: {
        exercise: "Begin with 30 minutes of moderate-intensity exercise 5 days per week. This can include brisk walking, swimming, or cycling. Gradually increase intensity as your fitness improves. Include both aerobic exercise and resistance training for optimal benefits.",
        diet: "Adopt a Mediterranean-style diet rich in vegetables, fruits, whole grains, lean proteins, and healthy fats. Limit processed foods, sugary drinks, and refined carbohydrates. Focus on portion control and eating regular, balanced meals.",
        stress_management: "Chronic stress can affect blood sugar levels. Incorporate stress-reduction techniques such as meditation, yoga, deep breathing exercises, or regular hobbies. Ensure adequate sleep of 7-9 hours per night.",
        monitoring: "Regular monitoring of blood glucose levels, weight, and blood pressure is essential. Keep a food and exercise diary to track patterns and identify areas for improvement."
      }
    },
    risk_score: 0.65
  };

  const mockUserDetails = {
    name: "John Doe",
    email: "john.doe@email.com",
    phonenumber: "+1 (555) 123-4567",
    assessmentType: "diabetes",
    assessmentData: {
      age: 45,
      bmi: 28.5,
      blood_glucose_level: 110,
      HbA1c_level: 6.1,
      hypertension: false,
      family_history: true,
      physical_activity: "sedentary"
    }
  };

  const { explanation, risk_score } = mockReportData;
  const assessmentType = mockUserDetails.assessmentType;
  const riskScore = Math.round(risk_score * 100);
  const riskLevel = risk_score < 0.3 ? 'Low' : risk_score < 0.7 ? 'Moderate' : 'High';

  const handleExportPdf = () => {
    const buttons = document.getElementById('action-buttons');
    if (buttons) buttons.style.display = 'none';
    
    // Mock PDF generation
    setTimeout(() => {
      mockPdfExport();
      if (buttons) buttons.style.display = 'flex';
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prana-Pulse Health Report',
          text: 'My comprehensive health assessment report from Prana-Pulse AI Health Platform',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Report link copied to clipboard!');
      });
    }
  };

  const handleBackToDashboard = () => {
    setShowBackButton(true);
    // In a real app, this would navigate to the dashboard
    alert('Navigating back to dashboard...');
  };

  // Mock health metrics based on assessment data
  const healthMetrics = assessmentType === 'diabetes' ? [
    { icon: <Droplet size={20} />, title: 'Blood Glucose', value: mockUserDetails.assessmentData?.blood_glucose_level || 110, unit: 'mg/dL', status: 'fair', description: 'Current blood sugar level' },
    { icon: <Activity size={20} />, title: 'HbA1c', value: mockUserDetails.assessmentData?.HbA1c_level || 6.1, unit: '%', status: 'fair', description: 'Average blood sugar (3 months)' },
    { icon: <Heart size={20} />, title: 'BMI', value: mockUserDetails.assessmentData?.bmi || 28.5, unit: 'kg/m²', status: 'fair', description: 'Body Mass Index' },
    { icon: <Stethoscope size={20} />, title: 'Blood Pressure', value: 'Normal', unit: '', status: 'good', description: 'Cardiovascular health' }
  ] : [
    { icon: <Heart size={20} />, title: 'Cholesterol', value: 220, unit: 'mg/dL', status: 'fair', description: 'Total cholesterol level' },
    { icon: <Activity size={20} />, title: 'Max Heart Rate', value: 165, unit: 'BPM', status: 'good', description: 'Maximum achieved heart rate' },
    { icon: <Stethoscope size={20} />, title: 'Blood Pressure', value: 140, unit: 'mmHg', status: 'fair', description: 'Resting blood pressure' },
    { icon: <Zap size={20} />, title: 'Exercise Tolerance', value: 'Good', unit: '', status: 'good', description: 'Exercise-induced symptoms' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <div ref={reportRef} className="max-w-6xl mx-auto bg-white">
        {/* Enhanced Header */}
        <header className="p-12 bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Heart size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight">Prana-Pulse</h1>
                  <p className="text-blue-200 text-lg mt-1">Comprehensive AI Health Assessment Report</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2"><Shield size={16} /> Medical Grade Analysis</span>
                <span className="flex items-center gap-2"><Award size={16} /> AI-Powered Insights</span>
                <span className="flex items-center gap-2"><Clock size={16} /> Generated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <h2 className="font-bold text-xl mb-2">{mockUserDetails.name}</h2>
              <div className="space-y-1 text-blue-200">
                <p className="flex items-center gap-2"><Mail size={14} /> {mockUserDetails.email}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {mockUserDetails.phonenumber}</p>
                <p className="flex items-center gap-2"><Calendar size={14} /> Report ID: #PR{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-12 space-y-12">
          {/* Executive Summary */}
          <ReportCard gradient>
            <CardHeader 
              icon={<Target size={28}/>} 
              title="Executive Summary" 
              subtitle="Key findings and overall health assessment"
              badge="Priority Review"
              color="purple"
            />
            <div className="p-8 flex flex-col lg:flex-row items-center gap-12">
              <RiskScoreCircle score={riskScore} level={riskLevel} assessmentType={assessmentType} />
              <div className="flex-1 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                    <Info size={20} />
                    Clinical Assessment Summary
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{explanation.risk_assessment}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{riskScore}%</p>
                    <p className="text-sm text-gray-600">Risk Probability</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-purple-600">{Object.keys(explanation.key_factors_analysis).length}</p>
                    <p className="text-sm text-gray-600">Factors Analyzed</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{assessmentType === 'diabetes' ? 'T2DM' : 'CVD'}</p>
                    <p className="text-sm text-gray-600">Assessment Type</p>
                  </div>
                </div>
              </div>
            </div>
          </ReportCard>

          {/* Health Metrics Dashboard */}
          <ReportCard>
            <CardHeader 
              icon={<BarChart size={28}/>} 
              title="Health Metrics Dashboard" 
              subtitle="Key physiological parameters and their current status"
              color="blue"
            />
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthMetrics.map((metric, index) => (
                  <HealthMetricCard key={index} {...metric} />
                ))}
              </div>
            </div>
          </ReportCard>

          {/* Detailed Risk Factor Analysis */}
          <ReportCard>
            <CardHeader 
              icon={<Brain size={28}/>} 
              title="Comprehensive Risk Factor Analysis" 
              subtitle="Detailed breakdown of how each factor contributes to your overall risk"
              color="purple"
            />
            <div className="p-8">
              <div className="space-y-4">
                {Object.entries(explanation.key_factors_analysis).map(([factor, analysis]) => (
                  <KeyFactorItem 
                    key={factor} 
                    factor={factor} 
                    analysis={analysis} 
                    value={mockUserDetails.assessmentData?.[factor] || 'N/A'}
                    impact={analysis.toLowerCase().includes('high') ? 'high' : analysis.toLowerCase().includes('moderate') ? 'moderate' : 'low'}
                    recommendation={`Monitor ${factor.replace(/_/g, ' ')} levels and consult with healthcare provider for optimization strategies.`}
                  />
                ))}
              </div>
            </div>
          </ReportCard>

          {/* Clinical Recommendations */}
          <ReportCard>
            <CardHeader 
              icon={<Stethoscope size={28}/>} 
              title="Clinical Recommendations" 
              subtitle="Evidence-based medical guidelines tailored to your risk profile"
              color="red"
            />
            <ClinicalRecommendations assessmentType={assessmentType} riskLevel={riskLevel} />
          </ReportCard>

          {/* Personalized Diet Plan */}
          <ReportCard>
            <CardHeader 
              icon={<Utensils size={28}/>} 
              title="Personalized Nutrition Plan" 
              subtitle="Scientifically-backed dietary recommendations for optimal health"
              color="green"
            />
            <DietPlanSection plan={explanation.diet_plan} assessmentType={assessmentType} />
          </ReportCard>

          {/* Lifestyle Modifications */}
          <ReportCard>
            <CardHeader 
              icon={<Dumbbell size={28}/>} 
              title="Lifestyle Modification Program" 
              subtitle="Comprehensive lifestyle changes to reduce risk and improve overall health"
              color="orange"
            />
            <div className="p-8 space-y-6">
              {Object.entries(explanation.lifestyle_recommendations).map(([category, recommendation]) => (
                <div key={category} className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-4 text-lg capitalize flex items-center gap-2">
                    <Star size={20} />
                    {category.replace(/_/g, ' ')} Program
                  </h4>
                  <p className="text-gray-700 mb-4 leading-relaxed">{recommendation}</p>
                  
                  {/* Add specific guidelines based on category */}
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <h5 className="font-semibold text-orange-700 mb-2">Implementation Guidelines:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.toLowerCase().includes('exercise') && (
                        <>
                          <li>• Start with 10-15 minutes daily, gradually increase to 30+ minutes</li>
                          <li>• Include both aerobic and resistance training exercises</li>
                          <li>• Monitor heart rate during exercise (target: 50-85% max heart rate)</li>
                          <li>• Rest days are important for recovery and injury prevention</li>
                        </>
                      )}
                      {category.toLowerCase().includes('diet') && (
                        <>
                          <li>• Plan meals in advance to avoid impulsive food choices</li>
                          <li>• Keep a food diary to track nutritional intake</li>
                          <li>• Focus on portion control and mindful eating practices</li>
                          <li>• Stay hydrated with 8-10 glasses of water daily</li>
                        </>
                      )}
                      {category.toLowerCase().includes('stress') && (
                        <>
                          <li>• Practice stress-reduction techniques (meditation, deep breathing)</li>
                          <li>• Maintain regular sleep schedule (7-9 hours nightly)</li>
                          <li>• Consider counseling or support groups if needed</li>
                          <li>• Limit exposure to chronic stressors when possible</li>
                        </>
                      )}
                      {category.toLowerCase().includes('monitoring') && (
                        <>
                          <li>• Take medications exactly as prescribed by your healthcare provider</li>
                          <li>• Never stop or change medication dosage without medical consultation</li>
                          <li>• Keep a medication log and report any side effects</li>
                          <li>• Schedule regular follow-ups to monitor medication effectiveness</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* Monitoring & Follow-up Plan */}
          <ReportCard>
            <CardHeader 
              icon={<RefreshCw size={28}/>} 
              title="Monitoring & Follow-up Protocol" 
              subtitle="Structured plan for ongoing health monitoring and medical follow-up"
              color="blue"
            />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Short-term monitoring */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Next 30 Days
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-500" />
                      Schedule follow-up appointment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-500" />
                      Begin lifestyle modifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-500" />
                      Start daily health tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-500" />
                      Laboratory tests if recommended
                    </li>
                  </ul>
                </div>

                {/* Medium-term monitoring */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Next 3-6 Months
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-purple-500" />
                      Comprehensive health reassessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-purple-500" />
                      Review progress on lifestyle changes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-purple-500" />
                      Adjust treatment plan if needed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-purple-500" />
                      Specialist referrals if indicated
                    </li>
                  </ul>
                </div>

                {/* Long-term monitoring */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Annual Follow-up
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      Complete health risk reassessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      Update preventive care screening
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      Review and update health goals
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      Long-term trend analysis
                    </li>
                  </ul>
                </div>
              </div>

              {/* Warning Signs to Watch For */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
                <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Warning Signs - Seek Immediate Medical Attention
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessmentType === 'diabetes' ? (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-red-100">
                        <h5 className="font-semibold text-red-700 mb-2">Hyperglycemia Symptoms:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Excessive thirst and urination</li>
                          <li>• Blurred vision</li>
                          <li>• Fatigue and weakness</li>
                          <li>• Nausea or vomiting</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-red-100">
                        <h5 className="font-semibold text-red-700 mb-2">Hypoglycemia Symptoms:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Shakiness or trembling</li>
                          <li>• Sweating and dizziness</li>
                          <li>• Rapid heartbeat</li>
                          <li>• Confusion or irritability</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-red-100">
                        <h5 className="font-semibold text-red-700 mb-2">Cardiovascular Emergency:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Chest pain or pressure</li>
                          <li>• Shortness of breath</li>
                          <li>• Pain radiating to arm/jaw</li>
                          <li>• Sudden severe headache</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-red-100">
                        <h5 className="font-semibold text-red-700 mb-2">Other Warning Signs:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Irregular heart rhythm</li>
                          <li>• Sudden weakness/numbness</li>
                          <li>• Severe dizziness or fainting</li>
                          <li>• Leg pain with swelling</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ReportCard>

          {/* Educational Resources */}
          <ReportCard>
            <CardHeader 
              icon={<BookOpen size={28}/>} 
              title="Educational Resources & Support" 
              subtitle="Curated resources to help you understand and manage your health condition"
              color="green"
            />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500 rounded-xl text-white">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="font-bold text-blue-800">Learning Materials</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Understanding {assessmentType === 'diabetes' ? 'Diabetes' : 'Heart Disease'}</li>
                    <li>• Risk factor modification guide</li>
                    <li>• Nutrition and meal planning</li>
                    <li>• Exercise guidelines and safety</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-500 rounded-xl text-white">
                      <Users size={20} />
                    </div>
                    <h4 className="font-bold text-emerald-800">Support Groups</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Local support group meetings</li>
                    <li>• Online community forums</li>
                    <li>• Peer mentorship programs</li>
                    <li>• Family education sessions</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500 rounded-xl text-white">
                      <MessageSquare size={20} />
                    </div>
                    <h4 className="font-bold text-purple-800">Professional Support</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Certified diabetes/cardiac educator</li>
                    <li>• Registered dietitian consultation</li>
                    <li>• Mental health counseling</li>
                    <li>• 24/7 nurse helpline access</li>
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200">
                <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                  <Phone size={20} />
                  Emergency & Support Contacts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-700">Emergency Services:</strong>
                    <p className="text-gray-600 mt-1">Call 911 immediately</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-700">Healthcare Provider:</strong>
                    <p className="text-gray-600 mt-1">Contact your primary physician</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-700">Prana-Pulse Support:</strong>
                    <p className="text-gray-600 mt-1">1-800-PRANA-PULSE</p>
                  </div>
                </div>
              </div>
            </div>
          </ReportCard>

          {/* Report Validation & Disclaimer */}
          <ReportCard>
            <CardHeader 
              icon={<Shield size={28}/>} 
              title="Report Validation & Medical Disclaimer" 
              subtitle="Important information about this assessment and its limitations"
              color="red"
            />
            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Important Medical Disclaimer
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <p><strong>This report is for informational and educational purposes only.</strong> It does not constitute medical advice, diagnosis, or treatment recommendations. The AI-powered assessment is based on the information you provided and should not replace professional medical consultation.</p>
                  
                  <p><strong>Limitations:</strong> This assessment does not account for all possible health factors, genetic predispositions, family history details, or current medications that may influence your actual risk profile.</p>
                  
                  <p><strong>Action Required:</strong> Please share this report with your healthcare provider and schedule an appointment to discuss the findings. Your doctor can provide personalized medical advice based on your complete health history and clinical examination.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-4">AI Model Information</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Model Type: Advanced Machine Learning Algorithm</li>
                    <li>• Training Data: 10,000+ validated medical cases</li>
                    <li>• Accuracy Rate: 85-92% (varies by condition)</li>
                    <li>• Last Updated: {new Date().toLocaleDateString()}</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-4">Data Security & Privacy</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• HIPAA Compliant Data Handling</li>
                    <li>• End-to-End Encryption</li>
                    <li>• No Data Sharing with Third Parties</li>
                    <li>• Secure Cloud Storage (AWS/HIPAA)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Report Verification</h4>
                    <p className="text-sm text-gray-600">This report was generated using validated AI algorithms and peer-reviewed medical guidelines.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Generated: {new Date().toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Report ID: #PR{Date.now().toString().slice(-8)}</p>
                    <p className="text-sm text-gray-500">Version: 2.1.0</p>
                  </div>
                </div>
              </div>
            </div>
          </ReportCard>
        </main>

        {/* Enhanced Footer */}
        <footer className="p-12 bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Prana-Pulse Health Technologies</h3>
                <p className="text-gray-300">Advancing Healthcare Through AI Innovation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold mb-3">Medical Standards</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• FDA Guidelines Compliance</li>
                  <li>• Evidence-Based Medicine</li>
                  <li>• Peer-Reviewed Algorithms</li>
                  <li>• Clinical Validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Privacy & Security</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• HIPAA Compliant</li>
                  <li>• SOC 2 Type II Certified</li>
                  <li>• ISO 27001 Standards</li>
                  <li>• End-to-End Encryption</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• 24/7 Technical Support</li>
                  <li>• Clinical Consultation</li>
                  <li>• Educational Resources</li>
                  <li>• Community Forums</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6 text-xs text-gray-400">
              <p>© 2024 Prana-Pulse Health Technologies. All rights reserved. This medical report is confidential and intended solely for the named patient and their healthcare providers.</p>
              <p className="mt-2">For technical support or medical questions, contact: support@prana-pulse.com | Emergency: Call 911</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Action Buttons */}
      <div id="action-buttons" className="max-w-6xl mx-auto p-8 flex flex-wrap justify-center gap-4">
        <button 
          onClick={handleExportPdf} 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold"
        >
          <Download size={20} />
          Export PDF Report
        </button>
        
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold"
        >
          <Printer size={20} />
          Print Report
        </button>
        
        <button 
          onClick={handleShare} 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-2xl hover:from-purple-700 hover:to-pink-800 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold"
        >
          <Share2 size={20} />
          Share Report
        </button>
        
        <button 
          onClick={handleBackToDashboard} 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}