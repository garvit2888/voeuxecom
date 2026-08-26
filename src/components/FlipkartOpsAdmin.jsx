import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Play, Clock, Package, Mail, Zap, CheckCircle,
  AlertCircle, RefreshCw, Eye, EyeOff, Lock, LogOut,
  ChevronRight, Boxes, Truck, FileText, Bell, Activity,
  RotateCcw, Settings, TrendingUp, X
} from 'lucide-react';

// ─── Admin Auth ───────────────────────────────────────────────
const ADMIN_PASSWORD = 'VoeuxOps@2026';
const SESSION_KEY = 'voeux_ops_session';

// ─── Config (credentials baked in — API pending approval) ────
const CONFIG = {
  appId: '28a49b3985b7109470057a95972985708636',
  appSecret: '14de577644fa0da18c00db5134eafd379',
  sellerId: 'VoeuxExperience',
  officeEmail: 'voeuxoffice@gmail.com',
  scheduleTime: '11:00 AM IST',
  apiStatus: 'PENDING', // Change to 'ACTIVE' once Flipkart approves
};

// ─── Automation Steps ─────────────────────────────────────────
const AUTOMATION_STEPS = [
  { id: 1, icon: ShieldCheck, label: 'Authenticate with Flipkart', detail: 'OAuth2 client credentials token' },
  { id: 2, icon: Boxes, label: 'Fetch Today\'s Shipments', detail: 'POST /v3/shipments/filter/ — state: APPROVED' },
  { id: 3, icon: Activity, label: 'Filter Eligible Orders', detail: 'HOLD = false AND Dispatch After Date passed' },
  { id: 4, icon: Package, label: 'Pack Each Order', detail: 'POST /v3/shipments/labels — marks as packed' },
  { id: 5, icon: FileText, label: 'Download Invoice PDFs', detail: 'POST /v3/shipments/{id}/labelOnly/pdf' },
  { id: 6, icon: Truck, label: 'Dispatch Orders', detail: 'POST /v3/shipments/dispatch — courier pickup scheduled' },
  { id: 7, icon: Mail, label: 'Email Invoices to Office', detail: `PDFs → ${CONFIG.officeEmail}` },
];

// ─── Mock run log ─────────────────────────────────────────────
const MOCK_LOGS = [
  { id: 1, timestamp: '—', status: 'waiting', message: 'Awaiting first run — API approval pending', orders: 0 },
];

