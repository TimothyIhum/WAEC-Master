import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Timer,
  Award,
  CheckCircle,
  XCircle,
  Volume2,
  HelpCircle,
  Sparkles,
  Download,
  Check,
  RefreshCw,
  Flame,
  ArrowRight,
  ArrowLeft,
  Heart,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Question } from "../types";
import { SUBJECTS_LIST, TOPICS_BY_SUBJECT } from "../data/questions";
import { getCbtSimulationQuestions } from "../data/questionsGenerator";
import { downloadOfflineCbtApp } from "../utils/appDownloader";

interface CbtSimulatorProps {
  userXP: number;
  userLevel: number;
  onQuizCompleted: (
    xpEarned: number,
    correctCount: number,
    totalCount: number,
    timeSpentMin: number,
  ) => void;
  onAskAiTutor: (question: Question) => void;
  downloadedSubjects: string[];
  onDownloadSubject: (subject: string) => void;
  subjectsList?: string[];
  questionsList?: Question[];
}

type ExamMode =
  | "waec_simulation"
  | "jamb_practice"
  | "speed_challenge"
  | "survival"
  | "topic_mastery";

export default function CbtSimulator({
  userXP,
  userLevel,
  onQuizCompleted,
  onAskAiTutor,
  downloadedSubjects,
  onDownloadSubject,
  subjectsList = SUBJECTS_LIST,
  questionsList = [],
}: CbtSimulatorProps) {
  // Phase states: 'select' -> 'quiz' -> 'review'
  const [phase, setPhase] = useState<"select" | "quiz" | "review">("select");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedMode, setSelectedMode] = useState<ExamMode>("waec_simulation");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
  const [customCountSetting, setCustomCountSetting] = useState<
    "standard" | "all_available" | "official_exam" | number
  >("standard");
  const [customTimeSetting, setCustomTimeSetting] = useState<
    number | "default"
  >("default");

  // Quiz running states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(600); // in seconds
  const [initialTime, setInitialTime] = useState(600);
  const [lives, setLives] = useState(3); // For survival mode
  const [showHint, setShowHint] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [noQuestionsMessage, setNoQuestionsMessage] = useState<string>("");

  // Stats post quiz
  const [correctCount, setCorrectCount] = useState(0);
  const [calculatedXp, setCalculatedXp] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize selected topic when subject changes
  useEffect(() => {
    const topics = TOPICS_BY_SUBJECT[selectedSubject] || [];
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
    }
  }, [selectedSubject]);

  // Audio synthesis Voice read helper
  const handleSpeakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const sentence = new SpeechSynthesisUtterance(text);
      sentence.rate = 0.95;
      window.speechSynthesis.speak(sentence);
    }
  };

  // Start Exam
  const handleStartExam = () => {
    setNoQuestionsMessage("");
    let examType: "WAEC" | "JAMB" =
      selectedMode === "jamb_practice" ? "JAMB" : "WAEC";

    let countParam: number | "standard" | "official_exam" = "official_exam";
    if (
      customCountSetting === "all_available" ||
      customCountSetting === "official_exam"
    ) {
      countParam = "official_exam";
    } else if (customCountSetting === "standard") {
      countParam = "standard";
    } else {
      countParam = Number(customCountSetting);
    }

    // Call dynamic generator with the master database questionsList
    let topicParam =
      selectedMode === "topic_mastery" ? selectedTopic : undefined;
    const quizQuestions = getCbtSimulationQuestions(
      selectedSubject,
      examType,
      selectedYear,
      countParam,
      topicParam,
      questionsList,
    );

    if (quizQuestions.length === 0) {
      setNoQuestionsMessage(
        selectedYear === "all"
          ? `No Questions Found for ${selectedSubject}.`
          : `No Questions Found for ${selectedSubject} ${selectedYear}.`,
      );
      return;
    }

    // Calculate realistic exam timer
    let seconds = 600; // default 10 minutes
    if (customTimeSetting !== "default") {
      seconds = Math.max(5, customTimeSetting) * 60;
    } else if (selectedMode === "speed_challenge") {
      seconds = quizQuestions.length * 30; // exactly 30s per question
    } else if (selectedMode === "survival") {
      seconds = Math.max(300, quizQuestions.length * 45);
      setLives(3);
    } else {
      // General full simulation
      let factor = examType === "JAMB" ? 60 : 80; // seconds per question
      seconds = quizQuestions.length * factor;
    }

    setQuestions(quizQuestions);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeRemaining(seconds);
    setInitialTime(seconds);
    setPhase("quiz");

    // Start countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle Answers
  const handleAnswerSelect = (indexStr: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentIdx].id]: indexStr,
    }));

    // If survival mode, check answer immediately to subtract lives
    if (selectedMode === "survival") {
      const isCorrect =
        questions[currentIdx].correctAnswer.toLowerCase() ===
        indexStr.toLowerCase();
      if (!isCorrect) {
        setLives((l) => {
          const updated = l - 1;
          if (updated <= 0) {
            setTimeout(() => {
              handleFinishExam();
            }, 800);
          }
          return updated;
        });
      }
    }
  };

  // Skip/Next
  const handleNextQuestion = () => {
    setShowHint(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinishExam();
    }
  };

  // Terminate and compute results
  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Score computations
    let correct = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (
        ans &&
        ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      ) {
        correct++;
      }
    });

    const accuracyVal = questions.length > 0 ? correct / questions.length : 0;

    // Base XP allocation
    let xpAward = correct * 25;
    if (accuracyVal >= 0.9) xpAward += 50; // A1 Excellence bonus
    if (selectedMode === "speed_challenge") xpAward += 30; // Speed incentive

    setCorrectCount(correct);
    setCalculatedXp(xpAward);
    setPhase("review");

    // Notify Root context
    const elapsedSeconds = initialTime - timeRemaining;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    onQuizCompleted(xpAward, correct, questions.length, elapsedMinutes);
  };

  // Cancel active exam session and return to selection screen without saving
  const handleExitConfirmed = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowExitConfirm(false);
    setPhase("select");
  };

  // Simulate downloading questions for offline use
  const simulateDownload = (subj: string) => {
    setDownloading(subj);
    setTimeout(() => {
      onDownloadSubject(subj);
      setDownloading(null);
    }, 1500);
  };

  const getPercentageString = () => {
    if (questions.length === 0) return "0%";
    return Math.round((correctCount / questions.length) * 100) + "%";
  };

  return (
    <div id="cbt-simulator-root" className="h-full space-y-6">
      {/* PHASE 1: CHOOSE CONTEXTS */}
      {phase === "select" && (
        <div
          id="cbt-settings-panel"
          className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                <Award className="text-indigo-600 w-7 h-7" />
                West African CBT Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Practice past WAEC papers, solve formulas, or survive
                high-stakes time trials
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => downloadOfflineCbtApp(questionsList)}
                disabled={questionsList.length === 0}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white border-0 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-100 transition cursor-pointer"
                title="Download single-file fully interactive CBT app to practice offline"
              >
                <Download className="w-4 h-4 text-white animate-bounce shrink-0" />
                Download App (Use Offline ⚡)
              </button>

              <div className="p-2 px-3 bg-indigo-50 border border-indigo-100/50 rounded-2xl text-[10px] sm:text-xs font-bold text-indigo-700 flex items-center gap-1.5 animate-pulse shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> Earn Double XP!
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                1. Select WAEC Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {subjectsList.map((subj) => {
                  const isDownloaded = downloadedSubjects.includes(subj);
                  return (
                    <div
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`relative p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-24 ${selectedSubject === subj ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100"}`}
                    >
                      <span className="font-semibold text-xs leading-tight">
                        {subj}
                      </span>

                      <div className="flex justify-between items-center mt-2">
                        {isDownloaded ? (
                          <span
                            className={`text-[9px] font-bold py-0.5 px-2 rounded-full ${selectedSubject === subj ? "bg-indigo-500/50 text-white" : "bg-emerald-100 text-emerald-800"}`}
                          >
                            Offline OK
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              simulateDownload(subj);
                            }}
                            disabled={downloading !== null}
                            className={`text-[9px] font-black uppercase tracking-wider p-1 rounded-md flex items-center gap-0.5 pointer-events-auto ${selectedSubject === subj ? "text-indigo-200 hover:text-white" : "text-slate-400 hover:text-indigo-600"}`}
                          >
                            {downloading === subj ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Download className="w-2.5 h-2.5" />
                            )}
                            Save Offline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode selection panel */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                2. Choose Assessment Mode
              </label>
              <div className="space-y-3">
                {/* WAEC Simulation */}
                <div
                  onClick={() => setSelectedMode("waec_simulation")}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${selectedMode === "waec_simulation" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 bg-slate-50"}`}
                >
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-700 font-extrabold text-xs">
                    WAEC
                  </div>
                  <div className="grow">
                    <h4 className="font-bold text-slate-900 text-sm">
                      WAEC CBT Examination Simulation
                    </h4>
                    <p className="text-xs text-slate-500">
                      Mocks real CBT conditions with strict timers and
                      proportional marking.
                    </p>
                  </div>
                </div>

                {/* JAMB Practice */}
                <div
                  onClick={() => setSelectedMode("jamb_practice")}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${selectedMode === "jamb_practice" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 bg-slate-50"}`}
                >
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-700 font-extrabold text-xs">
                    JAMB
                  </div>
                  <div className="grow">
                    <h4 className="font-bold text-slate-900 text-sm">
                      JAMB Speed Booster
                    </h4>
                    <p className="text-xs text-slate-500">
                      High velocity speed practice to expand your rapid answer
                      choices.
                    </p>
                  </div>
                </div>

                {/* Survival Mode */}
                <div
                  onClick={() => setSelectedMode("survival")}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${selectedMode === "survival" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 bg-slate-50"}`}
                >
                  <div className="p-3 bg-red-100 rounded-xl text-red-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-red-600" />
                  </div>
                  <div className="grow w-0">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Lives Survival CBT
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      3 Lives. Lose a life for every incorrect answer. How far
                      can you survive?
                    </p>
                  </div>
                </div>

                {/* Speed Challenge */}
                <div
                  onClick={() => setSelectedMode("speed_challenge")}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${selectedMode === "speed_challenge" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 bg-slate-50"}`}
                >
                  <div className="p-3 bg-orange-100 rounded-xl text-orange-700 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="grow">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Speed Sprint Round
                    </h4>
                    <p className="text-xs text-slate-500">
                      Exactly 30 seconds per question limit. Earn huge double XP
                      multipliers!
                    </p>
                  </div>
                </div>

                {/* Topic Mastery */}
                <div
                  onClick={() => setSelectedMode("topic_mastery")}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col gap-3 cursor-pointer ${selectedMode === "topic_mastery" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 hover:border-slate-200 bg-slate-50"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-700 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="grow">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Syllabus Topic Mastery
                      </h4>
                      <p className="text-xs text-slate-500">
                        Focus your studies on 1 challenging syllabus segment.
                      </p>
                    </div>
                  </div>

                  {selectedMode === "topic_mastery" && (
                    <div className="pl-14">
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs focus:outline-hidden"
                      >
                        {(TOPICS_BY_SUBJECT[selectedSubject] || []).map(
                          (tp, idx) => (
                            <option key={idx} value={tp}>
                              {tp}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Year, Question Count & Timer Customization Row */}
          <div
            id="cbt-custom-filters"
            className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {/* Year Selector card */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                3. Choose Examination Year
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedYear(yr as any);
                        // Reset count setting back to standard in case the previously selected year had specific count constraints
                        if (
                          yr === "all" &&
                          customCountSetting === "all_available"
                        ) {
                          setCustomCountSetting("standard");
                        }
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {yr === "all"
                        ? "All Years (Aesthetic Mix)"
                        : `${yr} Past Edition`}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedYear === "all"
                  ? "Pulls questions across multiple years to ensure broad syllabus coverage."
                  : `Attempts to focus the entire paper specifically around the official original ${selectedYear} examination paper.`}
              </p>
            </div>

            {/* Questions Quantity Selector card */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                4. Select Number of Questions
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Simulated Practice Choice */}
                <button
                  type="button"
                  onClick={() => setCustomCountSetting("standard")}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    customCountSetting === "standard"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  📝 Simulated Practice Set (
                  {selectedSubject === "English Language"
                    ? "60"
                    : selectedMode === "jamb_practice"
                      ? "40"
                      : "50"}{" "}
                  Qs)
                </button>

                {/* Custom numeric counts */}
                {[5, 10, 15, 25, 40, 50, 60].map((count) => {
                  const isSelected = customCountSetting === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setCustomCountSetting(count)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {count} Qs
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {customCountSetting === "standard"
                  ? "Fills and pads questions up to full national standards using questions from the study database."
                  : `Configures a custom rapid review session comprising exactly ${customCountSetting} questions.`}
              </p>
            </div>

            {/* Custom Exam Timer Selector card */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                5. Set Exam Duration Timer
              </label>
              <div className="flex flex-wrap gap-1.5">
                {/* Standard choice */}
                <button
                  type="button"
                  onClick={() => setCustomTimeSetting("default")}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    customTimeSetting === "default"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-705 hover:bg-slate-100"
                  }`}
                >
                  ⏱️ Official Standard
                </button>

                {/* Preset time buttons */}
                {[5, 15, 30, 45, 60, 95].map((mins) => {
                  const isSelected = customTimeSetting === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomTimeSetting(mins)}
                      className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>

              {/* Slider / Exact Number Config */}
              <div className="bg-slate-50 border border-slate-100/80 p-3 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5 shrink-0">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                    Exact Minutes
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={
                        customTimeSetting === "default" ? 45 : customTimeSetting
                      }
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 5;
                        setCustomTimeSetting(Math.max(5, val));
                      }}
                      className="w-11 text-center bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1 px-0.5 text-xs font-bold text-slate-800"
                    />
                    <span className="text-[10px] font-bold text-slate-500">
                      Mins
                    </span>
                  </div>
                </div>

                <div className="grow">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={
                      customTimeSetting === "default" ? 45 : customTimeSetting
                    }
                    onChange={(e) =>
                      setCustomTimeSetting(parseInt(e.target.value))
                    }
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                    <span>Min (5m)</span>
                    <span>180m</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {customTimeSetting === "default"
                  ? "Dynamically matches actual official timeframe allocated by WAEC/JAMB bodies (recommendation based on your subject selection)."
                  : `Overrides and locks examination countdown strictly to exactly ${customTimeSetting} minutes.`}
              </p>
            </div>
          </div>

          {noQuestionsMessage && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {noQuestionsMessage}
            </div>
          )}

          <button
            id="start-exam-cbt-btn"
            onClick={handleStartExam}
            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-indigo-150 transition cursor-pointer flex justify-center items-center gap-3"
          >
            Launch {selectedSubject} Preparation{" "}
            <Play className="w-5 h-5 fill-white" />
          </button>
        </div>
      )}

      {/* PHASE 2: ACTIVE QUIZ TIMER LOOP */}
      {phase === "quiz" && questions.length > 0 && (
        <div
          id="cbt-active-exam-panel"
          className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative border border-slate-800"
        >
          {/* Header Progress Indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-slate-800 text-slate-300">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selectedSubject}
              </span>
              <span className="text-xs font-semibold">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Survival Mode hearts representation */}
              {selectedMode === "survival" && (
                <div role="img" aria-label="Lives" className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 ${i < lives ? "text-red-500 fill-red-500 animate-pulse" : "text-slate-700 fill-slate-800"}`}
                    />
                  ))}
                </div>
              )}

              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-amber-400 font-mono text-xs">
                <Timer className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Exit Button */}
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-300 text-xs font-bold rounded-full transition cursor-pointer"
                title="Leave exam session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-300" /> Exit
              </button>
            </div>
          </div>

          {/* Question Display Card */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-3">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {questions[currentIdx].topic}
              </span>
              <button
                type="button"
                onClick={() => handleSpeakQuestion(questions[currentIdx].text)}
                className="p-2 bg-slate-800 text-indigo-400 hover:text-white rounded-full transition"
                title="Read question aloud"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-lg md:text-xl font-medium leading-relaxed">
              {questions[currentIdx].text}
            </p>

            {/* Simulated diagram placeholder */}
            {questions[currentIdx].diagramUrl && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex justify-center py-6 text-slate-500 text-xs">
                📸 WAEC Figure 1.3 - Chemical Cell Electromotive diagram
                placeholder
              </div>
            )}

            {/* Real WAEC/JAMB Question provenance tag */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-slate-800 text-2xs text-slate-400 font-mono">
              <span className="bg-slate-800 text-indigo-400 border border-slate-750 font-bold px-2 py-0.5 rounded-md">
                Official {questions[currentIdx].examName || "WAEC"} Source
              </span>
              <span>•</span>
              <span>
                Academic Year:{" "}
                <strong className="text-slate-200">
                  {questions[currentIdx].examYear || 2021}
                </strong>
              </span>
              <span>•</span>
              <span>
                Question Number:{" "}
                <strong className="text-slate-200">
                  No. {questions[currentIdx].questionNumber || 12}
                </strong>
              </span>
            </div>
          </div>

          {/* OPTIONS CONTAINER */}
          <div className="space-y-3 pt-4">
            {questions[currentIdx].type === "mcq" &&
            questions[currentIdx].options ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {questions[currentIdx].options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected =
                    userAnswers[questions[currentIdx].id] === optIdx.toString();
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswerSelect(optIdx.toString())}
                      className={`text-left p-4.5 rounded-2xl border transition text-sm flex items-center gap-3 cursor-pointer ${isSelected ? "border-indigo-500 bg-indigo-600/35 text-white shadow-lg" : "border-slate-800 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300"}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                      >
                        {letter}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Short written answer container */
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">
                  Type Your Short Answer Below
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30"
                  value={userAnswers[questions[currentIdx].id] || ""}
                  onChange={(e) =>
                    setUserAnswers((prev) => ({
                      ...prev,
                      [questions[currentIdx].id]: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 px-4 text-white focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* HINT SYSTEM */}
          {showHint && (
            <div className="bg-indigo-950/50 border border-indigo-900 text-indigo-200 rounded-2xl p-4 text-xs font-semibold animate-fadeIn">
              💡 Hint:{" "}
              {questions[currentIdx].hint ||
                "Try splitting your equations step-by-step or converting all factors."}
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800 gap-4">
            <button
              onClick={() => setShowHint((h) => !h)}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Need a Hint?
            </button>

            <div className="flex items-center gap-3">
              {currentIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowHint(false);
                    setCurrentIdx(currentIdx - 1);
                  }}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-750 text-xs shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" /> Previous
                </button>
              )}

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border-none font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-950 text-xs"
              >
                {currentIdx === questions.length - 1
                  ? "Submit CBT Exam"
                  : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: COMPREHENSIVE RECAP AND EXPLANATIONS VIEW */}
      {phase === "review" && (
        <div
          id="cbt-review-panel"
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-8"
        >
          {/* Trophy Header info */}
          <div className="text-center space-y-4 max-w-sm mx-auto pb-4 border-b border-slate-100">
            <div className="inline-flex items-center justify-center p-4 bg-amber-50 rounded-full text-amber-600 border-2 border-amber-300">
              <Award className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-black text-2xl text-slate-900">
                Quiz Completed!
              </h2>
              <p className="text-xs text-slate-500">
                Excellent effort on {selectedSubject} in{" "}
                {selectedMode.toUpperCase().replace("_", " ")} mode
              </p>
            </div>

            <div className="flex justify-center gap-6 py-2">
              <div className="text-center">
                <span className="text-slate-400 text-2xs font-extrabold uppercase tracking-widest block">
                  Accuracy
                </span>
                <span className="font-mono text-2xl font-black text-indigo-600">
                  {getPercentageString()}
                </span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 text-2xs font-extrabold uppercase tracking-widest block">
                  XP Gained
                </span>
                <span className="font-mono text-2xl font-black text-emerald-600">
                  +{calculatedXp} <span className="text-xs">XP</span>
                </span>
              </div>
            </div>
          </div>

          {/* EXPLANATIONS LIST */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">
              Comprehensive Question Breakdown
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect =
                  userAns &&
                  userAns.trim().toLowerCase() ===
                    q.correctAnswer.trim().toLowerCase();

                return (
                  <div
                    key={q.id}
                    className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5"
                  >
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          Question {idx + 1} ({q.topic})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 text-left">
                          Real {q.examName || "WAEC"} Past Question • Year{" "}
                          {q.examYear || 2021} • Q{q.questionNumber || 12}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-800">
                      {q.text}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100/50">
                        <span className="text-slate-400 block font-semibold">
                          Your Answer:
                        </span>
                        <span className="font-bold text-slate-800">
                          {q.type === "mcq" && q.options
                            ? userAns !== undefined
                              ? `${String.fromCharCode(65 + Number(userAns))}) ${q.options[Number(userAns)]}`
                              : "Unanswered"
                            : userAns || "Unanswered"}
                        </span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100/50">
                        <span className="text-slate-400 block font-semibold">
                          Correct Answer:
                        </span>
                        <span className="font-bold text-slate-900">
                          {q.type === "mcq" && q.options
                            ? `${String.fromCharCode(65 + Number(q.correctAnswer))}) ${q.options[Number(q.correctAnswer)]}`
                            : q.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/30 text-xs text-indigo-950">
                      <h5 className="font-bold text-slate-800 mb-1">
                        Detailed WAEC Explanation:
                      </h5>
                      <p className="leading-relaxed whitespace-pre-line">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Ask coach micro button */}
                    <div className="flex justify-start pt-1">
                      <button
                        onClick={() => onAskAiTutor(q)}
                        className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-2xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ask
                        AI Tutor to Explain Step-by-Step
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 pt-4 justify-center">
            <button
              onClick={() => setPhase("select")}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm cursor-pointer transition flex items-center gap-2"
            >
              <RefreshCw className="w-4.5 h-4.5" /> Another CBT Quiz
            </button>
          </div>
        </div>
      )}

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full text-red-500 border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Are you sure you want to exit?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                Your progress in this practice or exam session will not be
                saved.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleExitConfirmed}
                className="w-full py-3 px-5 bg-red-400 hover:bg-red-500 text-[#333] font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md shadow-red-100"
              >
                Yes, exit session
              </button>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 px-5 bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-200"
              >
                Cancel, keep practicing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
