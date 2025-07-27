// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   FileText, ArrowLeft, Download, Printer, User, Calendar, Stethoscope, Clock, Heart,
//   Activity, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Utensils, Target, Shield,
//   Dumbbell, Moon, Brain, Sparkles
// } from 'lucide-react';

// // --- Helper Components for Enhanced UI ---
// const FlexibleSection = ({ data, renderObject, renderString }) => {
//   if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
//     return renderObject(data);
//   }
//   if (typeof data === 'string') {
//     return renderString(data);
//   }
//   return <p className="text-blue-400 text-sm">No detailed information available.</p>;
// };

// const MarkdownRenderer = ({ text }) => {
//   const lines = text.split('\n').map((line, index) => {
//     if (line.trim().startsWith('- ')) {
//       return <li key={index} className="text-blue-600 text-sm leading-relaxed ml-4">{line.substring(2)}</li>;
//     }
//     if (line.match(/^(Day \d:|Breakfast:|Lunch:|Dinner:)/)) {
//       return <p key={index} className="font-semibold text-blue-800 mt-3 mb-1">{line}</p>;
//     }
//     if (line.trim() === '') {
//       return <div key={index} className="h-2"></div>;
//     }
//     return <p key={index} className="text-blue-700 text-sm leading-relaxed mb-2">{line}</p>;
//   });
//   return <div className="space-y-1">{lines}</div>;
// };


// export const ReportPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // --- Get REAL data from the navigation state ---
//   const llmResponse = location.state?.llmResponse;
//   const userInputs = location.state?.userInputs;
//   const userDetails = location.state?.userDetails;

//   const handleBack = () => navigate('/assessment');
//   const handlePrint = () => window.print();
//   const handleDownload = () => { /* ... as before ... */ };

//   if (!llmResponse || !userDetails || !userInputs) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
//         <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
//         <h1 className="text-2xl font-bold text-slate-800">Report Data Missing</h1>
//         <p className="text-slate-600 mt-2">Could not load the report. Please complete an assessment first.</p>
//         <button onClick={handleBack} className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//           <ArrowLeft className="h-5 w-5" />
//           <span>Start New Assessment</span>
//         </button>
//       </div>
//     );
//   }

//   const isHeartAssessment = userDetails.assessmentType === 'heart';
//   const riskScore = llmResponse.risk_score;
//   const riskLevel = riskScore < 0.3 ? 'Low' : riskScore < 0.7 ? 'Moderate' : 'High';
//   const riskColor = riskScore < 0.3 ? 'text-green-600' : riskScore < 0.7 ? 'text-amber-600' : 'text-red-600';
//   const riskBgColor = riskScore < 0.3 ? 'bg-green-50' : riskScore < 0.7 ? 'bg-amber-50' : 'bg-red-50';
//   const riskBorderColor = riskScore < 0.3 ? 'border-green-200' : riskScore < 0.7 ? 'border-amber-200' : 'border-red-200';

//   const heartParameterLabels = {
//     age: 'Age (years)', sex: 'Sex', cp: 'Chest Pain Type', trestbps: 'Resting BP (mmHg)',
//     chol: 'Cholesterol (mg/dl)', fbs: 'Fasting Blood Sugar > 120mg/dl', restecg: 'Resting ECG',
//     thalach: 'Max Heart Rate Achieved', exang: 'Exercise-Induced Angina', oldpeak: 'ST Depression',
//     slope: 'ST Segment Slope', ca: 'Major Vessels Colored', thal: 'Thalassemia Result'
//   };

//   const diabetesParameterLabels = {
//     gender: 'Gender', age: 'Age (years)', hypertension: 'Hypertension History', heart_disease: 'Heart Disease History',
//     smoking_history: 'Smoking History', bmi: 'Body Mass Index (BMI)', HbA1c_level: 'HbA1c Level (%)',
//     blood_glucose_level: 'Blood Glucose (mg/dl)'
//   };

