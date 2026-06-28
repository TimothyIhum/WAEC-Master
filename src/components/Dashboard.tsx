import React, { useState } from "react";
import {
  Trophy,
  BookOpen,
  Flame,
  Award,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  LogOut,
  Shield,
  Settings,
  Zap,
  ArrowRight,
  Heart,
} from "lucide-react";
import {
  UserProgress,
  ParentCheckpoint,
  Question,
  Announcement,
} from "../types";

interface DashboardProps {
  progress: UserProgress;
  parentConfig: ParentCheckpoint;
  announcements: Announcement[];
  activeTournaments: any[];
  onStartQuiz: (subject: string) => void;
  onNavigateToTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Dashboard({
  progress,
  parentConfig,
  announcements,
  activeTournaments,
  onStartQuiz,
  onNavigateToTab,
  onLogout,
}: DashboardProps) {
  // Missions should be derived from real backend data; no mock seed
  const MISSIONS: any[] = [];

  // Quick subject links should come from Admin-managed subject list; use what the user has already downloaded/studied
  const SUBJECTS = Object.keys(progress.subjectsStudied || {}).length
    ? Object.keys(progress.subjectsStudied).map((name) => ({
        name,
        desc: "",
        level: "",
        progress: 0,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      }))
    : ([] as any[]);

  return (
    <div id="dashboard-root" className="space-y-8">
      {/* 1. HERO GREETING AND PARENT NOTES */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-505/20 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="p-1 px-3.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-3xs font-black uppercase tracking-widest rounded-full leading-none">
              {progress.isAdmin ? "Exam Admin Space" : "SSS Candidate Space"}
            </span>
            <h1 className="font-display font-display text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Welcome Back, {progress.username}! 🌟
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Your preparation status looks sharp. Tackle mock challenges today
              to secure high-tier regional standings on West Africa
              leaderboards!
            </p>

            {/* Parent Linked encouragement note */}
            {parentConfig.parentNotes && (
              <div className="bg-indigo-600/30 border border-indigo-500/30 rounded-2xl p-4 text-xs text-indigo-200 mt-2">
                <span className="font-bold text-white block">
                  ✉️ Note from Link Guardian:
                </span>
                <p className="italic font-medium">
                  "{parentConfig.parentNotes}"
                </p>
              </div>
            )}
          </div>

          {/* KPI Mini-Dashboard inside Greeting Card */}
          <div className="md:col-span-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                XP Progress
              </span>
              <span className="text-2xs font-extrabold text-indigo-400 font-mono">
                Level {progress.level}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                  style={{ width: `${progress.xp % 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-baseline text-3xs text-slate-500 font-mono">
                <span>{progress.xp} XP Cumulative</span>
                <span>Tier: {progress.rankTier || "Bronze Scholar"}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2 text-slate-300">
              <span className="font-medium text-[10px] uppercase text-slate-400">
                CBT Allowed Hours
              </span>
              <span className="font-bold text-xs">
                {parentConfig.activityAllowedHourStart
                  .toString()
                  .padStart(2, "0")}
                :00 -{" "}
                {parentConfig.activityAllowedHourEnd
                  .toString()
                  .padStart(2, "0")}
                :00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT LINK PLEDGE STIMULATOR ADWARDS */}
      {parentConfig.rewardOffer && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 animate-slideUp">
          <p className="flex items-center gap-2">
            <Award className="text-amber-600 shrink-0 w-5 h-5 animate-spin" />
            <span>
              <b>Guardian Reward Pledge Active:</b> "{parentConfig.rewardOffer}"
            </span>
          </p>
          <button
            onClick={() => onNavigateToTab("practice")}
            className="p-1 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-3xs uppercase rounded-lg transition shrink-0 cursor-pointer"
          >
            Revise Now
          </button>
        </div>
      )}

      {/* TWO COLUMNS: PRACTICE GRID & SIDEBAR METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ACTIVE REVISION SUBJECTS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-extrabold text-slate-950 text-base">
              Select CBT Subject
            </h3>
            <button
              onClick={() => onNavigateToTab("practice")}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              See All Subjects <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SUBJECTS.map((sub, idx) => {
              const bgClass =
                sub.name === "Mathematics"
                  ? "bg-indigo-600 text-white"
                  : sub.name === "English Language"
                    ? "bg-purple-600 text-white"
                    : sub.name === "Physics"
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                      : "bg-emerald-600 text-white";

              const iconOverlay =
                sub.name === "Mathematics"
                  ? "📐"
                  : sub.name === "English Language"
                    ? "📝"
                    : sub.name === "Physics"
                      ? "⚙️"
                      : "🧪";

              return (
                <div
                  key={idx}
                  className={`${bgClass} p-6 rounded-3xl text-white relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[190px]`}
                >
                  <div className="absolute -right-2 -bottom-2 opacity-20 transform rotate-12 text-7xl font-sans select-none pointer-events-none">
                    {iconOverlay}
                  </div>

                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-black text-white text-base md:text-lg tracking-tight">
                        {sub.name} CBT
                      </h3>
                      <span className="text-[10px] bg-white/25 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                        {sub.level}
                      </span>
                    </div>
                    <p className="text-white/85 text-xs font-medium leading-relaxed max-w-[85%]">
                      {sub.desc}
                    </p>
                  </div>

                  <div className="relative z-10 space-y-3 pt-4">
                    <button
                      onClick={() => onStartQuiz(sub.name)}
                      className="bg-white text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      Start Practice{" "}
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECOMMENDED TOPICS FOR YOU */}
          <section className="space-y-4 pt-2">
            <h3 className="font-display font-extrabold text-slate-800 text-sm">
              Recommended Topics for You
            </h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-500">
              No recommendations yet. Complete CBT practice to unlock
              personalised topics.
            </div>
          </section>

          {/* ACTIVE TOURNAMENTS UPDATE CARD */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-2">
            <h4 className="font-display font-bold text-slate-900 text-sm">
              Upcoming National Tournaments
            </h4>
            <p className="text-xs text-slate-500">No tournaments scheduled.</p>
          </div>

          {/* STUDY ACTIVITY LOG GRAPH */}
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm">
                Study Activity Log
              </h2>
              <span className="text-3xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                Past 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-500">
              No activity yet. Start a CBT practice to begin tracking.
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN: REVISION MISSIONS & PLATFORM DYNAMIC UPDATES */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily study missions updates */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-1">
                <Zap className="text-indigo-600 w-4 h-4 fill-indigo-600" />{" "}
                Daily Syllabi Missions
              </h4>
              <span className="text-4xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Live
              </span>
            </div>

            <div className="space-y-3.5">
              {MISSIONS.map((msn, idx) => {
                const isDone = msn.progress >= msn.limit;
                return (
                  <div
                    key={idx}
                    className="text-xs space-y-1 bg-slate-50 border border-slate-100/50 p-3 rounded-2xl"
                  >
                    <div className="flex justify-between items-baseline">
                      <span
                        className={`font-bold ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}
                      >
                        {msn.title}
                      </span>
                      <span className="font-mono text-3xs font-black text-emerald-600 shrink-0">
                        {msn.reward}
                      </span>
                    </div>
                    <p className="text-3xs text-slate-400 leading-normal mb-1">
                      {msn.desc}
                    </p>

                    {/* Linear indicators */}
                    <div className="flex items-center gap-2">
                      <div className="grow h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-indigo-600"}`}
                          style={{
                            width: `${(msn.progress / msn.limit) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-3xs text-slate-500 font-mono italic">
                        {msn.progress}/{msn.limit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC WELCOME BOARD ANNOUNCEMENTS */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-1">
              <h4 className="font-display font-bold text-slate-950 text-sm">
                Notice board Updates
              </h4>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
              {announcements.map((ann, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-indigo-50/20 border-l-4 border-indigo-600 text-xs rounded-r-xl"
                >
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-black text-slate-800 text-3xs uppercase tracking-wider">
                      {ann.category}
                    </span>
                    <span className="text-4xs text-slate-400">
                      {new Date(ann.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 leading-tight block">
                    {ann.title}
                  </h5>
                  <p className="text-slate-600 leading-normal text-3xs mt-0.5">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
