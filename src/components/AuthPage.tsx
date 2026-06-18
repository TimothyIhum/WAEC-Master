import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck, Sparkles, BookOpen, Brain, ArrowLeft } from 'lucide-react';
import { saveUserToFirestore } from '../utils/firebaseSync';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onAuthSuccess: (user: { username: string; email: string; avatar: string }) => void;
  onBackToLanding: () => void;
  onGuestMode: () => void;
}

export default function AuthPage({ initialMode, onAuthSuccess, onBackToLanding, onGuestMode }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stateCode, setStateCode] = useState('Lagos');
  const [school, setSchool] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile icon vectors/emojis to choose
  const AVATARS = [
    { label: '🦁 Lion', char: '🦁' },
    { label: '⚡ Bolt', char: '⚡' },
    { label: '⭐ Star', char: '⭐' },
    { label: '🧁 Cupcake', char: '🧁' },
    { label: '🛡️ Shield', char: '🛡️' },
    { label: '💎 Diamond', char: '💎' },
    { label: '🎯 Target', char: '🎯' },
    { label: '🎓 Grad', char: '🎓' }
  ];

  // Dynamic users data repository in local storage
  const DEFAULT_USERS_DB = [
    {
      username: 'Ihum Triumph',
      email: 'timothyihum@gmail.com',
      password: 'admin',
      isAdmin: true,
      isPremium: true,
      avatar: '🦁',
      level: 35,
      rankTier: 'Diamond Legend',
      streak: 15,
      accuracy: 96,
      timeSpentMinutes: 1240,
      totalQuizzes: 28,
      school: 'King\'s College, Lagos',
      state: 'Lagos',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 640,
        'English Language': 585,
        'Physics': 240
      }
    },
    {
      username: 'Ihum Temitope',
      email: 'temiokusami@gmail.com',
      password: '12345678ABC',
      isAdmin: true,
      isPremium: true,
      avatar: '👑',
      level: 35,
      rankTier: 'Diamond Legend',
      streak: 15,
      accuracy: 96,
      timeSpentMinutes: 1240,
      totalQuizzes: 28,
      school: 'King\'s College, Lagos',
      state: 'Lagos',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 640,
        'English Language': 585,
        'Physics': 240
      }
    },
    {
      username: 'Ihum Temitope',
      email: 'temitope@waecmaster.edu.ng',
      password: '12345678ABC',
      isAdmin: true,
      isPremium: true,
      avatar: '👑',
      level: 35,
      rankTier: 'Diamond Legend',
      streak: 15,
      accuracy: 96,
      timeSpentMinutes: 1240,
      totalQuizzes: 28,
      school: 'King\'s College, Lagos',
      state: 'Lagos',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 640,
        'English Language': 585,
        'Physics': 240
      }
    },
    {
      username: 'Ihum Triumph',
      email: 'triumph@waecmaster.edu.ng',
      password: 'admin',
      isAdmin: true,
      isPremium: true,
      avatar: '🦁',
      level: 35,
      rankTier: 'Diamond Legend',
      streak: 15,
      accuracy: 96,
      timeSpentMinutes: 1240,
      totalQuizzes: 28,
      school: 'King\'s College, Lagos',
      state: 'Lagos',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 640,
        'English Language': 585,
        'Physics': 240
      }
    },
    {
      username: 'admin',
      email: 'admin@waecmaster.edu.ng',
      password: 'admin',
      isAdmin: true,
      isPremium: true,
      avatar: '🛡️',
      level: 18,
      rankTier: 'Diamond Legend',
      streak: 10,
      accuracy: 92,
      timeSpentMinutes: 840,
      totalQuizzes: 15,
      school: 'WAEC Academy, Abuja',
      state: 'Abuja',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 420,
        'English Language': 280
      }
    },
    {
      username: 'Chioma_Lagos',
      email: 'chioma@gmail.com',
      password: 'password',
      isAdmin: false,
      isPremium: false,
      avatar: '🦊',
      level: 12,
      rankTier: 'Gold Champion',
      streak: 8,
      accuracy: 86,
      timeSpentMinutes: 520,
      totalQuizzes: 14,
      school: 'Queens College, Yaba',
      state: 'Lagos',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 420,
        'English Language': 390
      }
    },
    {
      username: 'Kofi_Accra',
      email: 'kofi@gmail.com',
      password: 'password',
      isAdmin: false,
      isPremium: false,
      avatar: '⚡',
      level: 10,
      rankTier: 'Gold Champion',
      streak: 11,
      accuracy: 82,
      timeSpentMinutes: 440,
      totalQuizzes: 11,
      school: 'Accra High School, Accra',
      state: 'Greater Accra',
      status: 'Clean',
      subjectsStudied: {
        'Mathematics': 380,
        'English Language': 310
      }
    }
  ];

  const getRegisteredUsers = () => {
    const saved = localStorage.getItem('waec_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let modified = false;
          const updated = parsed.map((user: any) => {
            const defUser = DEFAULT_USERS_DB.find(
              (du) => du.email.toLowerCase().trim() === user.email.toLowerCase().trim()
            );
            if (defUser) {
              if (
                user.password !== defUser.password ||
                user.isAdmin !== defUser.isAdmin ||
                user.isPremium !== defUser.isPremium ||
                user.username !== defUser.username
              ) {
                modified = true;
                return {
                  ...user,
                  username: defUser.username,
                  password: defUser.password,
                  isAdmin: defUser.isAdmin,
                  isPremium: defUser.isPremium,
                  avatar: defUser.avatar,
                  level: Math.max(user.level || 0, defUser.level)
                };
              }
            }
            return user;
          });

          // Also guarantee any newly defined users in DEFAULT_USERS_DB are populated
          DEFAULT_USERS_DB.forEach((defUser) => {
            const exists = updated.some(
              (u: any) => u.email.toLowerCase().trim() === defUser.email.toLowerCase().trim()
            );
            if (!exists) {
              updated.push(defUser);
              modified = true;
            }
          });

          if (modified) {
            localStorage.setItem('waec_registered_users', JSON.stringify(updated));
            console.log("Synchronized updated hardcoded credentials into browser localStorage.");
          }
          return updated;
        }
      } catch (e) {
        console.error('Failed to parse saved users repository list:', e);
      }
    }
    // Seed and return default database
    localStorage.setItem('waec_registered_users', JSON.stringify(DEFAULT_USERS_DB));
    return DEFAULT_USERS_DB;
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const currentUsers = getRegisteredUsers();

    if (mode === 'login') {
      if (!email || !password) {
        setErrorMsg('Please enter your email and password.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        
        const matchedUser = currentUsers.find(
          (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
        );

        if (!matchedUser) {
          setErrorMsg('No user registered with this email address. Please sign up first.');
          return;
        }

        if (matchedUser.password !== password) {
          setErrorMsg('Incorrect password. Please try again or click Forgot Password.');
          return;
        }

        // Successfully logged in real user!
        onAuthSuccess({
          username: matchedUser.username,
          email: matchedUser.email,
          avatar: matchedUser.avatar || '🦁'
        });
      }, 1000);
    } else if (mode === 'signup') {
      if (!username || !email || !password) {
        setErrorMsg('Please populate all credential inputs.');
        return;
      }

      // Check for duplicate emails
      const emailLower = email.toLowerCase().trim();
      if (currentUsers.some((u: any) => u.email.toLowerCase().trim() === emailLower)) {
        setErrorMsg('A user with this email is already registered. Sign in instead!');
        return;
      }

      // Check for duplicate usernames
      const usernameClean = username.replace(/\s+/g, '_');
      if (currentUsers.some((u: any) => u.username.toLowerCase() === usernameClean.toLowerCase())) {
        setErrorMsg('This username is already taken. Please pick another one.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const isAdminUser = emailLower === 'temiokusami@gmail.com' || 
                            emailLower === 'admin@waecmaster.edu.ng' || 
                            emailLower === 'timothyihum@gmail.com' ||
                            emailLower === 'temitope@waecmaster.edu.ng' ||
                            emailLower === 'triumph@waecmaster.edu.ng';

        const newUser = {
          username: usernameClean,
          email: emailLower,
          password: password,
          avatar: AVATARS[avatarIndex].char,
          level: isAdminUser ? 30 : 1,
          xp: isAdminUser ? 9500 : 0,
          rankTier: isAdminUser ? 'Diamond Legend' : 'Bronze Scholar',
          streak: 1,
          accuracy: 100,
          timeSpentMinutes: 0,
          totalQuizzes: 0,
          subjectsStudied: {},
          school: school || 'Local High School',
          state: stateCode,
          status: 'Clean',
          isAdmin: isAdminUser,
          isPremium: true
        };

        // Commit to list
        const updatedUsers = [...currentUsers, newUser];
        localStorage.setItem('waec_registered_users', JSON.stringify(updatedUsers));

        // Push new user to Cloud Firestore concurrently
        saveUserToFirestore(newUser)
          .then(() => {
            setLoading(false);
            onAuthSuccess({
              username: newUser.username,
              email: newUser.email,
              avatar: newUser.avatar
            });
          })
          .catch((err) => {
            console.error('Firestore signup save failed:', err);
            setLoading(false);
            onAuthSuccess({
              username: newUser.username,
              email: newUser.email,
              avatar: newUser.avatar
            });
          });
      }, 800);
    } else if (mode === 'forgot') {
      if (!email) {
        setErrorMsg('Please input your registered email address.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('Reset code and restoration link sent successfully!');
        setTimeout(() => setMode('login'), 2000);
      }, 1000);
    }
  };



  return (
    <div id="auth-page-root" className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-6 left-6">
        <button 
          id="auth-back-btn"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-8 space-y-6 relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Candidate Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'verify' && 'Verify Your Email'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Sign in to access your CBT revision sheets'}
            {mode === 'signup' && 'Join thousands of stellar secondary scholars'}
            {mode === 'forgot' && 'Enter email to restore your performance levels'}
            {mode === 'verify' && 'We sent a 4-digit token to your email inbox'}
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Amina_Kano"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              {/* State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">State/Region</label>
                  <select 
                    value={stateCode}
                    onChange={e => setStateCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm focus:outline-hidden"
                  >
                    <option value="Lagos">Lagos (NG)</option>
                    <option value="Abuja">Abuja (NG)</option>
                    <option value="Kano">Kano (NG)</option>
                    <option value="Rivers">Rivers (NG)</option>
                    <option value="Greater Accra">Greater Accra (GH)</option>
                    <option value="Ashanti">Ashanti (GH)</option>
                    <option value="Freetown">Western Area (SL)</option>
                    <option value="Banjul">Banjul (GM)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">School Name</label>
                  <input 
                    type="text"
                    placeholder="Kings College"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Select Your Avatar symbol</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarIndex(idx)}
                      className={`py-2 text-xl rounded-xl border text-center transition cursor-pointer ${avatarIndex === idx ? 'bg-indigo-50 border-indigo-500 scale-105 shadow-xs' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                    >
                      {av.char}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-hidden"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-indigo-600 hover:underline text-xs"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center font-bold shadow-md shadow-indigo-150 transition select-none flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Register Candidate'}
                {mode === 'forgot' && 'Reset My Password'}
              </>
            )}
          </button>
        </form>



        {/* Footer info to shift modes */}
        <div className="text-center text-xs text-slate-500">
          {mode === 'login' && (
            <p>
              New candidate?{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-600 hover:underline font-bold cursor-pointer">
                Create Account
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline font-bold cursor-pointer">
                Sign In Instead
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline font-bold text-center block w-full mt-2 cursor-pointer">
              Return to Login
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <button 
            type="button"
            onClick={onGuestMode}
            className="text-indigo-600 hover:text-indigo-700 font-extrabold text-xs tracking-wider uppercase bg-indigo-50 py-1.5 px-4 rounded-full inline-flex items-center gap-1 cursor-pointer"
          >
            ⚡ Start Instantly as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