//   const parameterLabels = isHeartAssessment ? heartParameterLabels : diabetesParameterLabels;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleBack}
//               className="p-2 hover:bg-blue-50 rounded-full transition-colors"
//             >
//               <ArrowLeft className="h-5 w-5 text-blue-600" />
//             </button>
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
//                 <Activity className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-blue-900">Prana-Pulse</h1>
//                 <p className="text-sm text-blue-600">Health Assessment Report</p>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleDownload}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
//             >
//               <Download className="h-4 w-4" /> Download
//             </button>
//             <button
//               onClick={handlePrint}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
//             >
//               <Printer className="h-4 w-4" /> Print
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto p-6 lg:p-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Main Content Column */}
//           <div className="lg:col-span-2 flex flex-col gap-8">

//             {/* Report Header Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
//                 <div className="flex flex-wrap items-center justify-between gap-6">
//                   <div className="flex items-center gap-6">
//                     <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
//                       {isHeartAssessment ? <Heart className="h-8 w-8 text-white" /> : <Activity className="h-8 w-8 text-white" />}
//                     </div>
//                     <div>
//                       <h2 className="text-2xl font-bold">{isHeartAssessment ? 'Heart Disease' : 'Diabetes'} Risk Assessment</h2>
//                       <p className="text-blue-100 mt-1">Comprehensive AI-Powered Health Analysis</p>
//                     </div>
//                   </div>
//                   <div className={`text-center px-6 py-4 rounded-xl border-2 bg-white ${riskBorderColor}`}>
//                     <p className="text-sm font-semibold text-blue-600 mb-1">Risk Score</p>
//                     <div className={`text-3xl font-bold ${riskColor}`}>{(riskScore * 100).toFixed(1)}%</div>
//                     <div className={`text-sm font-bold ${riskColor}`}>{riskLevel} Risk</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
//                     <User className="h-5 w-5 text-blue-600" />
//                     <div>
//                       <span className="text-blue-600 text-sm">Patient Name</span>
//                       <p className="font-semibold text-blue-900">{userDetails.name}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
//                     <Calendar className="h-5 w-5 text-blue-600" />
//                     <div>
//                       <span className="text-blue-600 text-sm">Assessment Date</span>
//                       <p className="font-semibold text-blue-900">{new Date().toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
//                   <h3 className="text-lg font-semibold mb-3 flex items-center gap-3 text-blue-900">
//                     <Sparkles className="h-5 w-5 text-blue-600" />
//                     AI Clinical Assessment
//                   </h3>
//                   <p className="text-blue-800 leading-relaxed">{llmResponse.explanation.risk_assessment}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Recommendations Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Diet Plan Card */}
//               <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white">
//                   <h3 className="text-lg font-semibold flex items-center gap-3">
//                     <Utensils className="h-6 w-6" />
//                     Personalized Nutrition Plan
//                   </h3>
//                 </div>
//                 <div className="p-6">
//                   <FlexibleSection
//                     data={llmResponse.explanation.diet_plan}
//                     renderObject={(data) => (
//                       <div className="space-y-5">
//                         {Object.entries(data).map(([meal, plan]) => (
//                           <div key={meal} className="border-l-4 border-green-200 pl-4">
//                             <p className="font-bold text-blue-900 capitalize mb-2 text-lg">{meal}</p>
//                             <p className="text-blue-700 text-sm leading-relaxed">{plan}</p>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     renderString={(data) => <MarkdownRenderer text={data} />}
//                   />
//                 </div>
//               </div>

