import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, Send, Brain, ArrowDown, HelpCircle, 
  BookOpen, Calculator, Volume2, Calendar, RefreshCw, Star, Trash2, FolderSync, History, Bookmark, CheckCircle,
  MessageSquare, Clock, Image as ImageIcon, X
} from 'lucide-react';
import { Question, AiChatMessage, AiChatSession } from '../types';

interface AiTutorViewProps {
  currentUsername: string;
  activeQuestion?: Question | null;
  onClearActiveQuestion?: () => void;
  savedSessions?: AiChatSession[];
  onSaveAiSession?: (s: AiChatSession) => void;
  onDeleteSavedAiSession?: (id: string) => void;
}

// Utility to clean raw LaTeX and double/single dollar sign math delimiters into clear human standard formulas
function cleanMathText(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // 1. Convert LaTeX fractions recursively: \frac{a}{b} -> (a)/(b)
  for (let i = 0; i < 5; i++) {
    const nextCleaned = cleaned.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1)/($2)');
    if (nextCleaned === cleaned) break;
    cleaned = nextCleaned;
  }

  // 2. Convert LaTeX formatting markers: \mathbf{x} -> **x**, \mathrm{x} -> x
  cleaned = cleaned.replace(/\\mathrm\s*\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathbf\s*\{([^}]+)\}/g, '**$1**');
  cleaned = cleaned.replace(/\\text\s*\{([^}]+)\}/g, '$1');

  // 3. Convert square roots \sqrt{x} -> √(x)
  cleaned = cleaned.replace(/\\sqrt\s*\{([^}]+)\}/g, '√($1)');

  // 4. Multi-system symbol replacements for clear rendering
  const mathSymbols: Record<string, string> = {
    '\\times': ' × ',
    '\\cdot': ' · ',
    '\\div': ' ÷ ',
    '\\pm': ' ± ',
    '\\mp': ' ∓ ',
    '\\neq': ' ≠ ',
    '\\ne': ' ≠ ',
    '\\approx': ' ≈ ',
    '\\leq': ' ≤ ',
    '\\le': ' ≤ ',
    '\\geq': ' ≥ ',
    '\\ge': ' ≥ ',
    '\\infty': ' ∞ ',
    '\\theta': 'θ',
    '\\pi': 'π',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\sigma': 'σ',
    '\\phi': 'φ',
    '\\omega': 'ω',
    '\\degree': '°',
    '\\sum': '∑',
    '\\int': '∫',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\in': ' ∈ ',
    '\\left': '',
    '\\right': '',
    '\\,': ' ',
    '\\;': ' ',
    '\\!': '',
  };

  Object.entries(mathSymbols).forEach(([key, value]) => {
    // Escape key for dynamic RegExp substitution safely
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(escapedKey, 'g'), value);
  });

  // 5. Replace double dollar delimiters $$math$$ with styled, highlighted standard lines
  cleaned = cleaned.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
    return ` **${math.trim().replace(/\\/g, '')}** `;
  });

  // 6. Replace single dollar delimiters $math$ with styled inline bold text
  cleaned = cleaned.replace(/\$(.*?)\$/g, (_, math) => {
    return `**${math.trim().replace(/\\/g, '')}**`;
  });

  // 7. Strip intermediate math formatting line-breaks or redundant slashes
  cleaned = cleaned.replace(/\\+/g, ' ');

  return cleaned;
}

