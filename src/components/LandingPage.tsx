import React, { useState } from 'react';
import { BookOpen, Award, Users, Flame, Sparkles, Brain, CheckCircle, Smartphone, ArrowRight, Star, ChevronDown, Lock } from 'lucide-react';

interface LandingPageProps {
  onStartAsGuest: () => void;
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export default function LandingPage({ onStartAsGuest, onNavigateToAuth }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const FAQS = [
    {
      q: "Does WAEC Master match the real WAEC syllabus?",
      a: "Yes! All questions, topics, and difficulty grading correspond strictly to the official WAEC & Council syllabus guidelines, adapted for realistic CBT scoring."
    },
    {
      q: "How does the AI Study Assistant work?",
      a: "Our AI Tutor utilizes advanced technology to analyze any math equation or English comprehension text, delivering personalized step-by-step guidance modeled after professional African secondary educators."
    },
    {
      q: "Can I practice when I am offline?",
      a: "Perfectly! You can download subject modules in advance to practice on road trips or areas with faint network signals. Your gained XP, streak, and levels synchronize seamlessly once connection returns."
    },
    {
      q: "What is the multiplayer battle mode?",
      a: "Our multiplayer mode pairs you in real-time with other active West African candidates (or a specialized CBT bot if matching exceeds 5 seconds) to tackle 5 timed exam challenges. Fastest fingers win!"
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Banner Navigation */}
      <header id="landing-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600 rounded-xl text-white transform rotate-3 shadow-md shadow-indigo-200">
              <Brain className="w-6 h-6" />
            </span>
            <span className="font-display font-extrabold text-2xl tracking-tight text-indigo-900">
              WAEC<span className="text-violet-600">Master</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              id="landing-signin-btn"
              onClick={() => onNavigateToAuth('login')}
              className="text-slate-600 hover:text-indigo-600 font-medium transition cursor-pointer"
            >
              Log In
            </button>
            <button 
              id="landing-signup-btn"
              onClick={() => onNavigateToAuth('signup')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition shadow-md shadow-indigo-100 cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="landing-hero" className="relative py-16 px-6 overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> #1 CBT Exam Prep Platform in West Africa
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-950 leading-tight tracking-tight">
              Master WAEC Exams. <br />
              <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Earn Straight A1s.</span>
            </h1>
            
            <p className="text-slate-600 text-lg max-w-xl leading-relaxed">
              Ditch the boring past question paper booklets! Challenge your classmates in rapid quiz battles, climb national leaderboards, and get instant calculus help from our expert AI Tutor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                id="landing-start-cbt-btn"
                onClick={onStartAsGuest}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition cursor-pointer"
              >
                Launch CBT Prep (Guest Mode)
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                id="landing-learnmore-btn"
                onClick={() => onNavigateToAuth('signup')}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:-translate-y-0.5 transition cursor-pointer"
              >
                Create Account
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                15+ Subjects Supported
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                PWA & Offline Ready
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-300 rounded-3xl blur-3xl opacity-30 transform -rotate-6"></div>
            <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">🦁</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Chinedu Obi</h4>
                    <p className="text-xs text-slate-500">Federal Government College, Enugu</p>
                  </div>
                </div>
                <div className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold">
                  Rank #1 Lagos
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Weekly Goal</span>
                  <span>450 / 500 XP</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-slate-400 text-2xs font-bold uppercase tracking-wider">Streak</p>
                  <p className="text-xl font-extrabold text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame className="w-4.5 h-4.5" /> 8 days
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-slate-400 text-2xs font-bold uppercase tracking-wider">Accuracy</p>
                  <p className="text-xl font-extrabold text-indigo-600 mt-0.5">92%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-slate-400 text-2xs font-bold uppercase tracking-wider">Level</p>
                  <p className="text-xl font-extrabold text-violet-600 mt-0.5">Tier 8</p>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100/50 rounded-2xl p-4 flex gap-3 text-sm text-violet-950">
                <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">AI Study Tip</p>
                  <p className="text-xs text-slate-600">Great job in set theory! You are weak in Trigonometry identities. Try a 5-question speed trial now.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="landing-features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Built For Success</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
            Comprehensive CBT Ecosystem Designed for Results
          </h2>
          <p className="text-slate-600">
            Every screen, sound, and notification of WAEC Master is developed to keep students actively engaged and motivated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">Authentic WAEC Syllabus</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Real questions with calculations, maps, diagrams, detailed feedback, and hints. Mathematics, Chemistry, English and 12 more subjects.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">Multiplayer 1v1 Battles</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Compete live with school peers and random candidates. Answer accurately in real-time, send emojis, and win trophy bonuses!
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">24/7 AI Tutor Coach</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Stuck on a complex chemical formula or a government essay question? Get step-by-step, simple guidance instantly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">Gamification loops</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Level up, build active daily streaks, complete daily study missions, spin the reward wheel, and earn gold medals!
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">Offline Preparation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Download test modules in advance! Practice with no data bundle or when network services are sparse/intermittent.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">In-Depth Performance Insights</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              View your performance heatmap, average completion velocity, list of weak topics, and see overall progress trends over time.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="landing-testimonials" className="bg-indigo-900/5 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Student Testimonials</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950">A1 Stories From Top Candidates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 relative space-y-4 shadow-sm">
              <div className="flex text-amber-400 gap-1"><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /></div>
              <p className="text-slate-600 text-sm italic">
                "WAEC Master transformed my preparation! The multiplayer battles made study addictive. I scored 8 A1s in my exams, including and Mathematics & further maths!"
              </p>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Amara Nwachukwu</h4>
                <p className="text-xs text-slate-500">Lagos, Nigeria</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 relative space-y-4 shadow-sm">
              <div className="flex text-amber-400 gap-1"><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /></div>
              <p className="text-slate-600 text-sm italic">
                "The step-by-step math solver is a lifesaver. It showed me precisely where my calculations failed. Highly recommend to all SSS candidates."
              </p>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Kofi Boateng</h4>
                <p className="text-xs text-slate-500">Accra, Ghana</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 relative space-y-4 shadow-sm">
              <div className="flex text-amber-400 gap-1"><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /><Star className="fill-amber-400 w-4 h-4" /></div>
              <p className="text-slate-600 text-sm italic">
                "The offline mode allowed me to practice at the workspace in Freetown where data connection is slow. Truly made my WAEC prep smooth."
              </p>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mariama Kamara</h4>
                <p className="text-xs text-slate-500">Freetown, Sierra Leone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section id="landing-pricing" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Invest In Your Future</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">Simple, Affordable Pricing</h2>
          <p className="text-slate-600">Start for free and unlock the ultimate toolkit when you are ready to dominate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 relative hover:border-slate-300">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Free Candidate</h3>
              <p className="text-xs text-slate-500">Essential prep for daily revision</p>
            </div>
            <div className="flex items-baseline text-slate-900">
              <span className="text-4xl font-extrabold tracking-tight">₦0</span>
              <span className="ml-1 text-sm text-slate-400">/ forever</span>
            </div>
            <button 
              onClick={onStartAsGuest}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-center text-sm transition cursor-pointer"
            >
              Start Free Practice
            </button>
            <ul className="space-y-3 text-sm text-slate-600 list-none p-0">
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Basic Subject Practice</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Global Leaderboard access</li>
              <li className="flex items-center gap-2 font-light text-slate-400"><Lock className="w-3.5 h-3.5" /> Unlimited AI explanations</li>
              <li className="flex items-center gap-2 font-light text-slate-400"><Lock className="w-3.5 h-3.5" /> High Stakes tournament rooms</li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="bg-slate-900 p-8 rounded-3xl border-2 border-indigo-500 space-y-6 relative text-white shadow-xl shadow-indigo-950/20 transform md:-translate-y-2">
            <span className="absolute top-4 right-4 bg-indigo-500 text-white text-3xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full">POPULAR</span>
            <div>
              <h3 className="font-bold text-lg">Premium Master VIP</h3>
              <p className="text-xs text-slate-400">Complete prep for Straight A1 candidates</p>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold tracking-tight">₦2,500</span>
              <span className="ml-1 text-sm text-slate-400">/ single term</span>
            </div>
            <button 
              onClick={onStartAsGuest}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-center text-sm transition shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              Unlock Premium Access
            </button>
            <ul className="space-y-3 text-sm text-slate-300 list-none p-0">
              <li className="flex items-center gap-2 text-white font-semibold"><CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Unlimited AI Tutor assistance</li>
              <li className="flex items-center gap-2 text-white font-semibold"><CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Premium simulated WAEC & JAMB Mocks</li>
              <li className="flex items-center gap-2 text-white font-semibold"><CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Auto-generated revision briefs</li>
              <li className="flex items-center gap-2 text-white font-semibold"><CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> VIP Rank progression and double XP</li>
              <li className="flex items-center gap-2 text-white font-semibold"><CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Unlock exclusive premium themes</li>
            </ul>
          </div>

          {/* Parent Connected Tier */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 relative hover:border-slate-300">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Parent Guardian Link</h3>
              <p className="text-xs text-slate-500">Track, monitor and reward your child</p>
            </div>
            <div className="flex items-baseline text-slate-900">
              <span className="text-4xl font-extrabold tracking-tight">₦1,500</span>
              <span className="ml-1 text-sm text-slate-400">/ term</span>
            </div>
            <button 
              onClick={onStartAsGuest}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-4 rounded-xl text-center text-sm transition cursor-pointer"
            >
              Link Parent Control
            </button>
            <ul className="space-y-3 text-sm text-slate-600 list-none p-0">
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Real-time activity emails/SMS</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Study hour locking features</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Custom rewards & medals allocation</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> SSS Performance Insights reports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="landing-faq" className="bg-slate-100 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-slate-950">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about preparing for WAEC exams on WAEC Master.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span className="font-display">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition transform ${faqOpen[idx] ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen[idx] && (
                  <div className="p-6 pt-0 border-t border-slate-150 text-slate-600 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="landing-footer" className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white font-bold"><Brain className="w-4 h-4" /></span>
            <span className="font-display font-extrabold text-xl text-white">WAEC Master</span>
          </div>
          <p className="text-xs max-w-sm mx-auto">
            Providing high impact CBT training across Nigeria, Ghana, Sierra Leone, Gambia, and Liberia. Empowering scholars to fulfill their professional limits.
          </p>
          <div className="text-3xs text-slate-600">
            © 2026 WAEC Master, Inc. All rights reserved. This web application is an educational preparation resource.
          </div>
        </div>
      </footer>
    </div>
  );
}
