import React, { useState, useEffect } from "react";
import {
  Award,
  Trophy,
  MapPin,
  School,
  Star,
  Users,
  Flame,
  RefreshCw,
  Zap,
} from "lucide-react";
import { LeaderboardEntry } from "../types";

interface LeaderboardViewProps {
  currentUsername: string;
  userXP: number;
  userLevel: number;
}

export default function LeaderboardView({
  currentUsername,
  userXP,
  userLevel,
}: LeaderboardViewProps) {
  const [boardType, setBoardType] = useState<"global" | "school" | "state">(
    "global",
  );
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch updated records from backend Express in-memory store
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/leaderboard");
      if (resp.ok) {
        const data = await resp.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to query backend leaderboard entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [userXP]); // Re-sync when local student XP changes!

  // Filter rules (no hardcoded regions/schools)
  const getFilteredEntries = () => {
    return entries;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return "from-teal-400 to-indigo-600 text-transparent bg-clip-text font-black";
      case "Platinum":
        return "from-indigo-400 to-violet-500 text-transparent bg-clip-text font-extrabold";
      case "Gold":
        return "text-amber-500 font-extrabold";
      case "Silver":
        return "text-slate-400 font-bold";
      default:
        return "text-amber-800 font-medium";
    }
  };

  const TIERS_LIST = [
    {
      title: "Bronze Scholar",
      min: 0,
      description: "New candidate building basic focus.",
    },
    {
      title: "Silver Competitor",
      min: 500,
      description: "Consistent student tackling weekly revision sheets.",
    },
    {
      title: "Gold Champion",
      min: 1000,
      description: "Superb scholar with custom mock streaks.",
    },
    {
      title: "Platinum Master",
      min: 1800,
      description: "Incredible calculator performing rapid CBT scores.",
    },
    {
      title: "Diamond Legend",
      min: 2500,
      description: "Fulfilling West Africa limits. High-level candidate.",
    },
  ];

  const BADGES = [
    {
      name: "Syllabus Master",
      desc: "Attempted 15 practice exams",
      emoji: "📚",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      name: "1v1 Arena Conqueror",
      desc: "Won 5 multiplayer battles",
      emoji: "⚔️",
      color: "bg-emerald-50 text-emerald-800",
    },
    {
      name: "Parallel A1 Candidate",
      desc: "Scored 100% on any CBT Simulation",
      emoji: "🏆",
      color: "bg-amber-50 text-amber-600",
    },
    {
      name: "Streak Champion",
      desc: "Maintained 7+ days streak",
      emoji: "🔥",
      color: "bg-orange-50 text-orange-700 font-bold",
    },
  ];

  return (
    <div
      id="leaderboard-view-root"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* LEFT COLUMN: ACTIVE RANKINGS ROW */}
      <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-150">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
              <Trophy className="text-amber-500 w-7 h-7" />
              Weekly Regional Standings
            </h2>
            <p className="text-xs text-slate-500">
              Standings reset automatically every Sunday at 00:00 UTC
            </p>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setBoardType("global")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition ${boardType === "global" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-indigo-600"}`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" /> Global
            </button>
            <button
              onClick={() => setBoardType("state")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition ${boardType === "state" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-indigo-600"}`}
            >
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> State
            </button>
            <button
              onClick={() => setBoardType("school")}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition ${boardType === "school" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-indigo-600"}`}
            >
              <School className="w-3.5 h-3.5 inline mr-1" /> School
            </button>
          </div>
        </div>

        {/* Podium Top 3 Representation */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-4 text-center items-end max-w-lg mx-auto">
            {entries.length >= 2 && (
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl relative">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-lg bg-slate-400 text-white font-extrabold flex items-center justify-center border-2 border-white text-sm shadow-xs">
                  2
                </span>
                <div className="text-2xl mt-1">{entries[1].avatar || "👤"}</div>
                <h4 className="font-bold text-xs text-slate-700 truncate mt-1">
                  {entries[1].username}
                </h4>
                <p className="text-3xs text-slate-400 uppercase tracking-widest font-black mt-0.5">
                  🥈 Silver
                </p>
                <p className="text-xs font-extrabold text-indigo-600 mt-1">
                  {entries[1].xp} XP
                </p>
              </div>
            )}

            {entries.length >= 1 && (
              <div className="bg-amber-50/50 p-5 border-2 border-amber-300 rounded-2xl relative scale-105 shadow-md shadow-amber-100/30">
                <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center border-2 border-white text-sm shadow-md animate-bounce">
                  1
                </span>
                <div className="text-3xl mt-1">{entries[0].avatar || "👤"}</div>
                <h4 className="font-extrabold text-slate-900 truncate mt-1.5 max-w-[120px] mx-auto">
                  {entries[0].username}
                </h4>
                <p className="text-3xs text-amber-600 uppercase tracking-widest font-black mt-0.5">
                  👑
                </p>
                <p className="text-sm font-black text-indigo-700 mt-1">
                  {entries[0].xp} XP
                </p>
              </div>
            )}

            {entries.length >= 3 && (
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl relative">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-sm bg-orange-400 text-white font-extrabold flex items-center justify-center border-2 border-white text-sm shadow-xs">
                  3
                </span>
                <div className="text-2xl mt-1">{entries[2].avatar || "👤"}</div>
                <h4 className="font-bold text-xs text-slate-700 truncate mt-1">
                  {entries[2].username}
                </h4>
                <p className="text-3xs text-slate-400 uppercase tracking-widest font-black mt-0.5">
                  🥉 Bronze
                </p>
                <p className="text-xs font-extrabold text-indigo-600 mt-1">
                  {entries[2].xp} XP
                </p>
              </div>
            )}
          </div>
        )}

        {/* Table representation */}
        <div id="leaderboard-table" className="pt-2">
          {!loading && getFilteredEntries().length === 0 ? (
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50 text-sm text-slate-600">
              No leaderboard entries yet. Complete a CBT practice to appear on
              the leaderboard.
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              {getFilteredEntries().map((entry, idx) => {
                const isUser = entry.username === currentUsername;
                return (
                  <div
                    key={idx}
                    className={`p-4 flex items-center justify-between gap-4 transition ${isUser ? "bg-indigo-50/50" : "bg-white hover:bg-slate-50/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-slate-400 w-6 text-center">
                        {idx + 1}
                      </span>
                      <span className="text-lg w-8 h-8 rounded-lg bg-slate-50 border border-slate-100/50 flex items-center justify-center shrink-0 shadow-3xs">
                        {entry.avatar}
                      </span>

                      <div className="w-0 shrink grow">
                        <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                          {entry.username}
                          {isUser && (
                            <span className="text-2xs bg-indigo-100 text-indigo-700 font-extrabold uppercase rounded-md px-1 py-0.5">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-3xs text-slate-500 truncate">
                          {entry.school} • {entry.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right shrink-0">
                      <div>
                        <span
                          className={`text-[10px] font-bold block uppercase tracking-wider ${getTierColor(entry.rankTier)} bg-gradient-to-r`}
                        >
                          {entry.rankTier}
                        </span>
                        <span className="text-2xs text-slate-400">
                          Accuracy: {entry.accuracy}%
                        </span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 text-sm shrink-0">
                        {entry.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: MEDALS / RANK TIERS EXPLANATION */}
      <div className="lg:col-span-4 space-y-6">
        {/* Tier progression card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
            <Zap className="text-indigo-600 w-5 h-5 fill-indigo-600" /> Scholar
            Rank Tiers
          </h3>
          <p className="text-xs text-slate-500">
            Earn cumulative XP points to progress through premium rank tiers and
            unlock special badges.
          </p>

          <div className="space-y-3">
            {TIERS_LIST.map((t, idx) => {
              const isPassed = userXP >= t.min;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition flex gap-3 h-20 ${isPassed ? "border-indigo-100 bg-indigo-50/20" : "border-slate-100 bg-slate-50 opacity-60"}`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center font-bold text-sm ${isPassed ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}
                  >
                    {idx + 1}
                  </div>
                  <div className="w-0 shrink grow">
                    <h5 className="font-bold text-slate-800 text-xs truncate">
                      {t.title}
                    </h5>
                    <p className="text-3xs text-slate-400 leading-tight block truncate">
                      {t.description}
                    </p>
                    <span className="text-2xs font-extrabold text-indigo-600 font-mono">
                      Min: {t.min} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Badge unlock showcase */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900">
            Achievement Medals
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((bd, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-2"
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xl shadow-xs ${bd.color}`}
                >
                  {bd.emoji}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-2xs truncate">
                    {bd.name}
                  </h5>
                  <p className="text-3xs text-slate-400 leading-tight leading-3 mt-1">
                    {bd.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
