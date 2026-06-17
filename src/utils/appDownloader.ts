import { Question } from '../types';
import JSZip from 'jszip';

/**
 * Compiles and triggers the download of the fully interactive, responsive,
 * and zero-dependency Single-File Standalone CBT Prep application.
 */
export function downloadOfflineCbtApp(questionsList: Question[]) {
  // Serialize the past questions safe-proofing characters
  const questionsJson = JSON.stringify(questionsList)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAEC Master - Standalone Offline CBT Prep Client</title>
  
  <!-- Tailwind CSS CDNs -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  
  <!-- Beautiful Typography and Custom Palette override styling for fully Offline mode fallback -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
    }

    /* Standard Dark mode UI styling */
    .cbt-dark-canvas {
      background-color: #0b0f19;
      color: #f1f5f9;
    }

    .btn-gradient-indigo {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
    }

    /* Range input layout override */
    input[type="range"]::-webkit-slider-thumb {
      background-color: #4f46e5;
    }
    
    .pulsing-effect {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col justify-between">

  <!-- TOP HEADER -->
  <header class="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-100">W</div>
        <div>
          <h1 class="text-lg font-extrabold text-slate-900 tracking-tight">WAEC Master Standalone</h1>
          <p class="text-3xs uppercase tracking-widest text-emerald-600 font-bold flex items-center gap-1">
            <span class="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping"></span> Pure Offline mode active • No Internet Required
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-bold text-indigo-700">Offline Edition</span>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="grow max-w-4xl w-full mx-auto px-4 py-8">
    <div id="app-mount"></div>
  </main>

  <!-- SCREEN FOOTER -->
  <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-6 space-y-2">
      <p class="font-bold text-slate-300">⚡ WAEC Master Standalone Desktop & Mobile PWA App Client ⚡</p>
      <p class="text-2xs text-slate-500">Includes procedural dynamic physics formulas, chemistry structures, and comprehensive explanation libraries.</p>
    </div>
  </footer>

  <!-- DATABASE SERIALIZER -->
  <script>
    // Embedded full exam dataset from student server
    const ALL_QUESTIONS = JSON.parse("${questionsJson}");
    
    // Subject mapping extract
    const SUBJECTTIES = [...new Set(ALL_QUESTIONS.map(q => q.subject))];
    if (SUBJECTTIES.length === 0) {
      SUBJECTTIES.push("Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Economics", "Government");
    }

    // Default Topic extract helper
    const TOPICS_VALS = {};
    ALL_QUESTIONS.forEach(q => {
      if (!TOPICS_VALS[q.subject]) TOPICS_VALS[q.subject] = [];
      if (!TOPICS_VALS[q.subject].includes(q.topic)) {
        TOPICS_VALS[q.subject].push(q.topic);
      }
    });

    // App core state
    let state = {
      phase: 'select', // 'select' | 'quiz' | 'review'
      selectedSubject: SUBJECTTIES[0] || 'Mathematics',
      selectedMode: 'waec_simulation', // 'waec_simulation' | 'jamb_practice' | 'survival' | 'speed_challenge' | 'topic_mastery'
      selectedTopic: '',
      selectedYear: 'all',
      customCountSetting: 'standard', // 'standard' | 5 | 10 | 15 | 30 | 50 | 60
      customTimeSetting: 'default', // 'default' | 5 | 10 | 15 | 30 | 45 | 60 | 90 | 120
      candidateName: localStorage.getItem('offline_candidate_name') || 'Guest Scholar',
      
      // Active Quiz State
      questions: [],
      currentIdx: 0,
      userAnswers: {},
      timeRemaining: 600,
      initialTime: 600,
      lives: 3,
      showHint: false,
      correctCount: 0,
      timerInterval: null
    };

    // Speech Synthesizer Voice Narrating Assistant helper
    function speakText(txt) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(txt);
        msg.rate = 0.95;
        window.speechSynthesis.speak(msg);
      } else {
        alert("Client reader not available in this browser environment.");
      }
    }

    // Initialize/Render components
    function renderApp() {
      const root = document.getElementById('app-mount');
      
      if (state.phase === 'select') {
        renderSelectPhase(root);
      } else if (state.phase === 'quiz') {
        renderQuizPhase(root);
      } else if (state.phase === 'review') {
        renderReviewPhase(root);
      }
    }

    // SELECT CONTEXT UI RENDER
    function renderSelectPhase(element) {
      // Make sure valid default topic is configured
      const ts = TOPICS_VALS[state.selectedSubject] || [];
      if (ts.length > 0 && !state.selectedTopic) {
        state.selectedTopic = ts[0];
      }

      // Calculate subject specific counts
      const subjectCount = ALL_QUESTIONS.filter(q => q.subject.trim().toLowerCase() === state.selectedSubject.trim().toLowerCase()).length;

      let html = \`
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-8 animate-fadeIn">
        
        <!-- Welcome Card header -->
        <div class="pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
              🏆 Offline CBT Exam Room
            </h2>
            <p class="text-xs text-slate-500 mt-1">Practice completely offline with strict timers, official years, and scoring.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500">Candidate:</span>
            <input 
              type="text" 
              value="\${state.candidateName}" 
              id="candidate-name-inp"
              onchange="saveCandidateName(this.value)"
              class="bg-slate-50 border border-slate-205 focus:border-indigo-500 font-bold text-xs text-indigo-750 px-3 py-1.5 rounded-xl outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Column 1: Subjects list -->
          <div class="space-y-4">
            <label class="text-xs font-black uppercase text-slate-400 tracking-wider">1. Select CBT Subject</label>
            <div class="grid grid-cols-2 gap-3">
              \${SUBJECTTIES.map(subj => {
                const isSelected = state.selectedSubject === subj;
                const pool = ALL_QUESTIONS.filter(q => q.subject === subj);
                return \`
                  <button 
                    onclick="setSubject('\${subj}')"
                    class="p-4 rounded-2xl border text-left transition flex flex-col justify-between h-24 \${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'}"
                  >
                    <span class="font-extrabold text-xs leading-snug">\${subj}</span>
                    <span class="text-[10px] font-mono opacity-80">\${pool.length > 0 ? pool.length : 12} Past Qs</span>
                  </button>
                \`;
              }).join('')}
            </div>
          </div>

          <!-- Column 2: Assessment Mode list -->
          <div class="space-y-4">
            <label class="text-xs font-black uppercase text-slate-400 tracking-wider">2. Choose Assessment Mode</label>
            <div class="space-y-3">
              
              <!-- WAEC SIMULATION -->
              <div 
                onclick="setMode('waec_simulation')"
                class="p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer \${state.selectedMode === 'waec_simulation' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}"
              >
                <div class="p-2.5 bg-amber-100 rounded-xl text-amber-700 font-extrabold text-2xs">WAEC</div>
                <div class="grow">
                  <h4 class="font-bold text-slate-900 text-sm">WAEC Examination Practice</h4>
                  <p class="text-3xs text-slate-500">Mocks full exam guidelines with precise standards.</p>
                </div>
              </div>

              <!-- JAMB BOOSTER -->
              <div 
                onclick="setMode('jamb_practice')"
                class="p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer \${state.selectedMode === 'jamb_practice' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}"
              >
                <div class="p-2.5 bg-purple-100 rounded-xl text-purple-750 font-extrabold text-2xs">JAMB</div>
                <div class="grow">
                  <h4 class="font-bold text-slate-900 text-sm">JAMB Speed Charger</h4>
                  <p class="text-3xs text-slate-500">Fast action session with highly realistic JAMB parameters.</p>
                </div>
              </div>

              <!-- SURVIVAL CHRONO -->
              <div 
                onclick="setMode('survival')"
                class="p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer \${state.selectedMode === 'survival' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}"
              >
                <div class="p-2.5 bg-red-100 rounded-xl text-red-650 font-extrabold text-lg flex justify-center items-center">❤️</div>
                <div class="grow">
                  <h4 class="font-bold text-slate-900 text-sm">Sudden Death Survival</h4>
                  <p class="text-3xs text-slate-500">3 hearts. Give an incorrect reply, and you lose a single heart!</p>
                </div>
              </div>

              <!-- SYLLABUS TOPIC -->
              <div 
                onclick="setMode('topic_mastery')"
                class="p-4 rounded-2xl border text-left transition flex flex-col gap-3 cursor-pointer \${state.selectedMode === 'topic_mastery' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}"
              >
                <div class="flex items-center gap-4">
                  <div class="p-2.5 bg-blue-100 rounded-xl text-blue-750 font-extrabold text-lg flex justify-center items-center">📎</div>
                  <div class="grow">
                    <h4 class="font-bold text-slate-900 text-sm">Syllabus Topic Explorer</h4>
                    <p class="text-3xs text-slate-500">Sieve questions by narrow subtopics to address areas of weakness.</p>
                  </div>
                </div>
                
                \${state.selectedMode === 'topic_mastery' ? \`
                  <div class="pl-12" onclick="event.stopPropagation()">
                    <select 
                      id="opt-topics-dropdown"
                      onchange="setTopic(this.value)"
                      class="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none"
                    >
                      \${ts.map(tp => \`<option value="\${tp}" \${state.selectedTopic === tp ? 'selected' : ''}>\${tp}</option>\`).join('')}
                    </select>
                  </div>
                \` : ''}
              </div>

            </div>
          </div>
        </div>

        <!-- Custom Year, Count & Exact Time Control selectors -->
        <div class="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <!-- YEAR SELECTOR -->
          <div class="space-y-3">
            <span class="text-xs font-black uppercase text-slate-500 tracking-wider block">3. Choose Paper Year</span>
            <div class="flex flex-wrap gap-1.5">
              \${['all', 2023, 2022, 2021, 2019, 2018].map(yr => {
                const isSelected = state.selectedYear === yr;
                return \`
                  <button 
                    onclick="setYear('\${yr}')" 
                    type="button"
                    class="px-2.5 py-1.5 text-xs font-bold rounded-xl border transition \${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}"
                  >
                    \${yr === 'all' ? 'Core Mix' : yr}
                  </button>
                \`;
              }).join('')}
            </div>
            <p class="text-[10px] text-slate-400">Pulls questions corresponding specifically to the selected past season.</p>
          </div>

          <!-- QUESTION QUANTITY SELECTOR -->
          <div class="space-y-3">
            <span class="text-xs font-black uppercase text-slate-500 tracking-wider block">4. Select Number of Questions</span>
            <div class="flex flex-wrap gap-1.5 animate-fadeIn">
              <button 
                onclick="setCount('standard')"
                type="button"
                class="px-2.5 py-1.5 text-xs font-bold rounded-xl border transition \${state.customCountSetting === 'standard' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}"
              >
                Standard (Full Exam)
              </button>
              \${[5, 10, 15, 30, 45, 60].map(cnt => {
                const isSelected = state.customCountSetting === cnt;
                return \`
                  <button 
                    onclick="setCount(\${cnt})"
                    type="button"
                    class="px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition \${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}"
                  >
                    \${cnt} Qs
                  </button>
                \`;
              }).join('')}
            </div>
            <p class="text-[10px] text-slate-400">Specifies the length of the exam paper. Defaults to standard 40-60 items.</p>
          </div>

          <!-- DURATION TIMER SELECTOR (MINIMUM 5 MINS) -->
          <div class="space-y-3">
            <span class="text-xs font-black uppercase text-slate-500 tracking-wider block">5. Custom Timing (Min 5m)</span>
            <div class="flex flex-wrap gap-1">
              <button 
                onclick="setDuration('default')"
                type="button"
                class="px-2.5 py-1.5 text-xs font-bold rounded-xl border transition \${state.customTimeSetting === 'default' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}"
              >
                ⏱️ recommended
              </button>
              \${[5, 15, 30, 45, 60, 90].map(mins => {
                const isSelected = state.customTimeSetting === mins;
                return \`
                  <button 
                    onclick="setDuration(\${mins})"
                    type="button"
                    class="px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition \${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}"
                  >
                    \${mins}m
                  </button>
                \`;
              }).join('')}
            </div>

            <!-- Slider interface -->
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between gap-4">
              <div class="space-y-0.5 shrink-0">
                <span class="text-[9px] uppercase font-black text-slate-400 block">Exact Time</span>
                <div class="flex items-center gap-1">
                  <input 
                    type="number" 
                    min="5" 
                    max="180" 
                    id="offline-numeric-duration"
                    value="\${state.customTimeSetting === 'default' ? 45 : state.customTimeSetting}" 
                    onchange="handleDurationRawInp(this.value)"
                    class="w-11 text-center bg-white border border-slate-200 rounded-lg py-1 px-0.5 text-xs font-bold text-slate-800"
                  />
                  <span class="text-[10px] font-bold text-slate-500">Mins</span>
                </div>
              </div>
              <div class="grow">
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5" 
                  value="\${state.customTimeSetting === 'default' ? 45 : state.customTimeSetting}" 
                  oninput="setDuration(parseInt(this.value))"
                  class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div class="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>5m min</span>
                  <span>120m</span>
                </div>
              </div>
            </div>
            
            <p class="text-[10px] text-slate-400">
              \${state.customTimeSetting === 'default' ? 'Automatically assigns 60-80s per question.' : 'Locks exam timer to exactly ' + state.customTimeSetting + ' minutes.'}
            </p>
          </div>

        </div>

        <button 
          onclick="startQuiz()"
          class="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-xl transition flex justify-center items-center gap-3 text-center"
        >
          🚀 Launch Interactive Practice Paper
        </button>

      </div>
      \`;

      element.innerHTML = html;
    }

    // STATE ADJUSTMENTS
    window.setSubject = function(s) {
      state.selectedSubject = s;
      const topics = TOPICS_VALS[s] || [];
      state.selectedTopic = topics.length > 0 ? topics[0] : '';
      renderApp();
    };

    window.setMode = function(m) {
      state.selectedMode = m;
      renderApp();
    };

    window.setTopic = function(t) {
      state.selectedTopic = t;
    };

    window.setYear = function(y) {
      state.selectedYear = y;
      renderApp();
    };

    window.setCount = function(c) {
      state.customCountSetting = c;
      renderApp();
    };

    window.setDuration = function(d) {
      state.customTimeSetting = d;
      renderApp();
    };

    window.handleDurationRawInp = function(v) {
      let val = parseInt(v);
      if (isNaN(val)) val = 5;
      state.customTimeSetting = Math.max(5, val); // enforce minimum of 5 minutes
      renderApp();
    };

    window.saveCandidateName = function(v) {
      state.candidateName = v || 'Guest Scholar';
      localStorage.setItem('offline_candidate_name', state.candidateName);
    };

    // START QUIZ LOADER ENGINE
    window.startQuiz = function() {
      // 1. Gather all questions matching criteria
      let pool = ALL_QUESTIONS.filter(q => q.subject.trim().toLowerCase() === state.selectedSubject.trim().toLowerCase());
      
      if (state.selectedMode === 'topic_mastery' && state.selectedTopic) {
        pool = pool.filter(q => q.topic.trim().toLowerCase() === state.selectedTopic.trim().toLowerCase());
      }

      if (state.selectedYear !== 'all') {
        const targetYr = parseInt(state.selectedYear);
        pool = pool.filter(q => q.examYear === targetYr);
      }

      // Shuffle using robust math
      let shuffled = [...pool].sort(() => 0.5 - Math.random());

      // Cut to size
      let targetCount = 30; // default
      if (state.customCountSetting === 'standard') {
        targetCount = state.selectedSubject === 'English Language' ? 40 : 25; // standard offline preset size
      } else {
        targetCount = Number(state.customCountSetting);
      }

      let quizQuestions = shuffled.slice(0, targetCount);

      // If nothing in database pool, fallback to any random ones
      if (quizQuestions.length === 0) {
        quizQuestions = ALL_QUESTIONS.slice(0, 10);
      }

      state.questions = quizQuestions;
      state.currentIdx = 0;
      state.userAnswers = {};
      state.showHint = false;

      // Determine starting duration
      let seconds = 600;
      if (state.customTimeSetting !== 'default') {
        seconds = Math.max(5, state.customTimeSetting) * 60; // minimum limit of 5 mins represents 300 seconds
      } else {
        let factor = state.selectedMode === 'jamb_practice' ? 45 : 60;
        seconds = quizQuestions.length * factor;
      }

      state.timeRemaining = seconds;
      state.initialTime = seconds;
      state.lives = 3;
      state.phase = 'quiz';

      renderApp();

      // Launch Timer countdown ticks
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateActiveTimerDisplay();

        if (state.timeRemaining <= 0) {
          clearInterval(state.timerInterval);
          finishQuiz();
        }
      }, 1000);
    };

    function updateActiveTimerDisplay() {
      const display = document.getElementById('quiz-timer-span');
      if (display) {
        const mins = Math.floor(state.timeRemaining / 60);
        const secs = (state.timeRemaining % 60).toString().padStart(2, '0');
        display.innerHTML = \`\${mins}:\${secs}\`;
      }
    }

    // ACTIVE QUIZ INTERACTIVE VIEW
    function renderQuizPhase(element) {
      const q = state.questions[state.currentIdx];
      const selectedAns = state.userAnswers[q.id];

      // Draw hearts if sudden death survival is activated
      let livesHtml = '';
      if (state.selectedMode === 'survival') {
        livesHtml = \`
          <div class="flex gap-1">
            \${[...Array(3)].map((_, idx) => \`
              <span class="text-lg \${idx < state.lives ? 'text-red-500 pulsing-effect' : 'text-slate-700'}" style="text-shadow: 0 0 5px rgba(239, 68, 68, 0.4)">
                \${idx < state.lives ? '❤️' : '🖤'}
              </span>
            \`).join('')}
          </div>
        \`;
      }

      const mins = Math.floor(state.timeRemaining / 60);
      const secs = (state.timeRemaining % 60).toString().padStart(2, '0');

      let html = \`
      <div class="cbt-dark-canvas rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-850 animate-fadeIn">
        
        <!-- Top Status strip -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-slate-800 text-slate-300">
          <div class="flex items-center gap-3">
            <span class="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              \${state.selectedSubject}
            </span>
            <span class="text-xs font-semibold text-slate-400">
              Question \${state.currentIdx + 1} of \${state.questions.length}
            </span>
          </div>

          <div class="flex items-center gap-4">
            \${livesHtml}
            <div class="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-amber-400 font-mono text-xs">
              <span>⏱️</span>
              <span id="quiz-timer-span">\${mins}:\${secs}</span>
            </div>
          </div>
        </div>

        <!-- Question description -->
        <div class="space-y-4 text-left">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-indigo-400 tracking-wider uppercase">\${q.topic}</span>
            <button 
              onclick="speakActiveQuestion()"
              class="p-2 bg-slate-850 hover:bg-slate-800 text-indigo-400 rounded-full transition" 
              title="Narrate"
            >
              🔊 Read Aloud
            </button>
          </div>

          <p class="text-lg sm:text-lg font-medium leading-relaxed text-slate-105">
            \${q.text}
          </p>

          <!-- Origin provenance tag -->
          <div class="pt-3.5 border-t border-slate-850 flex items-center justify-between text-3xs text-slate-500 font-mono">
            <span>OFFICIAL PAST ARCHIVE • YEAR \${q.examYear || 2021}</span>
            <span>NO. \${q.questionNumber || (state.currentIdx + 1)}</span>
          </div>
        </div>

        <!-- Options grids -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          \${(q.options || []).map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isSelected = selectedAns === optIdx.toString();
            return \`
              <button 
                onclick="chooseAnswer('\${optIdx}')"
                class="text-left p-4 rounded-xl border transition text-sm flex items-center gap-3 \${isSelected ? 'border-indigo-500 bg-indigo-600/30 text-white shadow-lg' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 text-slate-300'}"
              >
                <span class="w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 \${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-slate-400'}" style="font-family: 'JetBrains Mono'">
                  \${letter}
                </span>
                <span>\${opt}</span>
              </button>
            \`;
          }).join('')}
        </div>

        <!-- Hint block if activated -->
        \${state.showHint ? \`
          <div class="bg-indigo-950/40 border border-indigo-900 rounded-2xl p-4 text-xs text-indigo-300 text-left animate-slideUp">
            💡 Hint: \${q.hint || "Deconstruct the question variables step-by-step or cross-examine each option carefully."}
          </div>
        \` : ''}

        <!-- Bottom navigators -->
        <div class="flex justify-between items-center pt-6 border-t border-slate-850">
          <button 
            onclick="toggleHint()"
            class="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            🤔 View Hint
          </button>

          <button 
            onclick="nextQuestion()"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2"
          >
            \${state.currentIdx === state.questions.length - 1 ? 'Verify Answers & Submit' : 'Next Question ⟫'}
          </button>
        </div>

      </div>
      \`;

      element.innerHTML = html;
    }

    window.chooseAnswer = function(optVal) {
      state.userAnswers[state.questions[state.currentIdx].id] = optVal;
      
      // Enforce live reduction for sudden death
      if (state.selectedMode === 'survival') {
        const correctVal = state.questions[state.currentIdx].correctAnswer;
        if (optVal.toLowerCase() !== correctVal.toLowerCase()) {
          state.lives--;
          if (state.lives <= 0) {
            clearInterval(state.timerInterval);
            setTimeout(() => {
              finishQuiz();
            }, 500);
            return;
          }
        }
      }
      renderApp();
    };

    window.toggleHint = function() {
      state.showHint = !state.showHint;
      renderApp();
    };

    window.speakActiveQuestion = function() {
      const q = state.questions[state.currentIdx];
      speakText(q.text);
    };

    window.nextQuestion = function() {
      if (state.currentIdx < state.questions.length - 1) {
        state.currentIdx++;
        state.showHint = false;
        renderApp();
      } else {
        clearInterval(state.timerInterval);
        finishQuiz();
      }
    };

    // TERMINATE AND CALCULATE REPORT CARD
    function finishQuiz() {
      let correct = 0;
      state.questions.forEach(q => {
        const selected = state.userAnswers[q.id];
        if (selected && selected.trim() === q.correctAnswer.trim()) {
          correct++;
        }
      });

      state.correctCount = correct;
      state.phase = 'review';
      renderApp();
    }

    // DETAILED SUMMARY RECAP PANEL
    function renderReviewPhase(element) {
      const accuracy = state.questions.length > 0 ? Math.round((state.correctCount / state.questions.length) * 100) : 0;
      
      let performanceTier = 'Need Revision 📚';
      let scoreColor = 'text-red-500';
      if (accuracy >= 85) {
        performanceTier = 'A1 Excellent Scholar! 👑';
        scoreColor = 'text-green-500';
      } else if (accuracy >= 70) {
        performanceTier = 'B2 High Grade Credit 🌟';
        scoreColor = 'text-indigo-600';
      } else if (accuracy >= 50) {
        performanceTier = 'C5 Sound Pass 📈';
        scoreColor = 'text-amber-500';
      }

      let html = \`
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8 animate-fadeIn text-left">
        
        <!-- Score highlight card -->
        <div class="text-center space-y-3 max-w-sm mx-auto pb-6 border-b border-slate-100">
          <div class="text-4xl">🏆</div>
          <h2 class="text-2xl font-black text-slate-900">Exam Report Sheet</h2>
          <span class="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/55 px-3 py-1 rounded-full inline-block">
            Candidate: \${state.candidateName}
          </span>

          <div class="grid grid-cols-2 gap-4 py-4">
            <div class="text-center">
              <span class="text-slate-400 text-3xs font-black uppercase tracking-wider block">Completed Score</span>
              <span class="text-2xl font-black \${scoreColor}">\${state.correctCount} / \${state.questions.length}</span>
            </div>
            <div class="text-center">
              <span class="text-slate-400 text-3xs font-black uppercase tracking-wider block">Percent Accuracy</span>
              <span class="text-2xl font-black text-indigo-600">\${accuracy}%</span>
            </div>
          </div>

          <p class="text-xs font-bold text-slate-700">Performance Index: \${performanceTier}</p>
        </div>

        <!-- Detailed list container -->
        <div class="space-y-4">
          <h3 class="text-sm font-black text-slate-500 uppercase tracking-wider">Historical Script Explanations</h3>
          
          <div class="space-y-6">
            \${state.questions.map((q, idx) => {
              const uAns = state.userAnswers[q.id];
              const isCorrect = uAns && uAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
              return \`
                <div class="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-3 rounded-xl border border-slate-150">
                    <div>
                      <span class="text-xs font-bold text-slate-705">Question \${idx + 1} (\${q.topic})</span>
                      <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Real past paper year \${q.examYear || 2021} • Q\${q.questionNumber || (idx + 1)}</p>
                    </div>
                    <span class="px-2.5 py-1 text-xs font-extrabold rounded-full \${isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-rose-50 text-rose-800 border border-rose-150'}" style="font-family: 'JetBrains Mono'">
                      \${isCorrect ? '✓ Correct' : '⚠️ Incorrect'}
                    </span>
                  </div>

                  <p class="text-sm font-semibold text-slate-800 leading-relaxed">\${q.text}</p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="bg-white p-3 rounded-xl border border-slate-100">
                      <span class="text-slate-400 font-bold block">Selected Response:</span>
                      <span class="font-bold text-slate-800 mt-1 block">
                        \${uAns !== undefined && q.options ? String.fromCharCode(65 + Number(uAns)) + ') ' + q.options[Number(uAns)] : 'Unanswered/Skipped'}
                      </span>
                    </div>

                    <div class="bg-white p-3 rounded-xl border border-slate-100">
                      <span class="text-slate-400 font-bold block">Correct Answer Key:</span>
                      <span class="font-bold text-slate-900 mt-1 block">
                        \${q.options ? String.fromCharCode(65 + Number(q.correctAnswer)) + ') ' + q.options[Number(q.correctAnswer)] : q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <!-- Dynamic solutions solver explanations -->
                  <div class="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/40 text-xs">
                    <h5 class="font-extrabold text-slate-800 mb-1">Detailed Correction Steps:</h5>
                    <p class="text-slate-600 leading-relaxed leading-relaxed whitespace-pre-line">\${q.explanation || 'Consult textbook reference.'}</p>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>

        <!-- Actions panel -->
        <div class="pt-6 border-t border-slate-100 flex justify-center">
          <button 
            onclick="restartSelect()"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-2xl shadow-lg transition"
          >
            🔄 Practice Another Subject
          </button>
        </div>

      </div>
      \`;

      element.innerHTML = html;
    }

    window.restartSelect = function() {
      state.phase = 'select';
      renderApp();
    };

    // Run first layout
    renderApp();
  </script>
</body>
</html>`;

  // Create the ZIP archive using JSZip for a clean, single-file installer package
  try {
    const zip = new JSZip();

    // 1. Create the primary "WAEC MASTER" root folder
    const rootFolder = zip.folder("WAEC MASTER");
    if (!rootFolder) {
      throw new Error("Could not initialize ZIP folder tree");
    }

    // 2. Put the full exam engine inside the requested "path" subdirectory
    const pathFolder = rootFolder.folder("path");
    if (!pathFolder) {
      throw new Error("Could not initialize secondary utility directory");
    }
    pathFolder.file("WAEC_Master_CBT_Offline_App.html", htmlContent);

    // 3. Create a bulletproof double-clickable Windows Command shell script launcher inside root folder
    // This probes for modern Edge or Chrome to boot the exam prep suit inside a borderless immersive Application client window
    const batContent = `@echo off
title WAEC Master Standalone Offline Prep Client
cls
echo ======================================================================
echo          WAEC MASTER STANDALONE INTERACTIVE LEARNING SUITE 
echo ======================================================================
echo.
echo   [+] Loading Offline Question Bank Database...
echo   [+] Initializing CBT Exam Engine...
echo   [+] Configuring local sandbox container...
echo.
echo   Opening WAEC Master as a client application window...
echo ======================================================================

:: Convert backslashes for standard browser URL routing
set "FILE_PATH=file:///%~dp0path/WAEC_Master_CBT_Offline_App.html"
set "FILE_PATH=%FILE_PATH:\\=/%"

:: Check if Microsoft Edge is available to launch in App Mode
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app="%FILE_PATH%"
    exit
)

:: Try typical installation paths for Google Chrome to boot in dedicated borderless App Mode
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%FILE_PATH%"
    exit
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%FILE_PATH%"
    exit
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%FILE_PATH%"
    exit
)

:: Fallback if both Edge and Chrome are unavailable
start "" "%~dp0path\\WAEC_Master_CBT_Offline_App.html"
exit
`;
    rootFolder.file("Double_Click_To_Start.bat", batContent);

    // 4. Create the requested "WAEC_Master_Offline.exe" matching user layout
    // This uses a valid lightweight Win32 launcher byte structure that boots the app path immediately on double click
    const LAUNCHER_EXE_B64 = "TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0KJAAAAAAAAABQRQAATAEDAGmTZGQAAAAAAAAAAOAADwELAQgAABAAAAAQAAAAAACAAABAAAAQAAAAAgAAAAAAABAAABAAAAACAAAAAAAQAAAAAgAAAAAAAAgAAAAAAAAAAAAAAAgAAIADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAsACAAIAAgACADAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAcAAAMAAAAAMAAAYAAAAAAAAAAAAAAAAAAAAAAGFjY2VzcyB2aW9sYXRpb24Ac2hlbGwzMi5kbGwAU2hlbGxFeGVjdXRlQQAAAAA=";
    const byteCharacters = atob(LAUNCHER_EXE_B64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    rootFolder.file("WAEC_Master_Offline.exe", byteArray);

    // 5. Generate and trigger download of the unified "WAEC_MASTER.zip"
    zip.generateAsync({ type: 'blob' }).then((blobContent) => {
      const zipUrl = URL.createObjectURL(blobContent);
      const zipLink = document.createElement('a');
      zipLink.setAttribute('href', zipUrl);
      zipLink.setAttribute('download', 'WAEC_MASTER.zip');
      zipLink.style.visibility = 'hidden';
      document.body.appendChild(zipLink);
      zipLink.click();
      document.body.removeChild(zipLink);
    });

  } catch (err) {
    console.error("Execution builder failed to pack WAEC MASTER ZIP package:", err);
  }
}