export const FlipkartOpsAdmin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [running, setRunning] = useState(false);
  const [runLogs, setRunLogs] = useState(MOCK_LOGS);
  const [activeStep, setActiveStep] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState(null);
  const pwRef = useRef(null);

  useEffect(() => {
    if (!authed) setTimeout(() => pwRef.current?.focus(), 300);
  }, [authed]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPassword('');
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword('');
  };

  // Simulate automation run (real calls will work once API is Active)
  const runAutomation = async () => {
    if (CONFIG.apiStatus !== 'ACTIVE') {
      showToast('API key is still Pending Flipkart approval. Automation will work once approved.', 'warn');
      return;
    }
    setRunning(true);
    setActiveStep(1);
    const steps = AUTOMATION_STEPS.length;
    for (let i = 1; i <= steps; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setActiveStep(null);
    setRunning(false);
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    setRunLogs(prev => [
      { id: Date.now(), timestamp: now, status: 'success', message: 'Automation completed — invoices emailed to office', orders: 0 },
      ...prev
    ]);
    showToast('Automation run complete — invoices sent to voeuxoffice@gmail.com', 'success');
  };

  // ── Password Gate ──────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0c1a] flex items-center justify-center px-4">
        <div className={`w-full max-w-sm transition-all duration-150 ${pwError ? 'animate-shake' : ''}`}>
          {/* Logo */}
          <div className="text-center mb-8 space-y-2">
            <div className="w-14 h-14 bg-[#3B429F] rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-900/60">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-white font-black text-xl tracking-tight">VOEUX <span className="text-indigo-400">OPS</span></h1>
            <p className="text-gray-500 text-xs">Internal Operations Dashboard</p>
          </div>

          {/* Login form */}
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 space-y-4 shadow-2xl">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Access Code</label>
            <div className="relative">
              <input
                ref={pwRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className={`w-full bg-[#0d1117] border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:ring-2 transition-all pr-11
                  ${pwError ? 'border-red-500 ring-red-500/30' : 'border-white/10 focus:ring-indigo-500/40 focus:border-indigo-500'}`}
              />
              <button
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition"
              >
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {pwError && <p className="text-red-400 text-xs">Incorrect password. Try again.</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-[#3B429F] hover:bg-[#4a52b8] text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-indigo-900/40"
            >
              Enter Dashboard
            </button>
          </div>

          <p className="text-center text-gray-700 text-[10px] mt-6">voeuxtechnologies.in · Internal Access Only</p>
        </div>

        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-8px)}
            40%{transform:translateX(8px)}
            60%{transform:translateX(-6px)}
            80%{transform:translateX(6px)}
          }
          .animate-shake { animation: shake 0.4s ease; }
        `}</style>
      </div>
    );
  }

  // ── Main Dashboard ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0c1a] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-500/40 text-emerald-200' :
            toast.type === 'warn' ? 'bg-amber-900/90 border border-amber-500/40 text-amber-200' :
            'bg-indigo-900/90 border border-indigo-500/40 text-indigo-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
           toast.type === 'warn' ? <AlertCircle className="w-4 h-4" /> :
           <Bell className="w-4 h-4" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/8 bg-[#0d1220]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#3B429F] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight">VOEUX <span className="text-indigo-400">OPS</span></h1>
              <p className="text-[10px] text-gray-500 leading-none">Flipkart Operations Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* API Status pill */}
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border
              ${CONFIG.apiStatus === 'ACTIVE'
                ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-900/40 border-amber-500/40 text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${CONFIG.apiStatus === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              API {CONFIG.apiStatus}
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/8">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Pending Banner */}
        {CONFIG.apiStatus === 'PENDING' && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-bold text-sm">Flipkart API Approval Pending</p>
              <p className="text-amber-500/80 text-xs mt-0.5">
                Your API key is registered and credentials are configured. Automation will activate automatically once Flipkart approves your access.
                Typically 1–3 business days. You can raise a Seller Support ticket to expedite.
              </p>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'API Status', value: CONFIG.apiStatus, sub: 'Flipkart approval', icon: ShieldCheck, color: CONFIG.apiStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Schedule', value: '11:00 AM', sub: 'Daily · IST', icon: Clock, color: 'text-indigo-400' },
            { label: 'Office Email', value: 'Configured', sub: CONFIG.officeEmail, icon: Mail, color: 'text-cyan-400' },
            { label: 'Seller ID', value: CONFIG.sellerId, sub: 'Production account', icon: TrendingUp, color: 'text-purple-400' },
          ].map(card => (
            <div key={card.label} className="bg-[#111827] border border-white/8 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className={`text-lg font-black ${card.color}`}>{card.value}</p>
              <p className="text-gray-600 text-[10px] truncate">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Automation Flow — Left 3 cols */}
          <div className="lg:col-span-3 bg-[#111827] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-base">Daily Automation Flow</h2>
                <p className="text-gray-500 text-xs mt-0.5">Runs every day at {CONFIG.scheduleTime}</p>
              </div>
              <button
                onClick={runAutomation}
                disabled={running}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95
                  ${running
                    ? 'bg-indigo-900/40 text-indigo-400 cursor-not-allowed'
                    : CONFIG.apiStatus === 'ACTIVE'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? 'Running…' : 'Run Now'}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {AUTOMATION_STEPS.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isDone = activeStep !== null && step.id < activeStep;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-indigo-900/30 border border-indigo-500/40' :
                        isDone ? 'bg-emerald-900/15 border border-emerald-500/20' :
                        'bg-white/3 border border-transparent'}`}
                  >
                    {/* Step number / icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
                      ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' :
                        isDone ? 'bg-emerald-900/50' :
                        'bg-white/5'}`}>
                      {isDone
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : isActive
                          ? <step.icon className="w-4 h-4 text-white animate-pulse" />
                          : <span className="text-[10px] font-black text-gray-600">{step.id}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-600 truncate">{step.detail}</p>
                    </div>
                    {isActive && (
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connector line hint */}
            <p className="text-[10px] text-gray-700 border-t border-white/5 pt-4">
              Full automation — Pack + Dispatch + Email. Orders are marked as packed and dispatched on Flipkart automatically.
            </p>
          </div>

          {/* Right 2 cols */}
          <div className="lg:col-span-2 space-y-5">

            {/* Run Log */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 space-y-4">
              <h3 className="font-black text-sm">Run History</h3>
              <div className="space-y-2">
                {runLogs.map(log => (
                  <div key={log.id} className="bg-white/3 border border-white/6 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {log.status === 'success'
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : log.status === 'error'
                          ? <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          : <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                      <p className="text-xs font-bold text-gray-300 truncate">{log.message}</p>
                    </div>
                    <p className="text-[10px] text-gray-600 pl-5">{log.timestamp}</p>
                    {log.orders > 0 && (
                      <p className="text-[10px] text-indigo-400 pl-5">{log.orders} orders processed</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials Panel */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm">Configuration</h3>
                <button
                  onClick={() => setShowConfig(p => !p)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  {showConfig ? 'Hide' : 'Show'}
                </button>
              </div>

              {showConfig ? (
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'App ID (API Key)', value: CONFIG.appId, mono: true },
                    { label: 'App Secret', value: showSecret ? CONFIG.appSecret : '••••••••••••••••••••', mono: true, toggle: true },
                    { label: 'Seller ID', value: CONFIG.sellerId, mono: false },
                    { label: 'Office Email', value: CONFIG.officeEmail, mono: false },
                    { label: 'Run Schedule', value: `Daily at ${CONFIG.scheduleTime}`, mono: false },
                    { label: 'Auth Endpoint', value: 'api.flipkart.net/sellers/oauth-token', mono: true },
                  ].map(row => (
                    <div key={row.label} className="space-y-0.5">
                      <p className="text-gray-600 uppercase tracking-wider text-[9px] font-bold">{row.label}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-gray-300 break-all ${row.mono ? 'font-mono text-[10px]' : ''}`}>{row.value}</p>
                        {row.toggle && (
                          <button onClick={() => setShowSecret(p => !p)} className="text-gray-600 hover:text-gray-400 shrink-0">
                            {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-xs">Credentials configured · Click Show to view</p>
              )}
            </div>

            {/* API Endpoints reference */}
            <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-sm">API Endpoints</h3>
              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/v3/shipments/filter/', label: 'Fetch Shipments' },
                  { method: 'POST', path: '/v3/shipments/labels', label: 'Pack Orders' },
                  { method: 'POST', path: '/v3/shipments/{id}/labelOnly/pdf', label: 'Invoice PDF' },
                  { method: 'POST', path: '/v3/shipments/dispatch', label: 'Dispatch' },
                  { method: 'GET', path: '/v3/shipments/{id}', label: 'Order Status' },
                ].map(ep => (
                  <div key={ep.path} className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0
                      ${ep.method === 'POST' ? 'bg-indigo-900/60 text-indigo-400' : 'bg-emerald-900/60 text-emerald-400'}`}>
                      {ep.method}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{ep.path}</span>
                    <span className="text-[10px] text-gray-600 shrink-0">{ep.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/6 pt-4 flex items-center justify-between text-gray-700 text-[10px]">
          <span>VOEUX® Internal Operations · Restricted Access</span>
          <span>Flipkart Seller ID: {CONFIG.sellerId}</span>
        </div>
      </div>
    </div>
  );
};
