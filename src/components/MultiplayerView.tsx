import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Flame,
  Award,
  Timer,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  Zap,
  Smile,
  Trophy,
  Bot,
  Play,
  ShieldAlert,
} from "lucide-react";
import { BattleRoom, Question } from "../types";

interface MultiplayerViewProps {
  currentUsername: string;
  avatar: string;
  level: number;
  onBattleWon: (xpReward: number) => void;
}

export default function MultiplayerView({
  currentUsername,
  avatar,
  level,
  onBattleWon,
}: MultiplayerViewProps) {
  // Phase states: 'init' -> 'connecting' -> 'fight' -> 'winner'
  const [phase, setPhase] = useState<
    "init" | "connecting" | "fight" | "winner"
  >("init");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [localScore, setLocalScore] = useState(0);
  const [opponentReaction, setOpponentReaction] = useState("");
  const [secRemaining, setSecRemaining] = useState(12); // Short time per question!

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SUBJECTS = [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
  ];

  // Start matching queue
  const handleJoinQueue = async () => {
    setPhase("connecting");
    try {
      const resp = await fetch("/api/battles/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUsername,
          avatar,
          level,
          subject: selectedSubject,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.status === "matched") {
          setRoom(data.room);

          const questionsResp = await fetch("/api/questions");
          const allQuestions: Question[] = questionsResp.ok
            ? await questionsResp.json()
            : [];
          const filteredQs = allQuestions.filter(
            (q) => q.subject === selectedSubject,
          );
          const shuffledQs = [...filteredQs].sort(() => 0.5 - Math.random());
          const matchedQs = shuffledQs.slice(0, 5);

          if (matchedQs.length === 0) {
            setPhase("init");
            return;
          }

          setQuestions(matchedQs);

          setPhase("fight");
          setCurrentQIdx(0);
          setLocalScore(0);
          setSelectedOpt(null);
          setSecRemaining(12);

          // Begin polling for opponent score state updates
          startRoomPolling(data.room.roomId);
          startQuestionCountdown();
        }
      } else {
        setPhase("init");
      }
    } catch (err) {
      console.error("Matchmaking failed:", err);
      setPhase("init");
    }
  };

  // Start Polling room once matching succeeds
  const startRoomPolling = (rId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/battles/poll/${rId}`);
        if (res.ok) {
          const data = await res.json();
          const currentRoom: BattleRoom = data.room;
          setRoom(currentRoom);

          // Track reactions
          const opponent =
            currentRoom.player1.username === currentUsername
              ? currentRoom.player2
              : currentRoom.player1;

          if (opponent && opponent.lastReaction) {
            setOpponentReaction(opponent.lastReaction);
            // Clear reaction after 2.5 seconds
            setTimeout(() => setOpponentReaction(""), 2500);
          }

          // If both players have completed 5 questions, finalize battle
          if (currentRoom.status === "finished") {
            clearInterval(pollIntervalRef.current!);
            clearInterval(questionTimerRef.current!);
            setPhase("winner");

            const localPlayer =
              currentRoom.player1.username === currentUsername
                ? currentRoom.player1
                : currentRoom.player2;
            const oppPlayer =
              currentRoom.player1.username === currentUsername
                ? currentRoom.player2
                : currentRoom.player1;

            if (
              localPlayer &&
              oppPlayer &&
              localPlayer.score > oppPlayer.score
            ) {
              onBattleWon(100); // 100 XP award!
            }
          }
        }
      } catch (err) {
        console.error("Failed to poll live match status:", err);
      }
    }, 1300);
  };

  // Timed countdown per question (fast reflexes required)
  const startQuestionCountdown = () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    setSecRemaining(12);

    questionTimerRef.current = setInterval(() => {
      setSecRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this question: skip
          handleAnswerSelection("-1");
          return 12;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send answer selection dynamically and notify API
  const handleAnswerSelection = async (optIdxStr: string) => {
    if (!room) return;
    setSelectedOpt(optIdxStr);

    let isCorrect = false;
    let earnedScore = 0;
    const currentQ = questions[currentQIdx];
    if (
      currentQ &&
      currentQ.correctAnswer.toLowerCase() === optIdxStr.toLowerCase()
    ) {
      isCorrect = true;
      // Bonus score for faster response
      earnedScore = 15 + secRemaining;
    }

    const updatedScore = localScore + earnedScore;
    setLocalScore(updatedScore);

    // Update in backend matching store
    try {
      await fetch("/api/battles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.roomId,
          username: currentUsername,
          score: updatedScore,
          questionIdx: currentQIdx + 1,
        }),
      });
    } catch (e) {
      console.error("Update score endpoint failed:", e);
    }

    // Progress
    setTimeout(() => {
      setSelectedOpt(null);
      if (currentQIdx < 4) {
        setCurrentQIdx((prev) => prev + 1);
        startQuestionCountdown();
      } else {
        // Finished all 5 questions. Wait for opponent to finish.
        clearInterval(questionTimerRef.current!);
      }
    }, 800);
  };

  // Emoji messaging trigger
  const handleSendReaction = async (emojiStr: string) => {
    if (!room) return;
    try {
      await fetch("/api/battles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.roomId,
          username: currentUsername,
          score: localScore,
          questionIdx: currentQIdx,
          lastReaction: `${emojiStr}`,
        }),
      });
    } catch (e) {
      console.error("Failed to dispatch emoji expression:", e);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);

  const getOpponentUser = () => {
    if (!room) return null;
    return room.player1.username === currentUsername
      ? room.player2
      : room.player1;
  };

  const getLocalUser = () => {
    if (!room) return null;
    return room.player1.username === currentUsername
      ? room.player1
      : room.player2;
  };

  return (
    <div
      id="multiplayer-root"
      className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-8"
    >
      {/* PHASE 1: CHOOSE SUBJECT AND ENTER QUEUE */}
      {phase === "init" && (
        <div id="multiplayer-init-view" className="text-center space-y-8 py-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="inline-flex p-4 bg-indigo-50 text-indigo-700 rounded-3xl shadow-sm">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              1v1 Multiplayer CBT Dual
            </h2>
            <p className="text-sm text-slate-500">
              Challenge other candidates in real-time speed assessments. Answer
              correctly, react with emojis, and steal XP trophies!
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Choose Battle Subject
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`p-3 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${selectedSubject === subj ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"}`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleJoinQueue}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-indigo-150 transition cursor-pointer flex justify-center items-center gap-2"
            >
              Enter Matchmaking Arena
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: MATCHMAKING QUEUE WAIT PAGE */}
      {phase === "connecting" && (
        <div
          id="multiplayer-queue-view"
          className="text-center py-12 space-y-8"
        >
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <Users className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-slate-900">
              Searching for Opponents...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Querying active candidate queues on the server. If matchmaking
              exceeds 5 seconds, an advanced AI CBT bot will spawn
              automatically!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 py-1.5 px-4 rounded-full text-xs text-slate-600">
            <Bot className="w-4 h-4 text-indigo-500 shrink-0" /> Bot fallback
            initialized. Ready to play!
          </div>
        </div>
      )}

      {/* PHASE 3: ACTIVE 1v1 FRAY BOARD */}
      {phase === "fight" && room && questions.length > 0 && (
        <div id="multiplayer-fight-panel" className="space-y-6">
          {/* Versus Header Cards */}
          <div className="grid grid-cols-11 items-center gap-2 bg-slate-950 text-white p-4.5 rounded-2xl border border-slate-900 relative">
            {/* Player 1 Details */}
            <div className="col-span-4 text-center space-y-1">
              <span className="text-2xl block">
                {getLocalUser()?.avatar || "👤"}
              </span>
              <h4 className="font-extrabold text-xs text-white truncate">
                {getLocalUser()?.username}
              </h4>
              <span className="font-mono text-xl font-bold text-emerald-400 block">
                {getLocalUser()?.score || 0} pts
              </span>
              <span className="text-[10px] text-slate-500">
                Q {getLocalUser()?.currentQuestionIndex || 0} / 5
              </span>
            </div>

            {/* VS Indicator */}
            <div className="col-span-3 text-center space-y-2">
              <span className="text-2xs font-extrabold tracking-widest text-indigo-500 uppercase block">
                VERSUS DUAL
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-900 rounded-full text-amber-500 font-mono text-2xs font-bold">
                <Timer className="w-3.5 h-3.5" /> {secRemaining}s
              </div>
            </div>

            {/* Player 2 Opponent Details */}
            <div className="col-span-4 text-center space-y-1 relative">
              <span className="text-2xl block">
                {getOpponentUser() ? getOpponentUser()?.avatar : "⏳"}
              </span>
              <h4 className="font-extrabold text-xs text-white truncate">
                {getOpponentUser()
                  ? getOpponentUser()?.username
                  : "Connecting..."}
              </h4>
              <span className="font-mono text-xl font-bold text-cyan-400 block">
                {getOpponentUser() ? getOpponentUser()?.score : 0} pts
              </span>
              <span className="text-[10px] text-slate-500">
                Q{" "}
                {getOpponentUser()
                  ? getOpponentUser()?.currentQuestionIndex
                  : 0}{" "}
                / 5
              </span>

              {/* Opponent reaction expression cloud */}
              {opponentReaction && (
                <div className="absolute -top-10 right-0 bg-indigo-600 text-white font-bold text-xs p-2 rounded-xl border border-indigo-400/50 shadow-md animate-bounce shrink-0 whitespace-nowrap z-50">
                  {opponentReaction}
                </div>
              )}
            </div>
          </div>

          {/* Question display layout (or Wait screen if finished earlier) */}
          {currentQIdx < 5 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Question {currentQIdx + 1} of 5
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {questions[currentQIdx].topic}
                </span>
              </div>

              <p className="text-base text-slate-800 font-medium font-sans">
                {questions[currentQIdx].text}
              </p>

              {/* OPTIONS */}
              {questions[currentQIdx].type === "mcq" &&
              questions[currentQIdx].options ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {questions[currentQIdx].options.map((opt, oIdx) => {
                    const ltr = String.fromCharCode(65 + oIdx);
                    const isSelected = selectedOpt === oIdx.toString();
                    return (
                      <button
                        key={oIdx}
                        disabled={selectedOpt !== null}
                        onClick={() => handleAnswerSelection(oIdx.toString())}
                        className={`text-left p-4 rounded-xl border transition cursor-pointer ${isSelected ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold" : "border-slate-150 bg-white hover:bg-slate-100 text-slate-700"}`}
                      >
                        <span className="font-bold mr-2 text-indigo-600">
                          {ltr}.
                        </span>{" "}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">
                    Written Entry
                  </span>
                  <input
                    type="text"
                    disabled={selectedOpt !== null}
                    placeholder="Enter short answer, then press Submit"
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleAnswerSelection(
                          (e.target as HTMLInputElement).value,
                        );
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden text-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-indigo-500 animate-spin mx-auto flex items-center justify-center text-xl">
                ⏳
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm">
                Perfect Round Complete!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You have finished all 5 questions. We are awaiting your
                competitor to submit their diagnostic sheet. Hang tight!
              </p>
            </div>
          )}

          {/* CHAT/EMOJI INTERACTIVE ACTIONS */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">
              Blast emoji:
            </span>
            <div className="flex gap-2.5">
              {["👋", "🔥", "😂", "😮", "🧠", "😳", "👍"].map((emj) => (
                <button
                  key={emj}
                  onClick={() => handleSendReaction(emj)}
                  className="p-1 px-2.5 h-8 bg-white hover:bg-slate-100 border border-slate-150 rounded-lg text-lg transition duration-150 cursor-pointer"
                >
                  {emj}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: RESULTS AND trophy SHOWCASE */}
      {phase === "winner" && room && (
        <div
          id="multiplayer-results-panel"
          className="text-center py-6 space-y-6 max-w-sm mx-auto"
        >
          {/* Winner logic */}
          {room.winner === currentUsername ? (
            <div className="space-y-4">
              <div className="inline-flex p-5 bg-amber-50 rounded-full border-4 border-amber-300 text-amber-500 animate-bounce shadow-md">
                <Trophy className="w-16 h-16" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl text-slate-900">
                  Champion! Victory Dual!
                </h2>
                <p className="text-xs text-slate-500">
                  You completely outclassed your competitor and secured victory.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-xs rounded-xl inline-block">
                🎉 Won +100 XP Trophy bonus!
              </div>
            </div>
          ) : room.winner === "Draw" ? (
            <div className="space-y-4">
              <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-600">
                <Zap className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-xl text-slate-800">
                  Spectacular Draw!
                </h2>
                <p className="text-xs text-slate-500">
                  You scored the exact same points! Perfect matching reflexes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-500">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-xl text-slate-800 font-sans">
                  Defeat
                </h2>
                <p className="text-xs text-slate-500">
                  Your opponent excelled in diagnostic speed. Train with AI
                  coach to strengthen your agility!
                </p>
              </div>
            </div>
          )}

          {/* Scores Table Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 text-xs text-slate-700 divide-y divide-slate-200">
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold">Your Score</span>
              <span className="font-mono font-bold text-indigo-700">
                {getLocalUser()?.score || 0} pts
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold">Opponent Score</span>
              <span className="font-mono font-bold text-indigo-700">
                {getOpponentUser()?.score || 0} pts
              </span>
            </div>
          </div>

          <button
            onClick={() => setPhase("init")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-150 transition cursor-pointer"
          >
            Enter Arena Queue Again
          </button>
        </div>
      )}
    </div>
  );
}
