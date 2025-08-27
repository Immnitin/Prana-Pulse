import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config'; // Corrected the path to assume the file is in the same directory.
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ChevronLeft, Heart, Droplet, FileText, Frown, TrendingUp, Calendar, Activity, Shield, AlertCircle, CheckCircle2, BarChart3, PieChart, LineChart, Download, Filter, RefreshCw } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line, RadialBarChart, RadialBar } from 'recharts';

// --- Helper Functions ---
const getSeverity = (score) => {
    if (score <= 30) return 'low';
    if (score <= 70) return 'medium';
    return 'high';
};


// --- Chart Components ---

const RiskDistributionPieChart = ({ reports }) => {
    const data = [
        { name: 'Low Risk', value: reports.filter(r => r.status === 'low').length, color: '#10b981' },
        { name: 'Medium Risk', value: reports.filter(r => r.status === 'medium').length, color: '#f59e0b' },
        { name: 'High Risk', value: reports.filter(r => r.status === 'high').length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold text-sm">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} reports`, name]} />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};

const AssessmentTrendsChart = ({ reports }) => {
    const trendData = reports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(report => ({
            date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            riskScore: report.riskScore,
            assessment: report.type.includes('Heart') ? 'Heart' : 'Diabetes',
        }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Risk Score']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line
                    type="monotone"
                    dataKey="riskScore"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                />
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

const AssessmentTypeBarChart = ({ reports }) => {
    const typeData = reports.reduce((acc, report) => {
        const type = report.type.includes('Heart') ? 'Heart Disease' : 'Diabetes';
        const existing = acc.find(item => item.type === type);
        
        if (existing) {
            existing.total += 1;
            existing[report.status] = (existing[report.status] || 0) + 1;
        } else {
            acc.push({
                type,
                total: 1,
                low: report.status === 'low' ? 1 : 0,
                medium: report.status === 'medium' ? 1 : 0,
                high: report.status === 'high' ? 1 : 0,
            });
        }
        return acc;
    }, []);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const RiskScoreGauge = ({ score, type }) => {
    const data = [
        { name: 'Score', value: score, fill: score < 30 ? '#10b981' : score < 70 ? '#f59e0b' : '#ef4444' }
    ];

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="70%" innerRadius="80%" outerRadius="110%" data={data} startAngle={180} endAngle={0}>
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#eee' }} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                <div className="text-4xl font-bold text-gray-800">{score.toFixed(1)}%</div>
                <div className="text-sm text-gray-500 text-center">{type} Risk</div>
            </div>
        </div>
    );
};

// --- Enhanced UI Components ---

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin" style={{animationDelay: '75ms'}}></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading Your Health Dashboard...</p>
    </div>
);

const ReportCard = ({ report, index }) => {
    const isHeartReport = report.type.toLowerCase().includes('heart');
    const Icon = isHeartReport ? Heart : Droplet;
    const iconColor = isHeartReport ? 'text-red-500' : 'text-blue-500';
    const bgGradient = isHeartReport 
        ? 'bg-gradient-to-br from-red-50 to-pink-50' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50';

    const statusConfig = {
        low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle2 },
        medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: AlertCircle },
        high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: AlertCircle },
        default: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: Shield }
    };
    
    const status = statusConfig[report.status?.toLowerCase()] || statusConfig.default;
    const StatusIcon = status.icon;

    return (
        <div 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${bgGradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-7 h-7 ${iconColor}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300">{report.type}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{report.date}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border ${status.bg} ${status.text} ${status.border} shadow-sm`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{report.status || 'N/A'} Risk</span>
                    </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-inner">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
                        <span>Risk Score</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{report.riskScore.toFixed(1)}%</span>
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                report.riskScore < 30 ? 'bg-green-500' : 
                                report.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${report.riskScore}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const StatsCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "text-blue-600 bg-blue-100",
        green: "text-green-600 bg-green-100",
        red: "text-red-600 bg-red-100",
        purple: "text-purple-600 bg-purple-100"
    };
    
    return (
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0]}`} />
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
                <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
        </div>
    );
};

const EmptyState = ({ onNavigate }) => (
    <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden">
        <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                <Frown className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Reports Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't completed any health assessments yet. Start your first assessment to track your health journey.
            </p>
            <button
                onClick={onNavigate}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Activity className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Start Your First Assessment</span>
            </button>
        </div>
    </div>
);

// --- Main HealthReports Component ---

export function HealthReports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('analytics'); // 'list' or 'analytics'

    useEffect(() => {
        const fetchUserDataAndReports = async () => {
            setIsLoading(true);
            const user = auth.currentUser;
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                // Fetch user's name
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name || 'User');
                }

                // Fetch detailed reports from the subcollection
                const assessmentsColRef = collection(db, 'users', user.uid, 'assessments');
                const q = query(assessmentsColRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                
                const fetchedReports = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const riskScore = (data.risk_score || 0) * 100;
                    return {
                        id: doc.id,
                        type: data.assessmentType === 'heart' ? 'Heart Disease Assessment' : 'Diabetes Screening',
                        date: data.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        status: getSeverity(riskScore),
                        riskScore: riskScore,
                        value: `${riskScore.toFixed(1)}% Risk` // This is for display consistency
                    };
                });
                
                setReports(fetchedReports);

            } catch (error) {
                console.error("Error fetching user reports:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDataAndReports();
    }, [navigate]);

    const filteredReports = useMemo(() => {
        if (filter === 'all') return reports;
        return reports.filter(report => report.type.toLowerCase().includes(filter));
    }, [reports, filter]);

    const filterOptions = [
        { key: 'all', label: 'All Reports', icon: FileText },
        { key: 'heart', label: 'Heart Health', icon: Heart },
        { key: 'diabetes', label: 'Diabetes', icon: Droplet },
    ];

    const stats = useMemo(() => ({
        total: reports.length,
        lowRisk: reports.filter(r => r.status === 'low').length,
        mediumRisk: reports.filter(r => r.status === 'medium').length,
        highRisk: reports.filter(r => r.status === 'high').length
    }), [reports]);

    const avgHeartRiskScore = useMemo(() => 
        reports.filter(r => r.type.includes('Heart')).reduce((sum, r) => sum + r.riskScore, 0) / (reports.filter(r => r.type.includes('Heart')).length || 1)
    , [reports]);

    const avgDiabetesRiskScore = useMemo(() =>
        reports.filter(r => r.type.includes('Diabetes')).reduce((sum, r) => sum + r.riskScore, 0) / (reports.filter(r => r.type.includes('Diabetes')).length || 1)
    , [reports]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans animate-fadeIn">
            <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="group p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                                <ChevronLeft size={22} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-2xl text-gray-800">My Health Dashboard</h1>
                                    <p className="text-gray-500 text-sm">Welcome back, <span className="font-semibold text-blue-600">{userName}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                                <button onClick={() => setViewMode('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'analytics' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <BarChart3 className="w-4 h-4" /> Analytics
                                </button>
                                <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <FileText className="w-4 h-4" /> Reports
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {reports.length === 0 ? (
                    <EmptyState onNavigate={() => navigate('/new-assessment')} />
                ) : (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard title="Total Reports" value={stats.total} icon={FileText} color="blue" />
                            <StatsCard title="Low Risk" value={stats.lowRisk} icon={CheckCircle2} color="green" />
                            <StatsCard title="Medium Risk" value={stats.mediumRisk} icon={AlertCircle} color="purple" />
                            <StatsCard title="High Risk" value={stats.highRisk} icon={AlertCircle} color="red" />
                        </div>

                        {viewMode === 'analytics' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ChartCard title="Avg. Heart Disease Risk" icon={Heart}>
                                        <RiskScoreGauge score={avgHeartRiskScore} type="Heart Disease" />
                                    </ChartCard>
                                    <ChartCard title="Avg. Diabetes Risk" icon={Droplet}>
                                        <RiskScoreGauge score={avgDiabetesRiskScore} type="Diabetes" />
                                    </ChartCard>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ChartCard title="Risk Distribution" icon={PieChart}>
                                        <RiskDistributionPieChart reports={reports} />
                                    </ChartCard>
                                    <ChartCard title="Assessment Types" icon={BarChart3}>
                                        <AssessmentTypeBarChart reports={reports} />
                                    </ChartCard>
                                </div>
                                <ChartCard title="Risk Score Trends Over Time" icon={LineChart}>
                                    <AssessmentTrendsChart reports={reports} />
                                </ChartCard>
                            </div>
                        )}

                        {viewMode === 'list' && (
                            <>
                                <div className="mb-8">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 inline-block">
                                        <nav className="flex space-x-2" aria-label="Tabs">
                                            {filterOptions.map(option => (
                                                <button
                                                    key={option.key}
                                                    onClick={() => setFilter(option.key)}
                                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${filter === option.key ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                                                >
                                                    <option.icon className="w-4 h-4" /> {option.label}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {filteredReports.map((report, index) => (
                                        <ReportCard key={report.id} report={report} index={index} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.6s ease-in-out forwards; }
            `}</style>
        </div>
    );
}
