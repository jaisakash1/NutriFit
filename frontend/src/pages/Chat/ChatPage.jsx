import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  Lightbulb,
  ArrowDown,
  Loader,
  Heart,
  Apple,
  Dumbbell,
  Bike,
  Salad,
  Brain
} from 'lucide-react';
import { chatAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Decorative background icons component
const BackgroundDecorations = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 text-pink-100/30 animate-pulse">
      <Heart size={20} />
    </div>
    <div className="absolute top-20 right-20 text-green-100/30 animate-pulse" style={{ animationDelay: '1s' }}>
      <Apple size={20} />
    </div>
    <div className="absolute bottom-20 left-[15%] text-blue-100/30 animate-pulse" style={{ animationDelay: '1.5s' }}>
      <Dumbbell size={20} />
    </div>
    <div className="absolute top-[40%] right-[10%] text-purple-100/30 animate-pulse" style={{ animationDelay: '2s' }}>
      <Brain size={20} />
    </div>
    <div className="absolute bottom-40 right-[25%] text-yellow-100/30 animate-pulse" style={{ animationDelay: '0.5s' }}>
      <Salad size={20} />
    </div>
    <div className="absolute top-[30%] left-[5%] text-cyan-100/30 animate-pulse" style={{ animationDelay: '2.5s' }}>
      <Bike size={20} />
    </div>
  </div>
);

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (page = 1, retryCount = 0) => {
    try {
      setLoadingHistory(true);
      const response = await chatAPI.getHistory({ page, limit: pagination.limit });
      
      if (response.data.success) {
        const { chatHistory, pagination: newPagination } = response.data;
        
        if (page === 1) {
          setMessages(chatHistory);
        } else {
          setMessages(prev => [...chatHistory, ...prev]);
        }
        
        setPagination(newPagination);
        setHasMore(page < newPagination.pages);
      } else {
        throw new Error(response.data.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      
      if (page === 1 && retryCount < 3) {
        console.log(`Retrying chat history load (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          loadChatHistory(page, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
      } else {
        toast.error('Failed to load chat history');
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMoreHistory = async () => {
    if (!hasMore || loading) return;
    await loadChatHistory(pagination.page + 1);
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatAPI.getSuggestions();
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (message = newMessage) => {
    if (!message.trim() || loading) return;

    setNewMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({ message: message.trim() });
      const { userMessage, aiMessage } = response.data.response;
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
        <BackgroundDecorations />
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    );
  }

  return (
    /* Outer wrapper: fills the space below the sticky navbar (h-16 = 4rem) */
    <div
      className="bg-gray-100 flex items-stretch justify-center"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <BackgroundDecorations />

      {/* Main Chat Container — full width on mobile, capped at 2xl on desktop */}
      <div className="w-full max-w-2xl flex flex-col bg-white shadow-2xl sm:my-4 sm:rounded-3xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">AI Health Assistant</h1>
              <p className="text-xs text-blue-200">Online · NutriFit AI</p>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50"
        >
          {hasMore && (
            <div className="flex justify-center mb-2">
              <Button
                onClick={loadMoreHistory}
                variant="outline"
                className="flex items-center space-x-1.5 text-xs py-1 px-3 bg-white/80"
              >
                <ArrowDown className="w-3 h-3" />
                <span>Load More</span>
              </Button>
            </div>
          )}

          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-20" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Start a conversation</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto px-2">
                I'm your personal AI health assistant, ready to help with diet, exercise, and wellness.
              </p>

              {/* Suggestions grid — 2 cols on sm+ */}
              {suggestions.length > 0 && (
                <div className="max-w-lg mx-auto px-2">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                    Suggested Topics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((category, index) => (
                      <div
                        key={index}
                        className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors text-left"
                      >
                        <h5 className="font-medium text-gray-800 mb-1.5 text-xs flex items-center">
                          {category.category === 'Diet'     && <Apple    className="w-3.5 h-3.5 mr-1.5 text-green-500" />}
                          {category.category === 'Exercise' && <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-blue-500" />}
                          {category.category === 'Health'   && <Heart    className="w-3.5 h-3.5 mr-1.5 text-pink-500" />}
                          {category.category === 'Progress' && <Brain    className="w-3.5 h-3.5 mr-1.5 text-purple-500" />}
                          {category.category}
                        </h5>
                        <div className="space-y-1">
                          {category.questions.map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => handleSuggestionClick(question)}
                              className="w-full text-left p-1.5 bg-gray-50 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-150 text-xs text-gray-700 leading-snug"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isUser = message.type === 'user';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-1.5 max-w-[85%] sm:max-w-[75%]`}>
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                        isUser
                          ? 'bg-gradient-to-br from-green-400 to-blue-500'
                          : 'bg-gradient-to-br from-purple-500 to-blue-600'
                      }`}>
                        {isUser
                          ? <User className="w-3 h-3 text-white" />
                          : <Bot  className="w-3 h-3 text-white" />
                        }
                      </div>

                      {/* Bubble */}
                      <div className={`px-3 py-2 rounded-2xl ${
                        isUser
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white shadow-sm border border-gray-100 text-gray-900 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.message}</p>
                        <p className={`text-[10px] mt-0.5 ${isUser ? 'text-blue-100 text-right' : 'text-gray-400'}`}>
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Loader className="w-3 h-3 text-white animate-spin" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-2">

          {/* Quick suggestion chips — horizontal scroll on mobile */}
          {messages.length > 0 && suggestions.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {suggestions.flatMap(category =>
                category.questions.slice(0, 1).map((question, index) => (
                  <button
                    key={`${category.category}-${index}`}
                    onClick={() => handleSuggestionClick(question)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors whitespace-nowrap"
                    disabled={loading}
                  >
                    <Lightbulb className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    <span className="max-w-[120px] truncate">{question}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Text input + send button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!newMessage.trim() || loading}
              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;