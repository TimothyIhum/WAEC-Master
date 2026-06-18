import React, { useState } from 'react';
import { 
  Database, Plus, ShieldCheck, Mail, Sliders, ChevronDown, CheckCircle, 
  Trash2, Sparkles, Upload, RefreshCw, AlertTriangle, Send, Book, ShieldAlert
} from 'lucide-react';
import { Question, Announcement } from '../types';
import { SUBJECTS_LIST } from '../data/questions';
import OcrExtractorTab from './OcrExtractorTab';
import { saveUserToFirestore } from '../utils/firebaseSync';

interface AdminPanelProps {
  questionsList: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onPostAnnouncement: (ann: { title: string; content: string; category: any }) => void;
  subjectsList: string[];
  onAddSubject: (subject: string) => void;
  onDeleteSubject: (subject: string) => void;
}

export default function AdminPanel({
  questionsList,
  onAddQuestion,
  onDeleteQuestion,
  onPostAnnouncement,
  subjectsList,
  onAddSubject,
  onDeleteSubject
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'ai_bulk' | 'ocr_extract' | 'csv' | 'users' | 'announcements' | 'subjects'>('questions');

  // New Question Form State
  const [newSub, setNewSub] = useState('Mathematics');
  const [newTopic, setNewTopic] = useState('Calculus');
  const [newDiff, setNewDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newType, setNewType] = useState<'mcq' | 'fill_in_the_blank'>('mcq');
  const [newText, setNewText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [corrAns, setCorrAns] = useState('0');
  const [newHint, setNewHint] = useState('');
  const [newExpl, setNewExpl] = useState('');
  const [msg, setMsg] = useState('');

  // AI Bulk Generation States
  const [aiSub, setAiSub] = useState('Physics');
  const [aiTopic, setAiTopic] = useState('Quantum Mechanics');
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedQs, setAiGeneratedQs] = useState<Question[]>([]);

  // CSV State
  const [rawCsvText, setRawCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<Question[]>([]);

  // Announcements Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCat, setAnnCat] = useState<'Exam Update' | 'Reward' | 'Tournament'>('Tournament');

  // Dynamic student candidate monitoring database sourced from localStorage
  const [candidates, setCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('waec_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse candidates:', e);
      }
    }
    // Fallback seed
    const defaultData = [
      {
        username: 'temiokusami',
        email: 'temiokusami@gmail.com',
        avatar: '👑',
        level: 30,
        rankTier: 'Diamond Legend',
        streak: 15,
        accuracy: 96,
        timeSpentMinutes: 1240,
        totalQuizzes: 28,
        status: 'Clean',
        school: 'King\'s College, Lagos',
        state: 'Lagos',
        subjectsStudied: {
          'Mathematics': 640,
          'English Language': 585,
          'Physics': 240
        },
        isAdmin: true,
        isPremium: true
      },
      {
        username: 'admin',
        email: 'admin@waecmaster.edu.ng',
        avatar: '🛡️',
        level: 18,
        rankTier: 'Diamond Legend',
        streak: 10,
        accuracy: 92,
        timeSpentMinutes: 840,
        totalQuizzes: 15,
        status: 'Clean',
        school: 'WAEC Academy, Abuja',
        state: 'Abuja',
        subjectsStudied: {
          'Mathematics': 420,
          'English Language': 280
        },
        isAdmin: true,
        isPremium: true
      },
      {
        username: 'Chioma_Lagos',
        email: 'chioma@gmail.com',
        avatar: '🦊',
        level: 12,
        rankTier: 'Gold Champion',
        streak: 8,
        accuracy: 86,
        timeSpentMinutes: 520,
        totalQuizzes: 14,
        status: 'Clean',
        school: 'Queens College, Yaba',
        state: 'Lagos',
        subjectsStudied: {
          'Mathematics': 420,
          'English Language': 390
        },
        isAdmin: false,
        isPremium: false
      },
      {
        username: 'Kofi_Accra',
        email: 'kofi@gmail.com',
        avatar: '⚡',
        level: 10,
        rankTier: 'Gold Champion',
        streak: 11,
        accuracy: 82,
        timeSpentMinutes: 440,
        totalQuizzes: 11,
        status: 'Clean',
        school: 'Accra High School, Accra',
        state: 'Greater Accra',
        subjectsStudied: {
          'Mathematics': 380,
          'English Language': 310
        },
        isAdmin: false,
        isPremium: false
      }
    ];
    localStorage.setItem('waec_registered_users', JSON.stringify(defaultData));
    return defaultData;
  });

  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(() => {
    return candidates.length > 0 ? candidates[0] : null;
  });
  const [candidateSearch, setCandidateSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Clean' | 'Suspicious' | 'Banned'>('All');
  const [bannedUsers, setBannedUsers] = useState<string[]>(() => {
    return candidates.filter(u => u.status === 'Banned').map(u => u.username);
  });

  // Track edits to candidates to persist dynamically
  React.useEffect(() => {
    localStorage.setItem('waec_registered_users', JSON.stringify(candidates));
  }, [candidates]);

  const handleAddQuestionLocal = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: `custom-q-${Date.now()}`,
      subject: newSub,
      topic: newTopic,
      type: newType,
      text: newText,
      options: newType === 'mcq' ? [opt0, opt1, opt2, opt3] : undefined,
      correctAnswer: corrAns,
      explanation: newExpl || 'Solved by WAEC administrative guides.',
      hint: newHint || undefined,
      difficulty: newDiff,
      marks: 3
    };

    onAddQuestion(newQ);
    setMsg('Question added successfully!');
    setNewText('');
    setOpt0(''); setOpt1(''); setOpt2(''); setOpt3('');
    setNewHint(''); setNewExpl('');
    setTimeout(() => setMsg(''), 2000);
  };

  // Invoke server bulk AI questions compiler using Gemini!
  const handleAiBulkGenerate = async () => {
    setAiLoading(true);
    try {
      const resp = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSub,
          topic: aiTopic,
          count: aiCount
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setAiGeneratedQs(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Commit AI list to DB
  const handleCommitAiQuestions = () => {
    aiGeneratedQs.forEach(q => {
      onAddQuestion({
        ...q,
        id: `ai-committed-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    });
    setAiGeneratedQs([]);
    setMsg('AI Questions committed to question bank successfully!');
    setTimeout(() => setMsg(''), 2000);
  };

  // CSV Drag parse
  const handleParseCsv = () => {
    if (!rawCsvText.trim()) return;
    const lines = rawCsvText.split('\n');
    const parsed: Question[] = [];

    lines.forEach((ln, idx) => {
      if (idx === 0) return; // skip header line
      const cols = ln.split(',');
      if (cols.length >= 7) {
        parsed.push({
          id: `csv-${Date.now()}-${idx}`,
          subject: cols[0]?.trim() || 'Mathematics',
          topic: cols[1]?.trim() || 'Calculus',
          type: 'mcq',
          text: cols[2]?.trim() || 'What is the sum of 2 and 2?',
          options: [cols[3]?.trim(), cols[4]?.trim(), cols[5]?.trim(), cols[6]?.trim()],
          correctAnswer: cols[7]?.trim() || '0',
          explanation: 'CSV bulk loaded diagnostic.',
          difficulty: 'Medium',
          marks: 3
        });
      }
    });

    setCsvPreview(parsed);
  };

  const handleCommitCsv = () => {
    csvPreview.forEach(q => onAddQuestion(q));
    setCsvPreview([]);
    setRawCsvText('');
    setMsg('CSV Rows committed successfully!');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          category: annCat
        })
      });

      if (response.ok) {
        onPostAnnouncement({ title: annTitle, content: annContent, category: annCat });
        setAnnTitle('');
        setAnnContent('');
        setMsg('Announcement posted dynamically!');
        setTimeout(() => setMsg(''), 2000);
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  const toggleBanUser = (usr: string) => {
    setBannedUsers(prev => {
      if (prev.includes(usr)) {
        return prev.filter(u => u !== usr);
      } else {
        return [...prev, usr];
      }
    });
  };

  return (
    <div id="admin-workspace-root" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-150">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-950 flex items-center gap-2">
            <Database className="text-indigo-600 w-7 h-7" />
            CBT Content Administration
          </h2>
          <p className="text-xs text-slate-500">Add questions, ban cheaters, post community update cards with server actions</p>
        </div>

        {/* Info alerts */}
        {msg && (
          <div className="p-2.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-pulse">
            ✓ {msg}
          </div>
        )}
      </div>

      {/* Nav Row Tab headers */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
        {(['questions', 'ai_bulk', 'ocr_extract', 'csv', 'users', 'announcements', 'subjects'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4.5 rounded-xl text-xs font-bold transition uppercase cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            {tab === 'ocr_extract' ? '✨ AI OCR Extractor' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* TAB 1: ADD / REDACT QUESTIONS */}
      {activeTab === 'questions' && (
        <div id="admin-questions-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          <form onSubmit={handleAddQuestionLocal} className="lg:col-span-7 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Create New CBT Question</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Select Subject</label>
                <select
                  value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
                >
                  {SUBJECTS_LIST.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Topic Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waves"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Difficulty</label>
                <select
                  value={newDiff}
                  onChange={e => setNewDiff(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
                >
                  <option value="mcq">Multiple Choice Question</option>
                  <option value="fill_in_the_blank">Fill in the Blank</option>
                </select>
              </div>
            </div>

            {/* Question label text input */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Question Content Text</label>
              <textarea
                required
                rows={3}
                placeholder="Type the CBT prompt prompt here..."
                value={newText}
                onChange={e => setNewText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3 px-4 focus:outline-hidden resize-none"
              />
            </div>

            {newType === 'mcq' && (
              <div className="space-y-2 pt-2 text-xs">
                <label className="font-bold text-slate-600 block">MCQ Options</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Option A" value={opt0} onChange={e => setOpt0(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden" />
                  <input type="text" placeholder="Option B" value={opt1} onChange={e => setOpt1(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden" />
                  <input type="text" placeholder="Option C" value={opt2} onChange={e => setOpt2(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden" />
                  <input type="text" placeholder="Option D" value={opt3} onChange={e => setOpt3(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden" />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-bold text-slate-600 block">Index of Correct Option</label>
                  <select value={corrAns} onChange={e => setCorrAns(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden">
                    <option value="0">Option A (Index 0)</option>
                    <option value="1">Option B (Index 1)</option>
                    <option value="2">Option C (Index 2)</option>
                    <option value="3">Option D (Index 3)</option>
                  </select>
                </div>
              </div>
            )}

            {newType === 'fill_in_the_blank' && (
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 block">Written Correct Answer</label>
                <input type="text" placeholder="e.g. 30" value={corrAns} onChange={e => setCorrAns(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-hidden font-mono" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Hint (Optional)</label>
                <input type="text" placeholder="e.g. Think of velocity formulas" value={newHint} onChange={e => setNewHint(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl.5 py-2 px-3 focus:outline-hidden" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Explanation Details</label>
                <input type="text" placeholder="e.g. Split terms factor..." value={newExpl} onChange={e => setNewExpl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl.5 py-2 px-3 focus:outline-hidden" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition">
              Insert Question to Platform
            </button>
          </form>

          {/* RIGHT SIDEBAR: CURRENT BANK VIEW */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-display font-bold text-slate-800 text-sm">Active Bank Preview ({questionsList.length} items)</h4>
            
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-150 border border-slate-150 rounded-2xl overflow-hidden p-3 space-y-2 scrollbar-thin">
              {questionsList.map((q, idx) => (
                <div key={q.id || idx} className="p-3 bg-slate-50 rounded-xl flex justify-between items-start gap-3">
                  <div className="w-0 shrink grow">
                    <span className="text-[10px] font-bold text-indigo-700 block bg-indigo-50 px-2 py-0.5 rounded-md w-max uppercase">{q.subject}</span>
                    <p className="text-2xs text-slate-800 truncate mt-1">{q.text}</p>
                    <p className="text-3xs text-slate-400 font-mono">ID: {q.id || idx}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 transition shrink-0 cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI BULK GENERATOR USING SERVER GEMINI */}
      {activeTab === 'ai_bulk' && (
        <div id="admin-ai-tab" className="space-y-6 pt-4 animate-fadeIn">
          <div className="max-w-md space-y-2">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="text-indigo-600 w-5 h-5" /> Gemini Automated CBT Compiler
            </h3>
            <p className="text-xs text-slate-500">
              Input the subject syllabus and topic segment. Our Gemini Agent will automatically construct challenging questions complete with hints and explanations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-end">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Syllabus Subject</label>
              <select value={aiSub} onChange={e => setAiSub(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3">
                {SUBJECTS_LIST.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Syllabus Topic</label>
              <input type="text" placeholder="e.g. Electromagnetism" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Questions Count</label>
              <select value={aiCount} onChange={e => setAiCount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3">
                <option value={2}>2 Questions</option>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>

            <button
              onClick={handleAiBulkGenerate}
              disabled={aiLoading}
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Compiler Compile
            </button>
          </div>

          {/* Preview results */}
          {aiGeneratedQs.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50 space-y-4 animate-fadeIn">
              <h4 className="font-display font-bold text-slate-800 text-sm">Compiled AI Questions List ({aiGeneratedQs.length})</h4>
              
              <div className="space-y-4 overflow-y-auto max-h-80 pr-1 text-xs">
                {aiGeneratedQs.map((q, idx) => (
                  <div key={idx} className="bg-white p-4.5 rounded-xl border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-900 leading-normal">{idx + 1}. {q.text}</p>
                    <p className="text-3xs text-slate-500">Correct Answer: <b>{q.correctAnswer}</b> • Hint: <i>{q.hint || 'None'}</i></p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCommitAiQuestions}
                className="py-2.5 px-6 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition"
              >
                Commit Generated list to Database Bank
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CSV BULK UPLOAD */}
      {activeTab === 'csv' && (
        <div id="admin-csv-tab" className="space-y-6 pt-4 animate-fadeIn text-xs">
          <div className="max-w-md space-y-1">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Upload className="text-indigo-600 w-5 h-5" /> CSV Batch Bulk Creator
            </h3>
            <p className="text-xs text-slate-500">
              Input standard CSV data blocks below to create hundreds of questions instantly. Columns match standard indices.
            </p>
          </div>

          {/* Sample CSV text area helper */}
          <div className="space-y-1">
            <span className="font-bold text-slate-400 block tracking-wider text-2xs uppercase">Paste Raw CSV text rows (Header: Subject,Topic,Text,OptA,OptB,OptC,OptD,AnswerIndex)</span>
            <textarea
              rows={4}
              placeholder="Mathematics,Set,What is the sum of sets A and B?,Union,Intersection,Subset,Null,0"
              value={rawCsvText}
              onChange={e => setRawCsvText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 font-mono rounded-xl p-3 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleParseCsv}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Parse CSV String
            </button>
            {csvPreview.length > 0 && (
              <button
                onClick={handleCommitCsv}
                className="py-2.5 px-5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Commit Parsed {csvPreview.length} questions
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADVANCED CANDIDATE SCOREBOARD & METRICS TRACKING */}
      {activeTab === 'users' && (
        <div id="admin-users-tab" className="space-y-6 pt-2 animate-fadeIn text-xs">
          
          {/* Header & Quick stats banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500">Total Scholars</p>
                <h4 className="text-xl font-black text-indigo-900 mt-1">{candidates.length} Registered</h4>
              </div>
              <span className="text-2xl">👥</span>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Combined Study Hours</p>
                <h4 className="text-xl font-black text-emerald-950 mt-1">
                  {(candidates.reduce((acc, curr) => acc + curr.timeSpentMinutes, 0) / 60).toFixed(1)} Hours
                </h4>
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-purple-500">Avg. Score Accuracy</p>
                <h4 className="text-xl font-black text-purple-950 mt-1">
                  {Math.round(candidates.reduce((acc, curr) => acc + curr.accuracy, 0) / candidates.length)}% Correct
                </h4>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-150/80">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search candidates, schools or states..."
                value={candidateSearch}
                onChange={e => setCandidateSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-2xs focus:outline-hidden"
              />
            </div>

            {/* Quick Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {(['All', 'Clean', 'Suspicious', 'Banned'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold tracking-wide uppercase transition cursor-pointer ${statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Dual-Panel candidate explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Candidates index scroll list */}
            <div className="lg:col-span-6 space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {candidates
                .filter(p => {
                  const bnd = bannedUsers.includes(p.username);
                  const statusLabel = bnd ? 'Banned' : p.status;
                  
                  // Status filtering match
                  if (statusFilter !== 'All') {
                    if (statusFilter === 'Banned' && !bnd) return false;
                    if (statusFilter === 'Clean' && (statusLabel !== 'Clean' || bnd)) return false;
                    if (statusFilter === 'Suspicious' && (statusLabel !== 'Suspicious' || bnd)) return false;
                  }

                  // Text search match
                  if (candidateSearch) {
                    const term = candidateSearch.toLowerCase();
                    return (
                      p.username.toLowerCase().includes(term) ||
                      p.school.toLowerCase().includes(term) ||
                      p.state.toLowerCase().includes(term)
                    );
                  }
                  return true;
                })
                .map((p, idx) => {
                  const bnd = bannedUsers.includes(p.username);
                  const isSelected = selectedCandidate?.username === p.username;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCandidate(p)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-4 ${isSelected ? 'bg-indigo-50/75 border-indigo-200 ring-1 ring-indigo-200' : 'bg-slate-50 hover:bg-white border-slate-150/70'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-white rounded-xl shadow-2xs border border-slate-100">{p.avatar}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 font-sans">
                            {p.username}
                            {bnd && <span className="bg-red-100 text-red-700 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full">Banned</span>}
                            {!bnd && p.status === 'Suspicious' && <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full">Flagged</span>}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                            {p.school} • <span className="font-semibold text-slate-500">{p.state}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-3xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Lvl {p.level}
                        </span>
                        <p className="text-3xs font-bold text-slate-500 font-mono mt-0.5">{p.accuracy}% Acc</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Right Column: Complete detailed scholar workspace report card */}
            <div className="lg:col-span-6 bg-slate-50/40 p-5 rounded-2xl border border-slate-150">
              {selectedCandidate ? (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Title profile block */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200/60 font-sans">
                    <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-slate-100">{selectedCandidate.avatar}</span>
                    <div className="w-0 shrink grow">
                      <h4 className="font-display font-black text-slate-950 text-sm flex items-center gap-1.5 truncate">
                        {selectedCandidate.username}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {selectedCandidate.isAdmin ? '👑 Exam Admin (Staff Authority)' : `${selectedCandidate.rankTier || 'Bronze Scholar'} • Level ${selectedCandidate.level || 1} Scholar`}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {selectedCandidate.isAdmin && (
                        <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block">👑 Exam Admin</span>
                      )}
                      {selectedCandidate.isPremium && (
                        <span className="bg-amber-50 border border-amber-200 text-amber-800 font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider block">💎 Premium Access</span>
                      )}
                      {bannedUsers.includes(selectedCandidate.username) ? (
                        <span className="bg-rose-50 border border-rose-200 text-rose-700 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase block">Suspended / Banned</span>
                      ) : (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase block">Validated Account</span>
                      )}
                    </div>
                  </div>

                  {/* Institution Details */}
                  <div className="grid grid-cols-2 gap-3 text-3xs font-sans">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-bold block">Assigned College / School</span>
                      <p className="font-black text-slate-800 mt-1 truncate">{selectedCandidate.school || 'Unspecified CBT Affiliate College'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-bold block">State Center Location</span>
                      <p className="font-black text-slate-800 mt-1">{selectedCandidate.state || 'Lagos State Center'}</p>
                    </div>
                  </div>

                  {/* Activity Timers & Stats details */}
                  <div className="grid grid-cols-4 gap-2 text-center font-sans">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold">Total Time</p>
                      <p className="font-black text-slate-900 text-3xs mt-1">
                        {Math.floor((selectedCandidate.timeSpentMinutes || 0) / 60)}h {(selectedCandidate.timeSpentMinutes || 0) % 60}m
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold">Accuracy</p>
                      <p className="font-black text-emerald-600 font-mono text-3xs mt-1">{selectedCandidate.accuracy || 100}%</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold">Streak</p>
                      <p className="font-black text-rose-500 text-3xs mt-1">🔥 {selectedCandidate.streak || 1}d</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold">CBT Quizzes</p>
                      <p className="font-black text-indigo-700 text-3xs mt-1">{selectedCandidate.totalQuizzes || 0}</p>
                    </div>
                  </div>

                  {/* Subject score combinations Breakdown */}
                  <div className="space-y-2.5 bg-white p-4.5 rounded-2xl border border-slate-150/70 font-sans">
                    <span className="font-display font-extrabold text-slate-800 text-3xs uppercase tracking-wider block">Completed Subject Combinations (Earned XP)</span>
                    <div className="space-y-2">
                      {Object.entries(selectedCandidate.subjectsStudied || {}).map(([subject, xp]) => (
                        <div key={subject} className="space-y-1">
                          <div className="flex justify-between items-center text-3xs font-bold">
                            <span className="text-slate-700">{subject}</span>
                            <span className="font-mono text-indigo-600">{String(xp)} Cumulative XP</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${subject === 'Mathematics' ? 'bg-indigo-600' : subject === 'English Language' ? 'bg-purple-600' : 'bg-amber-500'}`} 
                              style={{ width: `${Math.min((Number(xp) / 1000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      {Object.keys(selectedCandidate.subjectsStudied || {}).length === 0 && (
                        <p className="text-4xs text-slate-400 italic">No subject sessions registered yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Control triggers */}
                  <div className="space-y-3 pt-2 font-sans text-xs">
                    {/* Role toggles row */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCandidates(prev => prev.map(c => {
                            if (c.username === selectedCandidate.username) {
                              const updated = { ...c, isAdmin: !c.isAdmin };
                              setSelectedCandidate(updated);
                              saveUserToFirestore(updated).catch(err => console.error("Cloud sync fail:", err));
                              return updated;
                            }
                            return c;
                          }));
                          setMsg(`Administrative role updated for ${selectedCandidate.username}`);
                          setTimeout(() => setMsg(''), 2500);
                        }}
                        className={`py-2 px-3 border rounded-xl font-bold text-center transition cursor-pointer text-3xs uppercase tracking-wide ${selectedCandidate.isAdmin ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {selectedCandidate.isAdmin ? '👑 Revoke Exam Admin Role' : '👥 Promote to Exam Admin'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCandidates(prev => prev.map(c => {
                            if (c.username === selectedCandidate.username) {
                              const updated = { ...c, isPremium: !c.isPremium };
                              setSelectedCandidate(updated);
                              saveUserToFirestore(updated).catch(err => console.error("Cloud sync fail:", err));
                              return updated;
                            }
                            return c;
                          }));
                          setMsg(`Premium status updated for ${selectedCandidate.username}`);
                          setTimeout(() => setMsg(''), 2500);
                        }}
                        className={`py-2 px-3 border rounded-xl font-bold text-center transition cursor-pointer text-3xs uppercase tracking-wide ${selectedCandidate.isPremium ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {selectedCandidate.isPremium ? '💎 Revoke Premium Access' : '⭐ Grant Free Premium Upgrade'}
                      </button>
                    </div>

                    {/* Ban and Delete row */}
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const usr = selectedCandidate.username;
                          toggleBanUser(usr);
                          setCandidates(prev => prev.map(c => {
                            if (c.username === usr) {
                              const isNowBanned = !bannedUsers.includes(usr);
                              const updated = { ...c, status: isNowBanned ? 'Banned' : 'Clean' };
                              setSelectedCandidate(updated);
                              saveUserToFirestore(updated).catch(err => console.error("Cloud sync fail:", err));
                              return updated;
                            }
                            return c;
                          }));
                          setMsg(`Updated ban status of ${usr}`);
                          setTimeout(() => setMsg(''), 2500);
                        }}
                        className={`flex-1 py-2 rounded-xl font-bold cursor-pointer transition text-3xs uppercase tracking-wide text-center ${bannedUsers.includes(selectedCandidate.username) ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100'}`}
                      >
                        {bannedUsers.includes(selectedCandidate.username) ? '✓ Unban Account' : '⚠️ Ban Account'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const booster = () => {
                            setCandidates(prev => prev.map(c => {
                              if (c.username === selectedCandidate.username) {
                                const updated = {
                                  ...c,
                                  level: (c.level || 1) + 1,
                                  timeSpentMinutes: (c.timeSpentMinutes || 0) + 60,
                                  xp: (c.xp || 100) + 250
                                };
                                setSelectedCandidate(updated);
                                saveUserToFirestore(updated).catch(err => console.error("Cloud sync fail:", err));
                                return updated;
                              }
                              return c;
                            }));
                            setMsg(`Level and cumulative experience points boosted for ${selectedCandidate.username}!`);
                            setTimeout(() => setMsg(''), 2500);
                          };
                          booster();
                        }}
                        className="py-2 px-3 bg-slate-900 text-slate-50 hover:bg-slate-850 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 text-3xs uppercase tracking-wide"
                        title="Boost level stats"
                      >
                        🚀 Boost XP
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to completely delete ${selectedCandidate.username}? This action is permanent.`)) {
                            const remaining = candidates.filter(c => c.username !== selectedCandidate.username);
                            setCandidates(remaining);
                            setSelectedCandidate(remaining.length > 0 ? remaining[0] : null);
                            setMsg('Account deleted from student rosters.');
                            setTimeout(() => setMsg(''), 2500);
                          }
                        }}
                        className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded-xl font-bold transition cursor-pointer text-3xs uppercase tracking-wide"
                      >
                        Delete User
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-slate-400 font-bold">
                  Select a candidate from the index to audit scores & combinations details.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: TOURNAMENTS & ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div id="admin-ann-tab" className="space-y-6 pt-4 animate-fadeIn text-xs">
          <form onSubmit={handleCreateAnnouncement} className="space-y-4 max-w-lg">
            <h3 className="font-display font-bold text-slate-800 text-sm">Post Platform Announcement / Tournament</h3>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Announcements Title</label>
              <input
                type="text"
                required
                placeholder="National Maths Fray Round this Saturday"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Category</label>
              <select
                value={annCat}
                onChange={e => setAnnCat(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200.5 rounded-xl py-2 px-3"
              >
                <option value="Tournament">Tournament</option>
                <option value="Exam Update">WAEC Exam Update</option>
                <option value="Reward">General Rewards Alert</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Content Brief</label>
              <textarea
                required
                rows={3}
                placeholder="Add announcement notes here..."
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl py-2 px-3 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              Post Dynamic Announcement <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2.5: AI OCR EXTRACT SYSTEM */}
      {activeTab === 'ocr_extract' && (
        <OcrExtractorTab
          questionsList={questionsList}
          onAddQuestion={onAddQuestion}
          subjectsList={subjectsList}
        />
      )}

      {/* TAB 6: SUBJECT MANAGEMENT */}
      {activeTab === 'subjects' && (
        <div id="admin-subjects-tab" className="space-y-6 pt-4 animate-fadeIn text-xs max-w-lg font-sans">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Book className="text-indigo-600 w-4.5 h-4.5" />
              Subjects Repository Manager
            </h3>
            <p className="text-3xs text-slate-500">Add or strike off national subjects from the WAEC / JAMB CBT Simulators list. Deleted subjects will no longer be visible inside practice portals.</p>
          </div>

          {/* Add Subject Widget */}
          <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-150 flex items-center gap-3">
            <input
              type="text"
              id="new-subject-name"
              placeholder="e.g. Geography, Biology, Civic Education"
              className="flex-1 bg-white border border-slate-200.5 rounded-xl py-2.5 px-3 text-xs focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  const val = input.value.trim();
                  if (val) {
                    if (subjectsList.includes(val)) {
                      setMsg('Subject already exists!');
                      setTimeout(() => setMsg(''), 2000);
                      return;
                    }
                    onAddSubject(val);
                    input.value = '';
                    setMsg(`Subject '${val}' added to rosters successfully.`);
                    setTimeout(() => setMsg(''), 2500);
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('new-subject-name') as HTMLInputElement | null;
                const val = input?.value.trim();
                if (val) {
                  if (subjectsList.includes(val)) {
                    setMsg('Subject already exists!');
                    setTimeout(() => setMsg(''), 2000);
                    return;
                  }
                  onAddSubject(val);
                  if (input) input.value = '';
                  setMsg(`Subject '${val}' added to rosters successfully.`);
                  setTimeout(() => setMsg(''), 2500);
                }
              }}
              className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Active subjects list */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Active WAEC / JAMB Subjects ({subjectsList.length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subjectsList.map(subj => (
                <div key={subj} className="bg-white p-3 rounded-xl border border-slate-150 flex justify-between items-center group hover:border-slate-350 transition duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span className="font-bold text-slate-800 text-xs">{subj}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (subjectsList.length <= 1) {
                        alert('Warning: Core syllabus requires at least one registered subject list.');
                        return;
                      }
                      if (confirm(`Remove the subject '${subj}' from CBT database rosters? This will clear its visibility immediately.`)) {
                        onDeleteSubject(subj);
                        setMsg(`Subject '${subj}' removed.`);
                        setTimeout(() => setMsg(''), 2500);
                      }
                    }}
                    className="p-1 px-2 border border-slate-100 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-450 hover:border-red-100 rounded-lg transition duration-150 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
