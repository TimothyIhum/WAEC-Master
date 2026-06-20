import React, { useState } from 'react';
import { 
  Trophy, BookOpen, Flame, Award, Sparkles, Brain, Shield,
  Database, Users, LayoutDashboard, LogOut, Menu, X, Zap, Download 
} from 'lucide-react';

// Subcomponents
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CbtSimulator from './components/CbtSimulator';
import MultiplayerView from './components/MultiplayerView';
import AiTutorView from './components/AiTutorView';
import LeaderboardView from './components/LeaderboardView';
import CommunityView from './components/CommunityView';
import ParentDashboard from './components/ParentDashboard';
import AdminPanel from './components/AdminPanel';
import SecurityCenter from './components/SecurityCenter';

// Static Data and Types
import { Question, UserProgress, ParentCheckpoint, Announcement } from './types';
import { SAMPLE_QUESTIONS } from './data/questions';
import { downloadOfflineCbtApp } from './utils/appDownloader';
import { saveUserToFirestore, syncUsersFromFirestore, saveQuestionToDatabase, syncQuestionsFromDatabase } from './utils/firebaseSync';

export default function App() {
  const [user, setUser] = useState<UserProgress | null>(() => {
    const saved = localStorage.getItem('waec_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const emailLower = parsed.email.toLowerCase().trim();
          const adminEmails = [
            'timothyihum@gmail.com',
            'temiokusami@gmail.com',
            'admin@waecmaster.edu.ng'
          ];
          if (adminEmails.includes(emailLower)) {
            parsed.isAdmin = true;
            parsed.isPremium = true;
            if ((parsed.level || 0) < 30) {
              parsed.level = 30;
              parsed.xp = Math.max(parsed.xp || 0, 9500);
              parsed.rankTier = 'Diamond Legend';
            }
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse active user session:', e);
      }
    }
    return null;
  });

  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('waec_user_session');
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Subjects List (can be managed by Admin)
  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('waec_subjects');
    return saved ? JSON.parse(saved) : ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Italian'];
  });

  const [appLanguage, setAppLanguage] = useState<'en' | 'it'>(() => {
    return (localStorage.getItem('waec_lang') as 'en' | 'it') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = appLanguage === 'en' ? 'it' : 'en';
    setAppLanguage(nextLang);
    localStorage.setItem('waec_lang', nextLang);
  };

  const t = (text: string): string => {
    if (appLanguage === 'en') return text;
    const ITALIAN_DICTIONARY: Record<string, string> = {
      'Dashboard': 'Cruscotto',
      'CBT Simulator': 'Simulatore CBT',
      'Multiplayer Arena': 'Arena Multigiocatore',
      'AI Study Coach': 'Tutor di Studio IA',
      'Leaderboard': 'Classifica',
      'Study Boards': 'Bacheche di Studio',
      'Parent LINK': 'Link Genitori',
      'Security Center': 'Centro di Sicurezza',
      'CBT Admin': 'Amministratore CBT',
      'Log Out Account': 'Esci dall\'Account',
      'Get Standalone App': 'Scarica App Off-line',
      'Get Offline Standalone App': 'Ottieni App Off-line Unificata',
      'Standalone Installer': 'Installatore Off-line',
      'Install the entire study suite as a standalone client to practice all subjects completely offline.': 'Installa l\'intero pacchetto di studio offline come client autonomo per esercitarti in tutte le materie.',
      'Back to Home': 'Torna alla Home',
      'Guest mode': 'Modalità ospite',
      'Mathematics': 'Matematica',
      'English Language': 'Lingua Inglese',
      'Physics': 'Fisica',
      'Chemistry': 'Chimica',
      'Biology': 'Biologia',
      'Economics': 'Economia',
      'Government': 'Governo',
      'Italian': 'Italiano'
    };
    return ITALIAN_DICTIONARY[text] || text;
  };

  const handleAddSubject = (subject: string) => {
    setSubjectsList(prev => {
      const updated = prev.includes(subject) ? prev : [...prev, subject];
      localStorage.setItem('waec_subjects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteSubject = (subject: string) => {
    setSubjectsList(prev => {
      const updated = prev.filter(s => s !== subject);
      localStorage.setItem('waec_subjects', JSON.stringify(updated));
      return updated;
    });
  };

  // Initial synchronization of all registered users and questions from Neon Postgres/Firestore on boot
  React.useEffect(() => {
    const initSync = async () => {
      try {
        await syncUsersFromFirestore();
      } catch (e) {
        console.error("Initial Firestore profiles sync failed:", e);
      }

      // Re-validate and fetch freshest user session from database on load
      const savedSession = localStorage.getItem('waec_user_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email) {
            const emailLower = parsed.email.toLowerCase().trim();
            const profileResp = await fetch(`/api/users/profile?email=${encodeURIComponent(emailLower)}`);
            if (profileResp.ok) {
              const liveUser = await profileResp.json();
              if (liveUser && liveUser.email) {
                const adminEmails = [
                  'timothyihum@gmail.com',
                  'temiokusami@gmail.com',
                  'admin@waecmaster.edu.ng'
                ];
                if (adminEmails.includes(emailLower)) {
                  liveUser.isAdmin = true;
                  liveUser.isPremium = true;
                  if ((liveUser.level || 0) < 30) {
                    liveUser.level = 30;
                    liveUser.xp = Math.max(liveUser.xp || 0, 9500);
                    liveUser.rankTier = 'Diamond Legend';
                  }
                }
                setUser(liveUser);
                localStorage.setItem('waec_user_session', JSON.stringify(liveUser));
              }
            } else if (profileResp.status === 404) {
              // Account was deleted from DB! Sign out immediately and clear state
              console.warn("Active account was deleted from the database. Resetting session.");
              setUser(null);
              setShowLanding(true);
              localStorage.removeItem('waec_user_session');
            }
          }
        } catch (e) {
          console.error("Failed to re-validate user session on page reload:", e);
        }
      }

      try {
        const cloudQs = await syncQuestionsFromDatabase();
        if (cloudQs && cloudQs.length > 0) {
          setQuestionsList(prev => {
            const merged = [...cloudQs];
            prev.forEach(pq => {
              if (!merged.some(cq => cq.id === pq.id)) {
                merged.push(pq);
              }
            });
            localStorage.setItem('waec_questions_list', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {
        console.error("Initial questions database sync failed:", e);
      }
    };
    initSync();
  }, []);

  // Synchronize state and persist session
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('waec_user_session', JSON.stringify(user));
      saveUserToFirestore(user).catch(e => console.error("Firestore progress sync failed:", e));
      
      // Also update inside registered users list
      const saved = localStorage.getItem('waec_registered_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const idx = parsed.findIndex((u: any) => u.username === user.username || (user.email && u.email === user.email));
          if (idx !== -1) {
            parsed[idx] = {
              ...parsed[idx],
              xp: user.xp,
              level: user.level,
              rankTier: user.rankTier,
              streak: user.streak,
              accuracy: user.accuracy,
              totalQuizzes: user.totalQuizzes,
              timeSpentMinutes: user.timeSpentMinutes,
              subjectsStudied: user.subjectsStudied,
              isPremium: user.isPremium,
              isAdmin: user.isAdmin
            };
            localStorage.setItem('waec_registered_users', JSON.stringify(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      localStorage.removeItem('waec_user_session');
    }
  }, [user]);

  // Downloaded Offline Subjects List
  const [downloadedSubjects, setDownloadedSubjects] = useState<string[]>(['Mathematics']);

  // Active question context for AI solving explanation
  const [activeQuestionForTutor, setActiveQuestionForTutor] = useState<Question | null>(null);

  // Dynamic lists (mutated by Admin)
  const [questionsList, setQuestionsList] = useState<Question[]>(() => {
    const saved = localStorage.getItem('waec_questions_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error("Failed to parse waec_questions_list:", err);
      }
    }
    return SAMPLE_QUESTIONS;
  });
  
  // Dynamic Announcements list
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'WAEC Timetable Update 📅',
      content: 'General Mathematics Mock starts nationwide this Friday. Use CBT simulation mode to test your speed!',
      category: 'Exam Update',
      timestamp: new Date().toISOString()
    },
    {
      id: 'ann-2',
      title: 'Diamond Tier Scholar Tournament Winner 👑',
      content: 'Congratulations to Kofi_Accra for scoring 100% on the English Lexis Challenge with a average response of 4 seconds!',
      category: 'Tournament',
      timestamp: new Date().toISOString()
    }
  ]);

  // Parent configuration
  const [parentConfig, setParentConfig] = useState<ParentCheckpoint>({
    parentPin: '1234',
    parentEmail: 'parent@waecmaster.edu.ng',
    dailyGoalMinutes: 45,
    rewardOffer: 'Cold Golden Stone Ice Cream if accuracy exceeds 80%!',
    activityAllowedHourStart: 6,
    activityAllowedHourEnd: 22,
    parentNotes: 'Keep up the focus, we are so proud of your diligence! Focus on physics mechanics formulas.'
  });

  // Handle successful login
  const handleAuthSuccess = (usernameStr: string, isGuest: boolean, emailStr = '', fullProfile?: any) => {
    if (isGuest) {
      setUser({
        username: usernameStr,
        avatar: '🦊',
        xp: 150,
        level: 1,
        rankTier: 'Bronze Scholar',
        streak: 1,
        accuracy: 75,
        timeSpentMinutes: 10,
        totalQuizzes: 1,
        subjectsStudied: {
          'Mathematics': 40
        },
        isPremium: false,
        isAdmin: false,
        email: 'guest@waecmaster.edu.ng'
      });
      setShowLanding(false);
      setActiveTab('dashboard');
      return;
    }

    if (fullProfile) {
      setUser({
        username: fullProfile.username,
        avatar: fullProfile.avatar || '🎓',
        xp: Number(fullProfile.xp ?? 100),
        level: Number(fullProfile.level ?? 1),
        rankTier: fullProfile.rankTier || 'Bronze Scholar',
        streak: Number(fullProfile.streak ?? 1),
        accuracy: Number(fullProfile.accuracy ?? 100),
        timeSpentMinutes: Number(fullProfile.timeSpentMinutes ?? 0),
        totalQuizzes: Number(fullProfile.totalQuizzes ?? 0),
        subjectsStudied: fullProfile.subjectsStudied || {},
        isPremium: Boolean(fullProfile.isPremium || fullProfile.isAdmin),
        isAdmin: Boolean(fullProfile.isAdmin),
        email: fullProfile.email
      });
      setShowLanding(false);
      setActiveTab('dashboard');
      return;
    }

    // Try to find the actual user in the database
    const savedUsers = localStorage.getItem('waec_registered_users');
    let dbUser: any = null;
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        dbUser = parsed.find((u: any) => u.username === usernameStr || (emailStr && u.email.toLowerCase().trim() === emailStr.toLowerCase().trim()));
        if (dbUser) {
          const emailLower = (dbUser.email || '').toLowerCase().trim();
          if (emailLower === 'timothyihum@gmail.com' || emailLower === 'temiokusami@gmail.com' || emailLower === 'admin@waecmaster.edu.ng') {
            dbUser.isAdmin = true;
            dbUser.isPremium = true;
            if ((dbUser.level || 0) < 30) {
              dbUser.level = 30;
              dbUser.xp = Math.max(dbUser.xp || 0, 9500);
              dbUser.rankTier = 'Diamond Legend';
            }
          }
        }
      } catch (e) {
        console.error('Failed to query users database:', e);
      }
    }

    if (dbUser) {
      setUser({
        username: dbUser.username,
        avatar: dbUser.avatar || '🎓',
        xp: dbUser.xp ?? 100,
        level: dbUser.level ?? 1,
        rankTier: dbUser.rankTier ?? 'Bronze Scholar',
        streak: dbUser.streak ?? 1,
        accuracy: dbUser.accuracy ?? 100,
        timeSpentMinutes: dbUser.timeSpentMinutes ?? 0,
        totalQuizzes: dbUser.totalQuizzes ?? 0,
        subjectsStudied: dbUser.subjectsStudied ?? {},
        isPremium: dbUser.isAdmin ? true : (dbUser.isPremium ?? false),
        isAdmin: dbUser.isAdmin ?? false,
        email: dbUser.email
      });
    } else {
      // Fallback
      const isAdm = emailStr.toLowerCase().trim() === 'timothyihum@gmail.com' || emailStr.toLowerCase().trim() === 'temiokusami@gmail.com' || usernameStr.toLowerCase().trim() === 'temiokusami';
      setUser({
        username: usernameStr,
        avatar: '🎓',
        xp: isAdm ? 9500 : 150,
        level: isAdm ? 30 : 1,
        rankTier: isAdm ? 'Diamond Legend' : 'Bronze Scholar',
        streak: 1,
        accuracy: 100,
        timeSpentMinutes: 30,
        totalQuizzes: 1,
        subjectsStudied: {},
        isPremium: isAdm,
        isAdmin: isAdm,
        email: emailStr
      });
    }

    setShowLanding(false);
    setActiveTab('dashboard');
  };

  // Handle adding custom questions via Admin
  const handleAddQuestion = (q: Question) => {
    setQuestionsList(prev => {
      const updated = [q, ...prev];
      localStorage.setItem('waec_questions_list', JSON.stringify(updated));
      return updated;
    });
    saveQuestionToDatabase(q).catch(e => console.error("Cloud questions sync failed:", e));
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestionsList(prev => {
      const updated = prev.filter(q => q.id !== qId);
      localStorage.setItem('waec_questions_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePostAnnouncement = (ann: { title: string; content: string; category: any }) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: ann.title,
      content: ann.content,
      category: ann.category,
      timestamp: new Date().toISOString()
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  // Sync state modifications after a CBT quiz ends
  const handleQuizCompleted = (xpEarned: number, correctCount: number, totalCount: number, timeSpentMin: number) => {
    if (!user) return;

    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;
    
    // Update tier titles
    let newTier = 'Bronze Scholar';
    if (newXp >= 2500) newTier = 'Diamond Legend';
    else if (newXp >= 1800) newTier = 'Platinum Master';
    else if (newXp >= 1000) newTier = 'Gold Champion';
    else if (newXp >= 500) newTier = 'Silver Competitor';

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        rankTier: newTier,
        streak: prev.streak + 1, // Gain streak count for daily revision submission
        totalQuizzes: prev.totalQuizzes + 1,
        timeSpentMinutes: prev.timeSpentMinutes + timeSpentMin,
        accuracy: Math.round(((prev.accuracy * prev.totalQuizzes) + ((correctCount / totalCount) * 100)) / (prev.totalQuizzes + 1))
      };
    });

    // Notify backend Express leaderboard state so browser tabs synchronize in real-time
    fetch('/api/leaderboard/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        avatar: user.avatar,
        xp: newXp,
        level: newLevel,
        rankTier: newTier,
        accuracy: user.accuracy,
        state: 'Lagos',
        school: 'FGC Lagos College'
      })
    }).catch(e => console.error('Failing to sync leaderboard endpoints:', e));
  };

  const handleDownloadSubject = (subj: string) => {
    if (!downloadedSubjects.includes(subj)) {
      setDownloadedSubjects(px => [...px, subj]);
    }
  };

  const handleAskTutorBridge = (q: Question) => {
    setActiveQuestionForTutor(q);
    setActiveTab('tutor');
  };

  const handleSaveAiSession = (session: any) => {
    setUser(prev => {
      if (!prev) return null;
      const currentSessions = prev.savedAiSessions || [];
      const index = currentSessions.findIndex((s: any) => s.id === session.id);
      let updatedSessions;
      if (index !== -1) {
        // Update existing session
        updatedSessions = [...currentSessions];
        updatedSessions[index] = session;
      } else {
        // Add new session
        updatedSessions = [session, ...currentSessions];
      }
      return {
        ...prev,
        savedAiSessions: updatedSessions
      };
    });
  };

  const handleDeleteSavedAiSession = (id: string) => {
    setUser(prev => {
      if (!prev) return null;
      const currentSessions = prev.savedAiSessions || [];
      return {
        ...prev,
        savedAiSessions: currentSessions.filter((s: any) => s.id !== id)
      };
    });
  };

  const handleLogOutGlobal = () => {
    setUser(null);
    setShowLanding(true);
  };

  // Sidebar navigation options
  const NAVIGATION_DOCKS = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'practice', label: t('CBT Simulator'), icon: BookOpen },
    { id: 'battle', label: t('Multiplayer Arena'), icon: Flame },
    { id: 'tutor', label: t('AI Study Coach'), icon: Brain },
    { id: 'leaderboard', label: t('Leaderboard'), icon: Trophy },
    { id: 'community', label: t('Study Boards'), icon: Users },
    { id: 'guardian', label: t('Parent LINK'), icon: Award },
    { id: 'secops', label: t('Security Center'), icon: Shield },
    { id: 'admin', label: t('CBT Admin'), icon: Database }
  ];

  return (
    <div id="waec-master-app" className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* LANDING PAGE GATED AT FIRST TURN OR REQUEST */}
      {showLanding && !user && (
        <LandingPage 
          onStartAsGuest={() => handleAuthSuccess('Guest_Scholar', true)}
          onNavigateToAuth={(mode) => {
            setAuthMode(mode);
            setShowLanding(false);
          }}
        />
      )}

      {/* AUTHENTICATION ROUTING */}
      {!showLanding && !user && (
        <AuthPage 
          initialMode={authMode}
          onAuthSuccess={(profile) => handleAuthSuccess(profile.username, false, profile.email, profile)}
          onBackToLanding={() => setShowLanding(true)}
          onGuestMode={() => handleAuthSuccess('Guest_Scholar', true)}
        />
      )}

      {/* UNIFIED WORKSPACE LAYOUT (AFTER LOGIN) */}
      {user && (
        <div className="flex grow relative">
          
          {/* DESKTOP SIDEBAR DRAWER */}
          <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-600 border-r border-slate-200 justify-between shrink-0 p-5 sticky top-0 h-screen z-50">
            <div className="space-y-8">
              {/* App Brand */}
              <div className="px-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-200">W</div>
                <div>
                  <h1 className="font-display font-black text-slate-900 text-base leading-none tracking-tight">WAEC Master</h1>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">SSS Preps Startup</p>
                </div>
              </div>

              {/* Student Profile widget block */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex items-center gap-2.5 shadow-xs">
                <span className="text-2xl">{user.avatar}</span>
                <div className="w-0 shrink grow">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate leading-tight">{user.username}</h4>
                  <p className="text-[10px] text-indigo-600 font-extrabold">{user.isAdmin ? 'Exam Admin' : `Level ${user.level} Candidate`}</p>
                </div>
              </div>

              {/* Sidebar Links block */}
              <nav className="space-y-1">
                {NAVIGATION_DOCKS.filter(item => item.id !== 'admin' || user.isAdmin).map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setActiveQuestionForTutor(null);
                      }}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-3 cursor-pointer ${isActive ? 'bg-indigo-50 text-indigo-750 font-extrabold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Standalone Desktop Offline App promo card in sidepanel */}
              <div id="offline-install-sidebar-card" className="bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-2xl text-white space-y-2.5 shadow-md border border-slate-800 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>💾</span> {t('Standalone Installer')}
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  {t('Install the entire study suite as a standalone client to practice all subjects completely offline.')}
                </p>
                <button
                  type="button"
                  onClick={() => downloadOfflineCbtApp(SAMPLE_QUESTIONS)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-2xs rounded-xl shadow-md transition flex justify-center items-center gap-1.5 cursor-pointer border-0"
                >
                  <Download className="w-3.5 h-3.5 text-white" /> {t('Get Standalone App')}
                </button>
              </div>
            </div>

            {/* Logout actions */}
            <button
              onClick={handleLogOutGlobal}
              className="py-2.5 px-3.5 bg-slate-50 hover:bg-red-50 rounded-xl text-xs font-bold text-slate-600 hover:text-red-650 hover:border-red-100 border border-slate-100 transition flex items-center gap-3 cursor-pointer mt-8 animate-fadeIn"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-450 hover:text-red-500" /> {t('Log Out Account')}
            </button>
          </aside>

          {/* MOBILE NAVIGATION UPPER HEADER BAR */}
          <div className="lg:hidden w-full fixed top-0 left-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 z-40 text-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-indigo-100">W</div>
              <h1 className="font-display font-black text-sm text-slate-900 tracking-tight">
                WAEC Master
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full text-[10px] cursor-pointer shadow-3xs"
                title="Scegli Lingua / Change Language"
              >
                <span>{appLanguage === 'en' ? '🇬🇧 EN' : '🇮🇹 IT'}</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* MOBILE SLIDE-OVER DRAWER MENU */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-xs z-50 text-slate-800 p-6 space-y-6 flex flex-col justify-between shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-2xl">{user.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{user.username}</h4>
                    <span className="text-3xs text-indigo-600 font-extrabold">{user.isAdmin ? 'Exam Admin' : `Level ${user.level} Candidate`}</span>
                  </div>
                </div>

                <nav className="space-y-1.5 animate-slideUp">
                  {NAVIGATION_DOCKS.filter(item => item.id !== 'admin' || user.isAdmin).map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setActiveQuestionForTutor(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-3 ${isActive ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <IconComp className="w-4.5 h-4.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    downloadOfflineCbtApp(SAMPLE_QUESTIONS);
                  }}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 w-full border-none shadow-md shadow-emerald-50"
                >
                  <Download className="w-4 h-4 text-white animate-bounce shrink-0" />
                  Get Offline Standalone App
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogOutGlobal();
                  }}
                  className="py-3 px-4 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-655 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 w-full border border-slate-100"
                >
                  <LogOut className="w-4.5 h-4.5" /> Log Out Account
                </button>
              </div>
            </div>
          )}

          {/* MAIN PAGE VIEW CONTENT ROUTERS */}
          <main className="grow min-h-screen pt-16 lg:pt-0 flex flex-col overflow-x-hidden w-full bg-slate-50 font-sans">
            
            {/* VIBRANT PALETTE DYNAMIC TOP HEADER */}
            <header className="hidden lg:flex h-20 px-8 items-center justify-between bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
              <div className="flex gap-4 items-center">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold px-4 py-1.5 rounded-full select-none shadow-3xs cursor-pointer text-xs"
                  title="Cambia Lingua / Change Language"
                >
                  <span className="text-sm">{appLanguage === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                  <span>{appLanguage === 'en' ? 'English' : 'Italiano'}</span>
                </button>
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full select-none shadow-3xs">
                  <span className="text-base">🔥</span>
                  <span className="font-bold text-rose-600 text-xs">{user.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full select-none shadow-3xs">
                  <span className="text-base">💎</span>
                  <span className="font-bold text-indigo-600 text-xs">{user.xp.toLocaleString()} XP Cumulative</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-tight">{user.username}</p>
                  <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest">{user.rankTier || 'Bronze Scholar'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold font-sans shadow-xs select-none">
                  {user.avatar}
                </div>
              </div>
            </header>

            <div className="p-4 md:p-8 lg:p-10 max-w-7xl w-full mx-auto grow">
              <div className="max-w-5xl mx-auto h-full py-2">
              
              {/* Tab: Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="animate-fadeIn">
                  <Dashboard 
                    progress={user}
                    parentConfig={parentConfig}
                    announcements={announcements}
                    activeTournaments={[]}
                    onStartQuiz={(subject) => {
                      setActiveTab('practice');
                    }}
                    onNavigateToTab={(tab) => {
                      if (tab === 'practice') setActiveTab('practice');
                    }}
                    onLogout={handleLogOutGlobal}
                  />
                </div>
              )}

              {/* Tab: Practice Simulator */}
              {activeTab === 'practice' && (
                <div className="animate-fadeIn">
                  <CbtSimulator 
                    userXP={user.xp}
                    userLevel={user.level}
                    onQuizCompleted={handleQuizCompleted}
                    onAskAiTutor={handleAskTutorBridge}
                    downloadedSubjects={downloadedSubjects}
                    onDownloadSubject={handleDownloadSubject}
                    subjectsList={subjectsList}
                    questionsList={questionsList}
                  />
                </div>
              )}

              {/* Tab: Multiplayer Arena */}
              {activeTab === 'battle' && (
                <div className="animate-fadeIn">
                  <MultiplayerView 
                    currentUsername={user.username}
                    avatar={user.avatar}
                    level={user.level}
                    onBattleWon={(xpReward) => {
                      // Adjust XP for winning 1v1 battle!
                      handleQuizCompleted(xpReward, 4, 5, 3);
                    }}
                  />
                </div>
              )}

              {/* Tab: AI Tutor Coach */}
              {activeTab === 'tutor' && (
                <div className="animate-fadeIn">
                  <AiTutorView 
                    currentUsername={user.username}
                    activeQuestion={activeQuestionForTutor}
                    onClearActiveQuestion={() => setActiveQuestionForTutor(null)}
                    savedSessions={user.savedAiSessions || []}
                    onSaveAiSession={handleSaveAiSession}
                    onDeleteSavedAiSession={handleDeleteSavedAiSession}
                  />
                </div>
              )}

              {/* Tab: Leaderoard standins */}
              {activeTab === 'leaderboard' && (
                <div className="animate-fadeIn">
                  <LeaderboardView 
                    currentUsername={user.username}
                    userXP={user.xp}
                    userLevel={user.level}
                  />
                </div>
              )}

              {/* Tab: Social forum study boards */}
              {activeTab === 'community' && (
                <div className="animate-fadeIn">
                  <CommunityView 
                    currentUsername={user.username}
                    avatar={user.avatar}
                    currentUserEmail={user.email}
                  />
                </div>
              )}

              {/* Tab: Linked Companion Guardian safeguards */}
              {activeTab === 'guardian' && (
                <div className="animate-fadeIn">
                  <ParentDashboard 
                    progress={user}
                    currentConfig={parentConfig}
                    onUpdateParentConfig={(updatedConfig) => setParentConfig(updatedConfig)}
                  />
                </div>
              )}

              {/* Tab: Admin workspace panel */}
              {activeTab === 'admin' && (
                <div className="animate-fadeIn">
                  <AdminPanel 
                    questionsList={questionsList}
                    onAddQuestion={handleAddQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onPostAnnouncement={handlePostAnnouncement}
                    subjectsList={subjectsList}
                    onAddSubject={handleAddSubject}
                    onDeleteSubject={handleDeleteSubject}
                  />
                </div>
              )}

              {/* Tab: Cybersecurity Command Hub */}
              {activeTab === 'secops' && (
                <div className="animate-fadeIn">
                  <SecurityCenter />
                </div>
              )}

              </div>
            </div>
          </main>

        </div>
      )}
    </div>
  );
}
