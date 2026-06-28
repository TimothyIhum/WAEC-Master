import React from "react";
import {
  BarChart2,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { UserProgress } from "../types";

interface AnalyticsViewProps {
  progress: UserProgress;
  onNavigateToQuiz: () => void;
}

export default function AnalyticsView({
  progress,
  onNavigateToQuiz,
}: AnalyticsViewProps) {
  const WEEKLY_TREND = [] as { day: string; count: number; correct: number }[];

  const SUBJECTS_STRENGTH = Object.keys(progress.subjectsStudied || {}).map(
    (name) => ({
      name,
      xp: progress.subjectsStudied[name] || 0,
      pct: 0,
      status: "",
    }),
  );

  const HEATMAP_DAYS = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    active: false,
  }));

  return (
    <div
      id="analytics-view-root"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* LEFT PANEL: BENTO METRICS AND CHARTS */}
      <div className="lg:col-span-8 space-y-6">
        {/* Top 4 Bento KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl relative">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">
              Overall Accuracy
            </span>
            <span className="font-mono text-2xl font-black text-indigo-700 block mt-1">
              {progress.accuracy}%
            </span>
            <div className="h-1 bg-indigo-100 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${progress.accuracy}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl relative">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">
              Hours Studied
            </span>
            <span className="font-mono text-2xl font-black text-indigo-700 block mt-1">
              {(progress.timeSpentMinutes / 60).toFixed(1)} hrs
            </span>
            <span className="text-3xs text-slate-500 block mt-2.5">
              Focus accuracy rising
            </span>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl relative">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">
              Quizzes Done
            </span>
            <span className="font-mono text-2xl font-black text-indigo-700 block mt-1">
              {progress.totalQuizzes ?? 0}
            </span>
            <span className="text-3xs text-slate-500 block mt-2.5">
              Weekly quota exceeded
            </span>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl relative">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">
              Daily Streak
            </span>
            <span className="font-mono text-2xl font-black text-amber-500 block mt-1 flex items-center gap-1">
              🔥 {progress.streak} days
            </span>
            <span className="text-3xs text-slate-500 block mt-2.5">
              Best streak: {progress.streak} days
            </span>
          </div>
        </div>

        {/* Weekly Accuracy chart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-slate-950 text-base flex items-center gap-1.5">
                <TrendingUp className="text-indigo-600 w-5 h-5" /> Weekly
                Diagnostic Performance
              </h4>
              <p className="text-2xs text-slate-500">
                Comparing total answered vs correct answers across the week
              </p>
            </div>
          </div>

          {/* Simple and elegant pure SVG/HTML CSS bar chart representation */}
          <div className="h-56 flex items-end justify-between pt-4 gap-2">
            {WEEKLY_TREND.map((t, idx) => {
              const maxVal = 15;
              const answeredHeight = t.count > 0 ? (t.count / maxVal) * 100 : 0;
              const correctHeight =
                t.correct > 0 ? (t.correct / maxVal) * 100 : 0;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center grow h-full justify-end group"
                >
                  <div className="w-full max-w-[32px] h-full flex items-end gap-1 px-1 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-3xs p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 mb-1 pointer-events-none">
                      Answered: {t.count} • Correct: {t.correct}
                    </div>

                    {/* Total Answered bar */}
                    <div
                      className="bg-indigo-150 rounded-t-lg grow transition group-hover:bg-indigo-200"
                      style={{
                        height: `${answeredHeight}%`,
                        minHeight: t.count > 0 ? "4px" : "0",
                      }}
                    ></div>
                    {/* Correct Answers bar */}
                    <div
                      className="bg-indigo-600 rounded-t-lg grow transition group-hover:bg-indigo-700"
                      style={{
                        height: `${correctHeight}%`,
                        minHeight: t.correct > 0 ? "4px" : "0",
                      }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mt-2 font-display">
                    {t.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity heat grid */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-950 text-base flex items-center gap-1.5">
              <Calendar className="text-indigo-600 w-5 h-5" /> Candidate
              Activity Heatmap
            </h4>
            <p className="text-2xs text-slate-500">
              Track consistency daily. Darker cards indicate completed CBT
              practice exam sessions
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 justify-center">
            {HEATMAP_DAYS.map((h) => (
              <div
                key={h.day}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-3xs font-extrabold transition duration-150 ${h.active ? "bg-indigo-600 text-white shadow-xs shadow-indigo-100" : "bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100"}`}
                title={h.active ? "Active revision logged" : "No records"}
              >
                {h.day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: SUBJECT RATING AND AI ADVICE */}
      <div className="lg:col-span-4 space-y-6">
        {/* Subject progress panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-slate-950 text-base">
            Subject Diagnostic Rating
          </h3>

          <div className="space-y-4">
            {SUBJECTS_STRENGTH.map((sub, idx) => {
              const isWeak = sub.pct < 70;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{sub.name}</span>
                    <span
                      className={`font-black text-2xs uppercase ${isWeak ? "text-red-500" : "text-emerald-600"}`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="grow h-2 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWeak ? "bg-amber-500" : "bg-indigo-600"}`}
                        style={{ width: `${sub.pct}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-2xs font-extrabold text-slate-500 w-8 text-right">
                      {sub.pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI study prescriptions */}
        <div className="bg-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex gap-2.5 items-center">
            <Sparkles className="text-amber-400 w-5 h-5 animate-pulse shrink-0" />
            <h3 className="font-display font-bold text-white text-base">
              AI Prep Suggestions
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Excellent job in set theory, Mathematics is your sharpest skill!
            However, your Chemistry scores are slightly lower.
          </p>

          <div className="bg-slate-900 p-3.5 border border-slate-800 rounded-2xl flex items-start gap-2 text-2xs text-indigo-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Action Required</p>
              <p className="text-slate-400 mt-0.5 leading-normal">
                Solve Gas Law equations in the Chemistry module to elevate your
                diagnostic level.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToQuiz}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition duration-150 cursor-pointer text-center block"
          >
            Launch Suggested Quiz Now
          </button>
        </div>
      </div>
    </div>
  );
}
