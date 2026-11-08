import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, StudentAnswers, HollandScoreResult, SchoolMajorRecord, WishItem } from '../types';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface AIChatPanelProps {
  profile: StudentProfile;
  answers: StudentAnswers;
  hollandResult?: HollandScoreResult;
  schoolsDatabase: SchoolMajorRecord[];
  currentWishes?: WishItem[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  profile,
  answers,
  hollandResult,
  schoolsDatabase,
  currentWishes = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Chào ${profile.fullName || 'em'}! Thầy Hùng và Trợ lý AI đã phân tích hồ sơ của em. Mã nhóm nghề Holland nổi trội của em là **${hollandResult?.hollandCodeString || '...'}**.\n\nEm đang băn khoăn về ngành nào hay cần tư vấn cách chọn trường, sắp xếp nguyện vọng phù hợp với năng lực của mình?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Vì sao em hợp với nhóm ngành này?',
    'So sánh ngành CNTT và Khoa học dữ liệu / AI',
    'Em nên xếp ngành nào lên Nguyện vọng 1?',
    'Nếu điểm thi thử thấp hơn dự kiến thì xử lý ra sao?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Send structured context to server route
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text })),
          context: {
            profile: {
              fullName: profile.fullName,
              className: profile.className,
              dob: profile.dob,
              schoolName: profile.schoolName,
              mockExamScore: profile.mockExamScore,
              preferredRegion: profile.preferredRegion,
              targetCareerThought: profile.targetCareerThought,
              certificatesTalents: profile.certificatesTalents,
              interests: profile.interests,
              scoresGrade10: profile.scoresGrade10,
              scoresGrade11Sem1: profile.scoresGrade11Sem1,
            },
            holland: hollandResult
              ? {
                  codeString: hollandResult.hollandCodeString,
                  top3: hollandResult.top3,
                  scores: hollandResult.scores,
                }
              : null,
            answers: {
              q11Strengths: answers.q11Strengths,
              q12ExpectedScore: answers.q12ExpectedScore,
              q13Location: answers.q13Location,
              q14CareerGoal: answers.q14CareerGoal,
              q15Attitude: answers.q15Attitude,
            },
            // Relevant schools in database
            matchedSchools: schoolsDatabase.slice(0, 25).map((s) => ({
              schoolName: s.schoolName,
              schoolCode: s.schoolCode,
              majorName: s.majorName,
              majorCode: s.majorCode,
              combinations: s.admissionCombinations,
              benchmarkScore: s.benchmarkScore,
              benchmarkYear: s.benchmarkYear,
              tuitionFeeText: s.tuitionFeeText,
            })),
            currentWishesCount: currentWishes.length,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Lỗi máy chủ (${response.status})`);
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Xin lỗi em, hiện tại thầy chưa nhận được phản hồi. Em thử đặt lại câu hỏi nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: unknown) {
      console.error('AI chat error:', err);
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setErrorMessage(msg);
      // Fallback friendly message
      const fallbackAiMsg: ChatMessage = {
        id: `ai-fallback-${Date.now()}`,
        sender: 'ai',
        text: `Chào em! Dựa trên mã Holland **${hollandResult?.hollandCodeString || 'của em'}**, em có thế mạnh rất lớn về tư duy phân tích và giải quyết vấn đề thực tế.\n\n• **Điểm mạnh:** Thích hợp với các ngành kỹ thuật công nghệ, phân tích dữ liệu, hoặc quản trị ứng dụng.\n• **Lời khuyên:** Em nên chọn các trường thuộc Đại học Huế (ĐH Khoa học, ĐH Sư phạm, ĐH Bách khoa ĐN...) để đảm bảo sự cân bằng học phí và khoảng cách.\n\n*Lưu ý: Luôn kiểm tra đề án tuyển sinh chính thức 2027 của từng trường em nhé.*\n\nEm muốn tìm hiểu sâu hơn về ngành nào trong danh sách trên?`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col h-[560px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base">Trợ lý AI Tư vấn Hướng nghiệp</h3>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-teal-200">
              Đồng hành cùng Lớp Toán Thầy Hùng • Phục vụ tuyển sinh 2027
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'ai',
                text: `Chào ${profile.fullName || 'em'}! Thầy đã sẵn sàng giải đáp thêm các câu hỏi về ngành học và xếp nguyện vọng. Em muốn trao đổi về vấn đề gì?`,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Xóa lịch sử chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-2xs ${
                  isAI
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    isAI ? 'text-slate-400 dark:text-slate-500' : 'text-blue-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2 bg-white dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-4 h-4 text-teal-500 animate-spin" />
            <span>Trợ lý AI đang tra cứu cơ sở dữ liệu và suy nghĩ lời khuyên...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Đã dùng câu trả lời dự phòng do kết nối mạng bận. Em vẫn có thể tiếp tục hỏi nhé!</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-1">
          Gợi ý nhanh:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Nhập câu hỏi cho Trợ lý AI (ví dụ: Em nên chọn trường nào ở Huế?)..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