//               {/* Lifestyle Recommendations Card */}
//               <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
//                 <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
//                   <h3 className="text-lg font-semibold flex items-center gap-3">
//                     <Target className="h-6 w-6" />
//                     Lifestyle Recommendations
//                   </h3>
//                 </div>
//                 <div className="p-6 space-y-5">
//                   <FlexibleSection
//                     data={llmResponse.explanation.lifestyle_recommendations}
//                     renderObject={(data) =>
//                       Object.entries(data).map(([category, recommendation]) => (
//                         <div key={category} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
//                           <div className="mt-1 p-2 bg-orange-100 rounded-lg">
//                             {category.toLowerCase().includes('activity') ?
//                               <Dumbbell className="h-5 w-5 text-orange-600" /> :
//                               category.toLowerCase().includes('sleep') ?
//                                 <Moon className="h-5 w-5 text-orange-600" /> :
//                                 <Brain className="h-5 w-5 text-orange-600" />
//                             }
//                           </div>
//                           <div className="flex-1">
//                             <p className="font-bold text-blue-900 mb-1">{category}</p>
//                             <p className="text-blue-700 text-sm leading-relaxed">{recommendation}</p>
//                           </div>
//                         </div>
//                       ))
//                     }
//                     renderString={(data) => <MarkdownRenderer text={data} />}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Column */}
//           <div className="lg:col-span-1 flex flex-col gap-8">
//             {/* Patient Information Card */}
//             <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white">
//                 <h3 className="text-lg font-semibold flex items-center gap-3">
//                   <BarChart3 className="h-6 w-6" />
//                   Patient Information
//                 </h3>
//               </div>
//               <div className="p-5">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-blue-100">
//                         <th className="text-left py-3 font-semibold text-blue-700">Parameter</th>
//                         <th className="text-right py-3 font-semibold text-blue-700">Value</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-blue-50">
//                       {Object.entries(userInputs).map(([key, value]) => (
//                         <tr key={key} className="hover:bg-blue-25">
//                           <td className="py-3 text-blue-600">
//                             {parameterLabels[key] || key.replace(/_/g, ' ')}
//                           </td>
//                           <td className="py-3 text-right font-semibold text-blue-900">
//                             {String(value)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             {/* Risk Factor Analysis Card */}
//             <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white">
//                 <h3 className="text-lg font-semibold flex items-center gap-3">
//                   <TrendingUp className="h-6 w-6" />
//                   Risk Factor Analysis
//                 </h3>
//               </div>
//               <div className="p-5 space-y-4">
//                 <FlexibleSection
//                   data={llmResponse.explanation.key_factors_analysis}
//                   renderObject={(data) =>
//                     Object.entries(data).map(([factor, analysis]) => (
//                       <div key={factor} className="border-l-4 border-purple-200 pl-4 py-3 bg-purple-25 rounded-r-lg">
//                         <div className="font-semibold text-blue-900 capitalize mb-1">
//                           {factor.replace(/_/g, ' ')}
//                         </div>
//                         <div className="text-blue-700 text-sm leading-relaxed">
//                           {analysis}
//                         </div>
//                       </div>
//                     ))
//                   }
//                   renderString={(data) => <MarkdownRenderer text={data} />}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-blue-100 text-center">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
//               <Activity className="h-5 w-5 text-white" />
//             </div>
//             <span className="text-xl font-bold text-blue-900">Prana-Pulse</span>
//           </div>
//           <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-2">
//             <Shield className="h-5 w-5" />
//             <span>This AI-generated report is for informational purposes only</span>
//           </div>
//           <p className="text-xs text-blue-500">
//             Please consult with a qualified healthcare professional for proper medical diagnosis and treatment.
//           </p>
//         </footer>
//       </main>

//       <style>{`
//         @media print {
//           body { -webkit-print-color-adjust: exact; color-adjust: exact; }
//           .print\\:hidden { display: none !important; }
//           .print\\:shadow-none { box-shadow: none !important; }
//           .print\\:border-0 { border: none !important; }
//           .print\\:bg-white { background-color: white !important; }
//         }
//       `}</style>
//     </div>
//   );
// };
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, ArrowLeft, Download, Printer, User, Calendar, Stethoscope, Clock, Heart,
  Activity, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Utensils, Target, Shield,
  Dumbbell, Moon, Brain, Sparkles
} from 'lucide-react';

// --- Helper Components for Enhanced UI ---

// This component now intelligently renders different data structures from the LLM
const FlexibleSection = ({ data, renderObject, renderString }) => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return renderObject(data);
  }
  if (typeof data === 'string') {
    return renderString(data);
  }
  return <p className="text-blue-400 text-sm">No detailed information available.</p>;
};

// This component now handles basic markdown-like formatting from the LLM string response
const MarkdownRenderer = ({ text }) => {
  const cleanText = text.replace(/\*\*/g, ''); // Remove all asterisks
  const lines = cleanText.split('\n').map((line, index) => {
    // Handle bullet points
    if (line.trim().startsWith('- ')) {
      return (
        <li key={index} className="text-blue-700 text-sm leading-relaxed ml-4 list-disc">
          {line.substring(2)}
        </li>
      );
    }
    // Handle bolded titles like "Day X:", "Breakfast:", etc.
    if (line.match(/^(Day \d:|Breakfast:|Lunch:|Dinner:)/)) {
      return <p key={index} className="font-semibold text-blue-900 mt-3 mb-1 text-base">{line}</p>;
    }
    // Handle empty lines for spacing
    if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }
    // Handle regular text lines
    return <p key={index} className="text-blue-800 text-sm leading-relaxed mb-2">{line}</p>;
  });
  return <div className="space-y-1">{lines}</div>;
};

