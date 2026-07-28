import React, { useState } from 'react';
import { 
  Lock, Unlock, ShieldCheck, Mail, Sliders, 
  Award, TrendingUp, Sparkles, Check, Edit2 
} from 'lucide-react';
import { UserProgress, ParentCheckpoint } from '../types';

interface ParentDashboardProps {
  progress: UserProgress;
  onUpdateParentConfig: (config: ParentCheckpoint) => void;
  currentConfig: ParentCheckpoint;
}

export default function ParentDashboard({ progress, onUpdateParentConfig, currentConfig }: ParentDashboardProps) {
  const [pinInput, setPinInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom states for configuration edits
  const [parentEmail, setParentEmail] = useState(currentConfig.parentEmail);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(currentConfig.dailyGoalMinutes);
  const [rewardOffer, setRewardOffer] = useState(currentConfig.rewardOffer);
  const [hourStart, setHourStart] = useState(currentConfig.activityAllowedHourStart);
  const [hourEnd, setHourEnd] = useState(currentConfig.activityAllowedHourEnd);
  const [parentNotes, setParentNotes] = useState(currentConfig.parentNotes);
  const [successSaved, setSuccessSaved] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.trim() !== '') {
      setAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN. Enter "1234" to unlock parent controls.');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateParentConfig({
      parentPin: currentConfig.parentPin,
      parentEmail,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      rewardOffer,
      activityAllowedHourStart: Number(hourStart),
      activityAllowedHourEnd: Number(hourEnd),
      parentNotes
    });
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2000);
  };

  return (
    <div id="parent-dashboard-root" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-8">
      
      {/* LOCKED VIEW GATED BY PIN */}
      {!authenticated ? (
        <div id="parent-locked-screen" className="text-center py-10 space-y-6 max-w-sm mx-auto">
          <div className="inline-flex p-4.5 bg-indigo-50 text-indigo-700 rounded-3xl shadow-sm relative">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-xl text-slate-900">Parent/Guardian Safety LINK</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify your security PIN to monitor your child's weekly revision meters, adjust active hours, and pledge motivating rewards!
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="password"
                required
                maxLength={4}
                placeholder="Enter PIN (Default is 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl py-3 text-center text-lg font-bold tracking-widest focus:outline-hidden"
              />
              {errorMsg && <p className="text-red-500 text-3xs font-semibold">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" /> Unlock Safeguards
            </button>
          </form>
          <p className="text-3xs text-slate-400">Type "1234" or any PIN to access administrative oversight checklists.</p>
        </div>
      ) : (
        /* PARENT WORKSPACE */
        <div id="parent-active-workspace" className="space-y-8 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-150">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500 w-7 h-7" />
                Linked Guardian Administration
              </h2>
              <p className="text-xs text-slate-500">You are monitoring statistics for candidate: <b>{progress.username}</b></p>
            </div>

            <button
              onClick={() => setAuthenticated(false)}
              className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-bold transition cursor-pointer"
            >
              Lock Panel
            </button>
          </div>

          {/* Child stats preview widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">Study Target Accomplishment</span>
              <span className="text-lg font-mono font-black text-indigo-700 block">
                {(progress.timeSpentMinutes / 60).toFixed(1)} hours total
              </span>
              <p className="text-3xs text-slate-500">Daily Goal: {dailyGoalMinutes} minutes</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">Accuracy Assessment</span>
              <span className="text-lg font-mono font-black text-indigo-700 block">{progress.accuracy}% Accuracy</span>
              <p className="text-3xs text-slate-500">WAEC standard benchmark: 75% for A1</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest block">Current Motivation Streak</span>
              <span className="text-lg font-mono font-black text-amber-500 flex items-center gap-1">
                🔥 {progress.streak} days active
              </span>
              <p className="text-3xs text-slate-500">Consistency quota: Active today</p>
            </div>
          </div>

          {/* Setup controls & limits Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            <form onSubmit={handleSaveConfig} className="lg:col-span-8 space-y-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">Adjustment Parameters</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">Guardian Alert Email</label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1 text-xs" >
                  <label className="font-bold text-slate-600 block">Target Study Hours (Daily, Min)</label>
                  <input
                    type="number"
                    required
                    value={dailyGoalMinutes}
                    onChange={e => setDailyGoalMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Reward offer input */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 block">Your Reward Pledge Offer (Displays on Child’s Dashboard)</label>
                <input
                  type="text"
                  placeholder="e.g. Free cinema ticket if you answer 50 chemistry questions this weekend!"
                  value={rewardOffer}
                  onChange={e => setRewardOffer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden font-sans font-medium"
                />
              </div>

              {/* Study Locking Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">CBT Allowed Start Hour</label>
                  <select
                    value={hourStart}
                    onChange={e => setHourStart(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 block">CBT Allowed End Hour</label>
                  <select
                    value={hourEnd}
                    onChange={e => setHourEnd(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Private notes */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 block">Motivational Encouragement note</label>
                <textarea
                  rows={2}
                  placeholder="Write an encouraging note that displays on their welcome dashboard..."
                  value={parentNotes}
                  onChange={e => setParentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2.5 px-3 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl">
                {successSaved ? (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <Check className="w-4 h-4" /> Parameters saved successfully!
                  </span>
                ) : (
                  <span className="text-slate-400 text-3xs">Rules synchronize on child’s next log event.</span>
                )}
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Apply Guardrails
                </button>
              </div>
            </form>

            {/* RIGHT CHECKLIST FOR PARENTS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                <h4 className="font-display font-bold text-slate-900 text-sm">Parent Checklist</h4>
                <p className="text-3xs text-slate-500 leading-normal">Guidance for maximizing your child’s WAEC success:</p>

                <div className="space-y-2.5 text-2xs text-slate-600">
                  <div className="flex gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                    <p>Allocate a dedicated study hour free from external social distractions.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                    <p>Reward their consistency milestones rather than raw scores.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                    <p>Utilize the "Allowed Hours" feature to reinforce sleep consistency during exam weeks.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
