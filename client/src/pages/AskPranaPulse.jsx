import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Copy, CheckCheck, RotateCcw, Trash2, MapPin, Heart, Activity, Brain, Stethoscope, Pill } from 'lucide-react';

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

export  function AskPranaPulse() {
  // State management for messages, input, loading, etc.
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('');
  
  // Refs for DOM elements
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Pre-defined health query suggestions for user interaction
  const healthQueries = [
    { icon: Heart, text: "Heart health checkup", category: "cardiology" },
    { icon: Activity, text: "Diabetes management", category: "endocrinology" },
    { icon: Brain, text: "Mental wellness", category: "psychology" },
    { icon: Stethoscope, text: "General health screening", category: "general" },
    { icon: Pill, text: "Medication guidance", category: "pharmacy" }
  ];

  // Function to automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect to scroll to bottom whenever messages state updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // The initial greeting message from the bot
  const greetingMessage = `👋 **Welcome to Prana-Pulse AI!**

I'm your personal health and wellness companion, powered by advanced AI. I'm here to help you explore:

🏥 **Health Questions** - Medical insights, symptoms, treatments
💪 **Fitness & Nutrition** - Workout plans, diet advice, wellness tips  
🧠 **Mental Wellness** - Stress management, mindfulness, mental health
🩺 **Preventive Care** - Health screenings, lifestyle improvements
💊 **Medication Info** - Drug interactions, side effects, alternatives

**What health topic would you like to explore today?** I'm excited to help you on your wellness journey! 

*Please remember: I provide information for educational purposes. Always consult healthcare professionals for medical decisions.*`;

  // Function to get the user's geographical location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Fallback to a default location if access is denied
          setUserLocation({
            latitude: 17.4065, // Hyderabad coordinates as fallback
            longitude: 78.4772,
            city: 'Hyderabad'
          });
        }
      );
    }
  };

  // useEffect for initial setup on component mount
  useEffect(() => {
    getUserLocation();
    
    // Trigger page loaded state for animations
    const pageLoadTimer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 500);

    // Typing effect for the initial greeting message
    const startTyping = setTimeout(() => {
      const words = greetingMessage.split(' ');
      let currentIndex = 0;
      let currentText = '';
      
      const typeWriter = setInterval(() => {
        if (currentIndex < words.length) {
          currentText += (currentIndex === 0 ? '' : ' ') + words[currentIndex];
          setMessages(prev => prev.map(msg => 
            msg.id === 1 ? { ...msg, content: currentText } : msg
          ));
          currentIndex++;
        } else {
          setMessages(prev => prev.map(msg => 
            msg.id === 1 ? { ...msg, isTyping: false } : msg
          ));
          clearInterval(typeWriter);
        }
      }, 80);

      return () => clearInterval(typeWriter);
    }, 1000);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(pageLoadTimer);
      clearTimeout(startTyping);
    };
  }, []);

  // Function to format message content with Markdown-like syntax to HTML
  const formatMessage = (text) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4 border-l-4 border-blue-500"><pre><code class="text-sm">$2</code></pre></div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 bg-yellow-50 px-1 rounded">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono border">$1</code>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2 border-b-2 border-blue-200 pb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-4 mb-3 text-blue-700">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-3 text-blue-800">$1</h1>')
      .replace(/🏥|💪|🧠|🩺|💊|👋|❤️|⚠️|🔄|📍|🏃‍♂️|🥗|💭|🌟/g, '<span class="text-xl inline-block mx-1">$&</span>')
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc my-2 text-gray-700 leading-relaxed">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal my-2 text-gray-700 leading-relaxed">$1</li>')
      .replace(/\*\*Note:\*\*(.*)/g, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3 rounded-r-lg"><strong class="text-yellow-800">Note:</strong><span class="text-yellow-700">$1</span></div>')
      .replace(/\*\*Warning:\*\*(.*)/g, '<div class="bg-red-50 border-l-4 border-red-400 p-3 my-3 rounded-r-lg"><strong class="text-red-800">Warning:</strong><span class="text-red-700">$1</span></div>')
      .replace(/\n/g, '<br />');
  };

  // Function to copy message text to clipboard
  const copyToClipboard = async (text, messageId) => {
    try {
      const plainText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      const textArea = document.createElement("textarea");
      textArea.value = plainText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Main function to send a message to the AI and get a response
  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // FIX: Use process.env for broader compatibility instead of import.meta.env
    const API_KEY = process.env.VITE_OPENROUTER_API_KEY;

    try {
      // System prompt to guide the AI's behavior
      const systemPrompt = `You are Prana-Pulse AI, an expert health and wellness assistant. Provide comprehensive, well-structured, and empathetic health information. 
      Guidelines:
      - Use clear headings (##) for main topics
      - Use bullet points (-) for lists
      - Use **bold** for important terms
      - Include relevant emojis naturally
      - Always remind users to consult healthcare professionals
      - Be conversational, supportive, and encouraging
      - Provide actionable advice when appropriate
      - Use **Note:** for important disclaimers
      - Use **Warning:** for serious health concerns
      Format your responses with proper structure and spacing for easy reading.`;

      // API call is now made directly to the OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3-8b-instruct",
          "messages": [
            { "role": "system", "content": systemPrompt },
            ...messages.filter(m => m.type !== 'bot' || m.id === 1).slice(-10).map(m => ({
              "role": m.type === 'user' ? 'user' : 'assistant',
              "content": m.content.replace(/<[^>]*>/g, '')
            })),
            { "role": "user", "content": messageText }
          ],
          "temperature": 0.7,
          "max_tokens": 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `## ⚠️ Connection Issue

I'm experiencing connectivity problems right now. This could be due to:

- Network connectivity issues
- API service temporary unavailability  
- An incorrect or missing API Key in your .env.local file.

**Please try again in a moment.** I'm here and ready to help with your health questions! 💙

*In the meantime, remember that for urgent health concerns, please contact your healthcare provider directly.*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for quick query buttons
  const handleQuickQuery = (query) => {
    setInputMessage(query);
    setTimeout(() => {
      sendMessage(query);
    }, 100);
  };

  // Function to show the modal for finding nearby treatment centers
  const showNearbyTreatmentCenters = (condition) => {
    setSelectedCondition(condition);
    setShowLocationModal(true);
  };

  // Function to regenerate the last bot response
  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
    if (!lastUserMessage) return;

    setMessages(prev => prev.filter(m => m.id !== Math.max(...prev.filter(m => m.type === 'bot').map(m => m.id))));
    
    setTimeout(() => sendMessage(lastUserMessage.content), 100);
  };

  // Handler for key presses in the input area (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `## 🔄 Fresh Start!

I'm ready to help with any health or wellness questions you have. 

**What would you like to explore today?**

- Heart health and cardiovascular care
- Diabetes management and nutrition
- Mental wellness and stress management  
- General health screenings
- Medication guidance and interactions

Feel free to ask me anything about your health! 💙`,
        timestamp: new Date()
      }
    ]);
  };

  // Function to delete a specific message
  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Loading screen displayed before the main app is ready
  if (!isPageLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="text-center space-y-8 animate-in fade-in duration-1000">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl mx-auto animate-bounce">
              <HeartPulseIcon size={36} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700 delay-300">
              Prana-Pulse AI
            </h1>
            <p className="text-gray-600 animate-in slide-in-from-bottom duration-700 delay-500">
              Initializing your intelligent health companion...
            </p>
          </div>
          <LoadingDots />
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg animate-in slide-in-from-top duration-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg animate-in zoom-in duration-500">
                <HeartPulseIcon size={22} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="animate-in slide-in-from-left duration-700 delay-200">
              <h1 className="text-2xl font-bold text-gray-800">Prana-Pulse AI</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Your Intelligent Health & Wellness Companion
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 animate-in slide-in-from-right duration-700 delay-300">
            <button
              onClick={() => showNearbyTreatmentCenters('diabetes')}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105 text-sm font-medium text-blue-700 flex items-center gap-2"
              title="Find Diabetes Centers"
            >
              <Activity size={16} />
              Diabetes Centers
            </button>
            <button
              onClick={() => showNearbyTreatmentCenters('heart')}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-all hover:scale-105 text-sm font-medium text-red-700 flex items-center gap-2"
              title="Find Heart Centers"
            >
              <Heart size={16} />
              Heart Centers
            </button>
            <button
              onClick={regenerateResponse}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-105"
              title="Regenerate Response"
              disabled={isLoading}
            >
              <RotateCcw size={16} className="text-gray-600" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-105"
              title="New Chat"
            >
              <Trash2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Health Query Suggestions Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 animate-in slide-in-from-top duration-700 delay-200">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-600 mb-3 font-medium">Quick Health Queries:</p>
          <div className="flex flex-wrap gap-2">
            {healthQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(query.text)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md animate-in slide-in-from-left duration-500"
                style={{ animationDelay: `${index * 100 + 400}ms` }}
              >
                <query.icon size={14} />
                {query.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Display Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 animate-in slide-in-from-bottom duration-700 delay-400"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`group flex items-start gap-4 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              } animate-in slide-in-from-bottom duration-500`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 shadow-lg transition-transform hover:scale-105 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
              }`}>
                {message.type === 'user' ? <User size={16} /> : <HeartPulseIcon size={16} />}
              </div>

              <div className={`flex-1 max-w-4xl ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-6 py-4 rounded-3xl transition-all hover:shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white border border-blue-100 text-gray-800 shadow-md hover:border-blue-200 hover:shadow-xl'
                }`}>
                  <div 
                    className={`leading-relaxed text-left ${message.type === 'user' ? 'text-white' : ''}`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  {message.isTyping && (
                    <div className="mt-3">
                      <LoadingDots />
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                  message.type === 'user' ? 'justify-end' : ''
                }`}>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <CheckCheck size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-gray-500" />
                    )}
                  </button>
                  {message.id !== 1 && (
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 transition-all hover:scale-110 active:scale-95 shadow-sm"
                      title="Delete message"
                    >
                      <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <HeartPulseIcon size={16} />
              </div>
              <div className="bg-white border border-blue-100 rounded-3xl px-6 py-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <LoadingDots />
                  <span className="text-sm text-gray-600 animate-pulse">Analyzing your health question...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-5 shadow-2xl animate-in slide-in-from-bottom duration-700 delay-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your health, fitness, nutrition, symptoms, or wellness concerns..."
                className="w-full px-6 py-4 rounded-3xl border-2 border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none bg-white shadow-lg transition-all placeholder-gray-500 hover:border-blue-300 text-gray-800"
                rows="1"
                style={{ minHeight: '56px', maxHeight: '140px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                }}
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {inputMessage.length}/2000
              </div>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading || inputMessage.length > 2000}
              className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? <Spinner /> : <Send size={20} />}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2">
            💡 Press Enter to send • Shift+Enter for new line • Always consult healthcare professionals for medical decisions
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">
                {selectedCondition === 'diabetes' ? 'Diabetes' : 'Heart'} Treatment Centers
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Finding nearby {selectedCondition} treatment centers and specialists based on your location...
            </p>
            <div className="space-y-3">
              {userLocation ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">📍 Location detected!</p>
                  <p className="text-green-700 text-sm mt-1">
                    {userLocation.city || 'Your current location'}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <h4 className="font-medium text-gray-800">🏥 Apollo Hospitals</h4>
                      <p className="text-sm text-gray-600">Comprehensive {selectedCondition} care • 2.3 km away</p>
                      <p className="text-xs text-blue-600 mt-1">Rating: 4.5/5 ⭐</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <h4 className="font-medium text-gray-800">🏥 Care Hospitals</h4>
                      <p className="text-sm text-gray-600">Specialized {selectedCondition} treatment • 3.1 km away</p>
                      <p className="text-xs text-blue-600 mt-1">Rating: 4.3/5 ⭐</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <h4 className="font-medium text-gray-800">🏥 KIMS Hospitals</h4>
                      <p className="text-sm text-gray-600">Advanced {selectedCondition} center • 4.2 km away</p>
                      <p className="text-xs text-blue-600 mt-1">Rating: 4.4/5 ⭐</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">🔍 Searching for centers...</p>
                  <div className="mt-2">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const query = `Find me the best ${selectedCondition} treatment centers and specialists near my location with contact details and ratings`;
                  setShowLocationModal(false);
                  handleQuickQuery(query);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
              >
                Get Detailed Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