// This component specifically formats the structured diet plan object
const DietPlanRenderer = ({ data }) => {
  const parseMealPlan = (mealText) => {
    const dayPattern = /Day (\d+):\s*([^;]+)(?:;|$)/g;
    const days = [];
    let match;
    while ((match = dayPattern.exec(mealText)) !== null) {
      days.push({
        day: parseInt(match[1]),
        description: match[2].trim()
      });
    }
    return days;
  };

  return (
    <div className="space-y-5">
      {Object.entries(data).map(([meal, plan]) => {
        const days = parseMealPlan(plan);
        return (
          <div key={meal} className="bg-blue-25 rounded-xl p-4 border border-blue-100">
            <h4 className="font-bold text-blue-900 text-md mb-3 flex items-center gap-2">
              {meal === 'Breakfast' && '🌅'}
              {meal === 'Lunch' && '☀️'} 
              {meal === 'Dinner' && '�'}
              {meal}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {days.map((dayInfo) => (
                <div key={dayInfo.day} className="bg-white rounded-lg p-3 border-l-4 border-blue-400 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Day {dayInfo.day}
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm leading-relaxed">{dayInfo.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Get REAL data from the navigation state ---
  const llmResponse = location.state?.llmResponse;
  const userDetails = location.state?.userDetails;
  const userInputs = location.state?.userInputs;

  const handleBack = () => navigate('/assessment');
  const handlePrint = () => window.print();
  const handleDownload = () => { /* ... download logic ... */ };

  if (!llmResponse || !userDetails || !userInputs) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Report Data Missing</h1>
        <p className="text-slate-600 mt-2">Could not load the report. Please complete an assessment first.</p>
        <button onClick={handleBack} className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <ArrowLeft className="h-5 w-5" />
          <span>Start New Assessment</span>
        </button>
      </div>
    );
  }

  const isHeartAssessment = userDetails.assessmentType === 'heart';
  const riskScore = llmResponse.risk_score;
  const riskLevel = riskScore < 0.3 ? 'Low' : riskScore < 0.7 ? 'Moderate' : 'High';
  const riskColor = riskScore < 0.3 ? 'text-green-600' : riskScore < 0.7 ? 'text-amber-600' : 'text-red-600';
  const riskBorderColor = riskScore < 0.3 ? 'border-green-200' : riskScore < 0.7 ? 'border-amber-200' : 'border-red-200';

  const heartParameterLabels = {
    age: 'Age (years)', sex: 'Sex', cp: 'Chest Pain Type', trestbps: 'Resting BP (mmHg)',
    chol: 'Cholesterol (mg/dl)', fbs: 'Fasting Blood Sugar > 120mg/dl', restecg: 'Resting ECG',
    thalach: 'Max Heart Rate Achieved', exang: 'Exercise-Induced Angina', oldpeak: 'ST Depression',
    slope: 'ST Segment Slope', ca: 'Major Vessels Colored', thal: 'Thalassemia Result'
  };

  const diabetesParameterLabels = {
    gender: 'Gender', age: 'Age (years)', hypertension: 'Hypertension History', heart_disease: 'Heart Disease History',
    smoking_history: 'Smoking History', bmi: 'Body Mass Index (BMI)', HbA1c_level: 'HbA1c Level (%)',
    blood_glucose_level: 'Blood Glucose (mg/dl)'
  };

  const parameterLabels = isHeartAssessment ? heartParameterLabels : diabetesParameterLabels;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Prana-Pulse</h1>
                <p className="text-sm text-blue-600">Health Assessment Report</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Report Header Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      {isHeartAssessment ? <Heart className="h-7 w-7 text-white" /> : <Activity className="h-7 w-7 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{isHeartAssessment ? 'Heart Disease' : 'Diabetes'} Risk Assessment</h2>
                      <p className="text-blue-100 mt-1 text-sm">Comprehensive AI-Powered Health Analysis</p>
                    </div>
                  </div>
                  <div className={`text-center px-5 py-3 rounded-xl border-2 bg-white ${riskBorderColor} min-w-fit`}>
                    <p className="text-xs font-semibold text-blue-600 mb-1">Risk Score</p>
                    <div className={`text-2xl font-bold ${riskColor}`}>{(riskScore * 100).toFixed(1)}%</div>
                    <div className={`text-xs font-bold ${riskColor}`}>{riskLevel} Risk</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-blue-600 text-xs font-medium">Patient Name</span>
                      <p className="font-semibold text-blue-900 text-sm">{userDetails.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-blue-600 text-xs font-medium">Assessment Date</span>
                      <p className="font-semibold text-blue-900 text-sm">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-3 text-blue-900">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    AI Clinical Assessment
                  </h3>
                  <p className="text-blue-800 leading-relaxed text-sm">{llmResponse.explanation.risk_assessment}</p>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diet Plan Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Utensils className="h-5 w-5"/>
                    Personalized Nutrition Plan
                  </h3>
                  <p className="text-green-100 text-xs mt-1">3-Day meal recommendations</p>
                </div>
                <div className="p-5">
                  <FlexibleSection
                    data={llmResponse.explanation.diet_plan}
                    renderObject={(data) => <DietPlanRenderer data={data} />}
                    renderString={(data) => <MarkdownRenderer text={data} />}
                  />
                </div>
              </div>

              {/* Lifestyle Recommendations Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5"/>
                    Lifestyle Recommendations
                  </h3>
                  <p className="text-orange-100 text-xs mt-1">Evidence-based lifestyle modifications</p>
                </div>
                <div className="p-5 space-y-4">
                  <FlexibleSection
                    data={llmResponse.explanation.lifestyle_recommendations}
                    renderObject={(data) => 
                      Object.entries(data).map(([category, recommendation]) => (
                        <div key={category} className="bg-orange-25 rounded-lg p-4 border border-orange-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              {category.toLowerCase().includes('activity') ? 
                                <Dumbbell className="h-4 w-4 text-orange-600"/> : 
                                category.toLowerCase().includes('sleep') ? 
                                <Moon className="h-4 w-4 text-orange-600"/> : 
                                <Brain className="h-4 w-4 text-orange-600"/>
                              }
                            </div>
                            <h4 className="font-semibold text-blue-900 text-sm">{category}</h4>
                          </div>
                          <p className="text-blue-700 text-xs leading-relaxed">{recommendation}</p>
                        </div>
                      ))
                    }
                    renderString={(data) => <MarkdownRenderer text={data} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:gap-8">
            {/* Patient Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5"/>
                  Patient Information
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {Object.entries(userInputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-blue-25 rounded-lg border border-blue-100">
                      <span className="text-blue-600 text-xs font-medium">
                        {parameterLabels[key] || key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-blue-900 text-xs">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Factor Analysis Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5"/>
                  Risk Factor Analysis
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <FlexibleSection 
                  data={llmResponse.explanation.key_factors_analysis}
                  renderObject={(data) => 
                    Object.entries(data).map(([factor, analysis]) => (
                      <div key={factor} className="border-l-4 border-purple-200 pl-3 py-2 bg-purple-25 rounded-r-lg">
                        <div className="font-semibold text-blue-900 capitalize mb-1 text-xs">
                          {factor.replace(/_/g, ' ')}
                        </div>
                        <div className="text-blue-700 text-xs leading-relaxed">
                          {analysis}
                        </div>
                      </div>
                    ))
                  }
                  renderString={(data) => <MarkdownRenderer text={data} />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 p-5 bg-white rounded-2xl shadow-lg border border-blue-100 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-blue-900">Prana-Pulse</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 mb-2">
            <Shield className="h-4 w-4" />
            <span>This AI-generated report is for informational purposes only</span>
          </div>
          <p className="text-xs text-blue-500">
            Please consult with a qualified healthcare professional for proper medical diagnosis and treatment.
          </p>
        </footer>
      </main>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:bg-white { background-color: white !important; }
        }
      `}</style>
    </div>
  );
};