function generateSessionTitle(firstUserMsg: string): string {
  if (!firstUserMsg) return "Study Session";
  
  if (firstUserMsg.includes("Kindly explain this WAEC past question")) {
    const subjectMatch = firstUserMsg.match(/Subject:\s*\*([^*]+)\*/i);
    const topicMatch = firstUserMsg.match(/Topic:\s*\*([^*]+)\*/i);
    if (subjectMatch && topicMatch) {
      return `${subjectMatch[1]}: ${topicMatch[1]}`;
    }
    if (subjectMatch) {
       return `${subjectMatch[1]} QA`;
    }
  }

  const lower = firstUserMsg.toLowerCase();
  if (lower.includes('study advice') || lower.includes('prepare for physics')) {
    return 'WAEC Prep Strategy';
  }
  if (lower.includes('quadratic')) {
    return 'Quadratic Formula Guide';
  }
  if (lower.includes('concord')) {
    return 'English Concord Rules';
  }
  if (lower.includes('voltage') || lower.includes('electrochemical')) {
    return 'Electrochemical Cells';
  }

  let cleanText = firstUserMsg.replace(/[?.,!*"']/g, '').trim();
  const firstLine = cleanText.split('\n')[0];
  const words = firstLine.split(/\s+/);
  if (words.length <= 6) {
    return words.join(' ');
  }
  return words.slice(0, 6).join(' ') + '...';
}

export default function AiTutorView({ 
  currentUsername, 
  activeQuestion, 
  onClearActiveQuestion,
  savedSessions = [],
  onSaveAiSession,
  onDeleteSavedAiSession
}: AiTutorViewProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello, champion candidate **${currentUsername}**! 👋 
 
I am your **WAEC Master AI Study Coach**. I am trained to explain formulas, break down prepositions, solve complex physics mechanics step-by-step, and supply customized revision guides!
 
Click one of the quick shortcuts below, or type your academic inquiries! Let's score parallel A1s! 🏆`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showArchives, setShowArchives] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');


  const handleSaveTitle = (session: AiChatSession, newTitle: string) => {
    if (!newTitle.trim()) return;
    if (onSaveAiSession) {
      onSaveAiSession({
        ...session,
        title: newTitle.trim(),
        timestamp: new Date().toISOString()
      });
    }
    setEditingSessionId(null);
  };

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle active failing question imported from CBT Simulator
  useEffect(() => {
    if (activeQuestion) {
      // Inject user message requesting explanation for this question
      const mockText = `Kindly explain this WAEC past question step-by-step for me:
Subject: *${activeQuestion.subject}*
Topic: *${activeQuestion.topic}*
Question: "${activeQuestion.text}"`;
      
      setInputText(mockText);
    }
  }, [activeQuestion]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    setInputText('');
    if (onClearActiveQuestion) onClearActiveQuestion();

    // Set user message
    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setLoading(true);

    // Call backend Express proxy endpoint
    try {
      const history = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const resp = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeQuestion?.subject || 'General Study',
          questionText: activeQuestion?.text || 'None',
          topic: activeQuestion?.topic || 'General',
          studentQuery: textToSend,
          history
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const modelMsg: AiChatMessage = {
          id: `msg-${Date.now()}-model`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toISOString(),
          isMock: data.isMock
        };
        const finalMessages = [...updatedMessagesWithUser, modelMsg];
        setMessages(finalMessages);

        // Automatically save to student personal account archives (entire conversational session as one!)
        if (onSaveAiSession) {
          const firstUserMsg = finalMessages.find(m => m.role === 'user')?.text || textToSend;
          onSaveAiSession({
            id: currentSessionId,
            title: generateSessionTitle(firstUserMsg),
            messages: finalMessages,
            timestamp: new Date().toISOString(),
            subject: activeQuestion?.subject || 'Study Lesson'
          });
        }
      } else {
        throw new Error('API server failed');
      }
    } catch (err: any) {
      console.error(err);
      // Friendly fallback representation
      const failMsg: AiChatMessage = {
        id: `msg-${Date.now()}-fail`,
        role: 'model',
        text: `Oh, I apologize my champion candidate! My educational satellite had a slight hiccup connecting. Let's try again in a few seconds. 
 
Make sure your internet is active, or practice offline modules in the mean time!`,
        timestamp: new Date().toISOString()
      };
      const finalFailedMessages = [...updatedMessagesWithUser, failMsg];
      setMessages(finalFailedMessages);

      if (onSaveAiSession) {
        const firstUserMsg = finalFailedMessages.find(m => m.role === 'user')?.text || textToSend;
        onSaveAiSession({
          id: currentSessionId,
          title: generateSessionTitle(firstUserMsg),
          messages: finalFailedMessages,
          timestamp: new Date().toISOString(),
          subject: activeQuestion?.subject || 'Study Lesson'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoicePlay = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const rawText = text.replace(/[*#]/g, ''); // strip markdown annotations for cleaner speaking
      const sliceOfText = rawText.length > 250 ? rawText.slice(0, 250) + " and so on..." : rawText;
      const sentence = new SpeechSynthesisUtterance(sliceOfText);
      sentence.rate = 0.98;
      window.speechSynthesis.speak(sentence);
    }
  };

  const handleResetChat = () => {
    if (onClearActiveQuestion) onClearActiveQuestion();
    setCurrentSessionId(`session-${Date.now()}`);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        text: `Hello, champion candidate **${currentUsername}**! 👋 
 
I am your **WAEC Master AI Study Coach**. I am trained to explain formulas, break down prepositions, solve complex physics mechanics step-by-step, and supply customized revision guides!
 
Click one of the quick shortcuts below, or type your academic inquiries! Let's score parallel A1s! 🏆`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleLoadSavedSession = (session: AiChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
  };

  const SUGGESTED_SHORTCUTS = [
    { label: '📚 Study Advice', prompt: 'Give me high-impact study advice to prepare for physics and chemistry WAEC exams.' },
    { label: '🧮 Solve Quadratic', prompt: 'Show me step-by-step how to solve 2x² + 7x + 3 = 0 using factorization and formula methods.' },
    { label: '📝 Concord Rules', prompt: 'List 5 fundamental Subject-Verb Concord grammatical rules commonly tested in WAEC English with examples.' },
    { label: '🔋 Cell Voltage', prompt: 'Explain how to calculate the standard electromotive force (EMF) of a cell in electrochemical electrochemistry.' }
  ];

  return (
    <div id="ai-tutor-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl w-full mx-auto animate-fadeIn items-start">
      
      {/* LEFT PORTION: SAVED SSS STUDY ARCHIVES SIDEBAR */}
      {showArchives && (
        <div id="ai-tutor-archives-container" className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-xl h-[650px] flex flex-col justify-between overflow-hidden transition-all duration-300 animate-fadeIn">
          <div className="flex flex-col grow overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-700" />
                <h4 className="font-display font-black text-slate-950 text-xs tracking-tight">Personal Study Archives</h4>
              </div>
            </div>

            {/* Archived list flow */}
            <div className="grow overflow-y-auto mt-2.5 py-1.5 space-y-2.5 pr-0.5 scrollbar-thin">
              {!savedSessions || savedSessions.length === 0 ? (
                <div className="text-center py-14 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-6 select-none">
                  <Bookmark className="w-8 h-8 text-indigo-150 mx-auto mb-3" />
                  <p className="text-2xs font-extrabold text-slate-600 leading-none">Your SSS Archives Are Empty</p>
                  <p className="text-[10px] text-slate-400 mt-2 max-w-[190px] mx-auto leading-normal">
                    Conversations asked to this AI Tutor are automatically saved right to your account and accessible here anytime!
                  </p>
                </div>
              ) : (
                savedSessions.map((session) => {
                  const isActive = currentSessionId === session.id;

                  return (
                    <div 
                      key={session.id}
                      onClick={() => handleLoadSavedSession(session)}
                      className={`group relative p-3 border transition duration-150 cursor-pointer text-left overflow-hidden shadow-2xs rounded-xl ${
                        isActive 
                          ? 'bg-indigo-50/70 border-indigo-250 ring-1 ring-indigo-200/50' 
                          : 'bg-slate-50 hover:bg-indigo-50 border-slate-100 hover:border-indigo-150'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[8px] bg-violet-100 text-violet-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide truncate max-w-[120px]">
                          {session.subject || 'Study Lesson'}
                        </span>
                        <span className="text-[8px] text-slate-450 font-mono">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Summary Title with Inline Editing */}
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTitle(session, editingTitleText);
                              } else if (e.key === 'Escape') {
                                setEditingSessionId(null);
                              }
                            }}
                            className="text-xs font-bold text-indigo-900 bg-white border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-hidden grow min-w-0"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTitle(session, editingTitleText)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSessionId(null)}
                            className="p-1 text-red-500 hover:text-red-700 font-bold text-xs"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 mt-1 group/title-edit">
                          <p className="text-xs text-indigo-650 font-black truncate leading-snug grow">
                            {session.title || 'Study Session'}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(session.id);
                              setEditingTitleText(session.title || 'Study Session');
                            }}
                            className="text-[9px] bg-slate-200 hover:bg-indigo-600 text-slate-700 hover:text-white px-1.5 py-0.5 rounded font-bold transition opacity-0 group-hover/title-edit:opacity-100 shrink-0"
                            title="Rename chat session"
                          >
                            Rename
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-200/40 text-[9px] font-bold">
                        <div>
                          {isActive ? (
                            <span className="text-emerald-600">Active Now</span>
                          ) : (
                            <span className="text-slate-400">Previous Lesson</span>
                          )}
                        </div>

                        {/* Delete saved session trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteSavedAiSession) {
                              onDeleteSavedAiSession(session.id);
                            }
                            if (isActive) {
                              handleResetChat();
                            }
                          }}
                          className="text-slate-350 hover:text-red-550 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer inline-flex items-center justify-center shrink-0"
                          title="Remove from SSS Study Archives"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sync panel status bar */}
          <div className="pt-3 border-t border-slate-150 text-[9px] text-slate-405 font-semibold flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-slate-400">Account Synchronized</span>
            </div>
            <span className="text-indigo-650 font-bold uppercase tracking-wider">Candidate Saved DB</span>
          </div>
        </div>
      )}

      {/* RIGHT PORTION: ACTIVE CHAT PANEL */}
      <div id="ai-tutor-chat-container" className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-xl h-[650px] flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${showArchives ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
        
        {/* Upper header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-150 shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle Archives - Compact Chat icon with Clock badge toggler button, now on the left! */}
            <button
              id="btn-tutor-toggle-archives"
              type="button"
              onClick={() => setShowArchives(!showArchives)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer shrink-0 border ${
                showArchives 
                  ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-105' 
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-150 text-indigo-700 hover:text-indigo-800'
              }`}
              title={showArchives ? "Hide Personal Study Archives" : "Show Personal Study Archives"}
            >
              <div className="relative p-0.5">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full text-white p-0.5 border border-white flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-white" />
                </span>
              </div>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center relative">
              <Brain className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">WAEC Master AI Study Coach</h3>
              <p className="text-[10px] text-slate-500">Active • Specialized in SSS Syllabus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Session reset button */}
            <button
              id="btn-tutor-reset"
              type="button"
              onClick={handleResetChat}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-250 hover:border-indigo-300 rounded-xl text-3xs font-black text-slate-600 hover:text-indigo-700 transition cursor-pointer shrink-0"
              title="Start a new tutor chat thread"
            >
              <RefreshCw className="w-3 h-3 animate-pulse" /> New Chat
            </button>

            {/* Info label if active question imported */}
            {activeQuestion && (
              <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/50 px-2 py-1 rounded-xl text-3xs text-indigo-700 shrink-0 max-w-[130px]">
                <span className="truncate block font-bold">Reviewing Question...</span>
                <button 
                  onClick={onClearActiveQuestion}
                  className="font-bold text-red-500 text-3xs uppercase hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MID SECTION: CHAT MESSAGES PANEL */}
        <div 
          ref={scrollRef}
          className="grow overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin"
        >
          {messages.map((m) => {
            const isModel = m.role === 'model';
            const displayedText = isModel ? cleanMathText(m.text) : m.text;
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[88%] ${isModel ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                {isModel && (
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-100/50">
                    🤖
                  </div>
                )}

                <div className="space-y-1.5 w-full">
                  <div className={`p-4 rounded-2xl border text-slate-800 text-xs text-left leading-relaxed relative ${isModel ? 'bg-slate-50 border-slate-100 rounded-tl-none' : 'bg-indigo-600 border-indigo-550 text-white rounded-tr-none'}`}>
                    {isModel ? (
                      <div className="prose prose-slate max-w-none text-xs text-slate-800 space-y-1.5">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-sm font-black text-slate-900 mt-2 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xs font-black text-slate-900 mt-2 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xs font-bold text-slate-900 mt-1.5 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed text-slate-800" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 space-y-1 text-slate-800" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 space-y-1 text-slate-800" {...props} />,
                            li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                            code: ({node, ...props}) => <code className="bg-slate-150 text-indigo-700 px-1 py-0.5 rounded-sm font-mono text-2xs" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-extrabold text-slate-950" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-slate-800" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-slate-200/60 p-2.5 rounded-xl font-mono text-2xs overflow-x-auto my-1.5 border border-slate-300/30" {...props} />
                          }}
                        >
                          {displayedText}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{displayedText}</div>
                    )}

                    {isModel && (
                      <div className="flex items-center gap-2.5 justify-end mt-3 border-t border-slate-200/50 pt-2 shrink-0">
                        {m.isMock && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            Offline Mode
                          </span>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => handleVoicePlay(displayedText)}
                          className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 text-3xs uppercase font-extrabold cursor-pointer"
                          title="Voice read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Speak
                        </button>

                        {!m.isMock && (
                          <span className="text-[9px] text-emerald-600 flex items-center gap-0.5 font-bold select-none" title="Saved to cloud study account">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%] items-center text-left py-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 text-sm flex items-center justify-center shrink-0 border border-indigo-100/50">
                🤖
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 text-slate-500">
                <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
                Formulating step-by-step solving path...
              </div>
            </div>
          )}
        </div>

        {/* QUICK SHORTCUTS ROW ONLY DISPLAY ON ROOT SCROLL */}
        {messages.length <= 2 && (
          <div className="p-2 border-t border-slate-100 shrink-0">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2 text-center">Suggested Coaching Prompts</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_SHORTCUTS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-250 border border-slate-100 rounded-xl text-3xs transition duration-150 cursor-pointer text-slate-700 leading-tight h-[48px] overflow-hidden truncate block font-semibold"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM INPUT BAR */}
        <div className="pt-3 border-t border-slate-150 shrink-0 bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="relative flex items-center gap-2"
          >
            <input 
              type="text"
              required
              placeholder="Ask AI Coach: e.g. Why does H2O discharge faster than NaCl?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="grow bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl py-3.5 pl-4 pr-12 text-xs focus:outline-hidden text-slate-800"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition duration-150 disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Always review AI advice alongside WAEC syllabus brochures.
          </p>
        </div>
      </div>

    </div>
  );
}
