import React, { useState } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  Flame, 
  Trophy, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  User, 
  Mail, 
  School, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { saveUserToFirestore } from '../utils/firebaseSync';

interface UserDashboardModalProps {
  user: any;
  onUpdateUser: (newUser: any) => void;
  onClose: () => void;
}

export default function UserDashboardModal({ user, onUpdateUser, onClose }: UserDashboardModalProps) {
  const [avatar, setAvatar] = useState(user.avatar || '🎓');
  const [school, setSchool] = useState(user.school || '');
  const [state, setState] = useState(user.state || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const avatarsList = ['🎓', '👑', '👦', '👧', '🦁', '🦊', '⚡', '🛡️', '🧙', '🚀', '🦉', '🐾'];

  const XP_PER_LEVEL = 1000;
  const currentLevelXp = user.xp % XP_PER_LEVEL;
  const nextLevelProgress = (currentLevelXp / XP_PER_LEVEL) * 100;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const updatedUser = {
      ...user,
      avatar,
      school: school.trim(),
      state: state.trim()
    };

    try {
      await saveUserToFirestore(updatedUser);
      onUpdateUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    setSaving(true);
    const updatedUser = {
      ...user,
      isPremium: true,
      rankTier: 'Diamond Legend',
      level: Math.max(user.level, 35)
    };

    try {
      await saveUserToFirestore(updatedUser);
      onUpdateUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upgrade user:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-150">H</span>
            <div>
              <h2 className="text-base font-black text-slate-800 leading-none">Candidate Profiler Board</h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Durable Live Sync Matrix</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-450 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 md:p-8 rounded-2xl text-white relative overflow-hidden shadow-lg border border-indigo-950">
            {/* Visual background decor elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-xl translate-x-12 -translate-y-12"></div>
            <div className="absolute -bottom-10 left-10 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-md"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              {/* Dynamic Avatar Container */}
              <div className="relative group select-none">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-[3px] border-white/20 flex items-center justify-center text-5xl shadow-xl transition transform hover:scale-105 duration-300">
                  {avatar}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-md border border-indigo-400">
                  Level {user.level}
                </div>
              </div>

              {/* Text & Primary Identifiers */}
              <div className="text-center md:text-left flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h3 className="text-xl font-black tracking-tight">{user.username}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shadow-3xs flex items-center gap-1 ${
                    user.isPremium 
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' 
                      : 'bg-slate-800 text-slate-350 border-slate-700/60'
                  }`}>
                    {user.isPremium ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                        PREMIUM PRO
                      </>
                    ) : (
                      'STANDARD CANDIDATE'
                    )}
                  </span>
                </div>
                <p className="text-indigo-200 text-xs font-semibold flex items-center justify-center md:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-3 w-4 h-4 shrink-0" />
                  {user.email || 'guest_account@waecmaster.local'}
                </p>
                <div className="pt-2">
                  <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {user.rankTier || 'Bronze Scholar'} Standing
                  </p>
                </div>
              </div>

              {/* Status and Action Panel */}
              {!user.isPremium && (
                <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5">
                  <button
                    type="button"
                    onClick={handleUpgradeToPremium}
                    disabled={saving}
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-900 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 border-0 transition duration-150 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                    Unlock Premium Features
                  </button>
                </div>
              )}
            </div>

            {/* Level Progress Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 relative z-10 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-indigo-200 font-bold">
                <span>XP PROGRESSION</span>
                <span>{currentLevelXp} / {XP_PER_LEVEL} XP (Level {user.level})</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-400 to-pink-400 transition-all duration-500"
                  style={{ width: `${nextLevelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Core Analytics Blocks Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl space-y-1 shadow-3xs hover:bg-slate-100/50 transition">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Practice Streak</span>
                <Flame className="w-4 h-4 text-orange-500 fill-orange-200" />
              </div>
              <p className="text-xl font-black text-slate-800">{user.streak} Days</p>
              <div className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 inline-block">
                Active Daily
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl space-y-1 shadow-3xs hover:bg-slate-100/50 transition">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Avg Accuracy</span>
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-100" />
              </div>
              <p className="text-xl font-black text-slate-800">{user.accuracy}%</p>
              <div className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 inline-block">
                CBT Standard
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl space-y-1 shadow-3xs hover:bg-slate-100/50 transition">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Quizzes</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-black text-slate-800">{user.totalQuizzes}</p>
              <div className="text-[9px] text-slate-500 font-extrabold bg-slate-150 rounded-md px-1.5 py-0.5 inline-block">
                Exams Done
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl space-y-1 shadow-3xs hover:bg-slate-100/50 transition">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Study Time</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-slate-800">
                {user.timeSpentMinutes ? `${Math.round(user.timeSpentMinutes)}m` : '0m'}
              </p>
              <div className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 inline-block">
                Online Session
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Edit Profile Details Form */}
            <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-slate-150 p-5 md:p-6 rounded-2xl space-y-5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" /> Update Candidate Information
              </h4>

              {/* Avatar Picker */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Select Profile Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatarsList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl cursor-pointer transition transform active:scale-90 border-2 ${
                        avatar === emoji 
                          ? 'bg-indigo-50 border-indigo-600 shadow-sm scale-110' 
                          : 'bg-white border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-slate-400" /> High School
                    </label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. Queen's College, Yaba"
                      className="w-full bg-slate-50/50 border border-slate-250 hover:border-slate-350 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs w-full focus:outline-hidden transition text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Region / State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Lagos, Abuja, Accra"
                      className="w-full bg-slate-50/50 border border-slate-250 hover:border-slate-350 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs w-full focus:outline-hidden transition text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback and Submit */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  {saveSuccess && (
                     <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                       <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                       Profile synchronized live to DB cloud ledger!
                     </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition duration-150 cursor-pointer flex items-center gap-1.5 border-none"
                >
                  {saving ? 'Synchronizing...' : 'Save Profile Specs'}
                </button>
              </div>
            </form>

            {/* Right Col: Subject Summary Stats */}
            <div className="lg:col-span-5 bg-white border border-slate-150 p-5 md:p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Subject Proficiencies
                </h4>

                <div className="mt-4 space-y-3.5">
                  {user.subjectsStudied && Object.keys(user.subjectsStudied).length > 0 ? (
                    Object.entries(user.subjectsStudied).map(([subject, minutes]) => (
                      <div key={subject} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-700">{subject}</span>
                          <span className="font-bold text-slate-400 text-3xs uppercase tracking-wider">
                            {Number(minutes)} Minutes Studied
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-150/50">
                          <div 
                            className="h-full bg-indigo-600" 
                            style={{ width: `${Math.min(100, (Number(minutes) / 1000) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-1.5">
                      <span className="text-2xl">🌱</span>
                      <p className="text-xs font-bold">No studied subjects tracked yet</p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Synchronized results will show up here as you practice CBT exams.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* DB Security Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2.5 text-slate-400 text-[10px] font-bold">
                <Fingerprint className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="leading-tight">
                  Fully verified candidate signature: <code className="text-slate-800">{user.id || 'N/A'}</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
