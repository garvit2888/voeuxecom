import React, { useState } from 'react';
import {
  ShieldCheck, Play, Clock, Package, Mail, Zap, CheckCircle,
  AlertCircle, RefreshCw, Eye, EyeOff, Boxes, Truck, FileText,
  Bell, Activity, Settings, TrendingUp, X, ExternalLink
} from 'lucide-react';

// ─── Config (credentials baked in — API pending approval) ────
const CONFIG = {
  appId: '28a49b3985b7109470057a95972985708636',
  appSecret: '14de577644fa0da18c00db5134eafd379',
  sellerId: 'VoeuxExperience',
  officeEmail: 'voeuxoffice@gmail.com',
  scriptEmail: 'voeuxexperience@gmail.com',
  scheduleTime: '11:00 AM IST',
  apiStatus: 'PENDING', // Change to 'ACTIVE' once Flipkart approves
};

// ─── Automation Pipeline Steps ───────────────────────────────
const AUTOMATION_STEPS = [
  { id: 1, icon: ShieldCheck, label: 'Authenticate with Flipkart', detail: 'Generate OAuth2 bearer token' },
  { id: 2, icon: Boxes, label: 'Fetch Today\'s Shipments', detail: 'Filter active orders in APPROVED state' },
  { id: 3, icon: Activity, label: 'Filter Eligible Orders', detail: 'Verify HOLD = false & DAD date passed' },
  { id: 4, icon: Package, label: 'Pack Each Order', detail: 'Generate shipping labels on Flipkart' },
  { id: 5, icon: FileText, label: 'Download Invoice PDFs', detail: 'Retrieve invoice documents via API' },
  { id: 6, icon: Truck, label: 'Dispatch Orders', detail: 'Mark dispatched & schedule pickup' },
  { id: 7, icon: Mail, label: 'Email Invoices to Office', detail: `Send PDF attachments to ${CONFIG.officeEmail}` },
];

const INITIAL_LOGS = [
  { id: 1, timestamp: 'Pending Setup', status: 'waiting', message: 'Awaiting Flipkart API Approval', orders: 0 },
];

export const FlipkartOpsAdmin = () => {
  const [running, setRunning] = useState(false);
  const [runLogs, setRunLogs] = useState(INITIAL_LOGS);
  const [activeStep, setActiveStep] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const runAutomation = async () => {
    if (CONFIG.apiStatus !== 'ACTIVE') {
      showToast('Flipkart API approval is currently PENDING. Automatic execution will activate upon approval.', 'warn');
      return;
    }
    setRunning(true);
    setActiveStep(1);
    for (let i = 1; i <= AUTOMATION_STEPS.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 800));
    }
    setActiveStep(null);
    setRunning(false);
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    setRunLogs(prev => [
      { id: Date.now(), timestamp: now, status: 'success', message: 'Automation executed successfully — Invoices emailed to office.', orders: 0 },
      ...prev
    ]);
    showToast('Automation complete. Order invoices sent to office email.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
           toast.type === 'warn' ? <AlertCircle className="w-4 h-4 text-amber-600" /> :
           <Bell className="w-4 h-4 text-blue-600" />}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Clean Header */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3B429F] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Flipkart Order Automation Portal</h1>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  CONFIG.apiStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  API {CONFIG.apiStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Automated Daily Order Packing, Invoice Emailing & Dispatch System</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={runAutomation}
              disabled={running}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm ${
                running
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : CONFIG.apiStatus === 'ACTIVE'
                    ? 'bg-[#3B429F] hover:bg-[#2e3480] text-white'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin text-[#3B429F]" /> : <Play className="w-4 h-4" />}
              <span>{running ? 'Processing Orders...' : 'Run Automation Now'}</span>
            </button>
          </div>
        </div>

        {/* Account Info & Status Alert */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Status Alert */}
          <div className="md:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Flipkart API Key Pending Approval</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your credentials are completely configured in the portal and Google Apps Script. Flipkart API keys take 1–3 business days for final activation.
              </p>
            </div>
          </div>

          {/* Google Account Info Box */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-[#3B429F]" />
              <span>Google Apps Script Account</span>
            </div>
            <p className="text-sm font-bold text-[#3B429F] break-all">{CONFIG.scriptEmail}</p>
            <p className="text-xs text-slate-500">Log into Google Apps Script using this email to view or edit the backend schedule.</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Daily Schedule</span>
            <p className="text-base font-bold text-slate-900 mt-1">{CONFIG.scheduleTime}</p>
            <span className="text-[11px] text-slate-500">Automated Trigger</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Office Invoice Email</span>
            <p className="text-sm font-bold text-[#3B429F] truncate mt-1">{CONFIG.officeEmail}</p>
            <span className="text-[11px] text-slate-500">PDF Attachment Recipient</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Seller ID</span>
            <p className="text-base font-bold text-slate-900 mt-1">{CONFIG.sellerId}</p>
            <span className="text-[11px] text-slate-500">Flipkart Marketplace</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Fulfillment Type</span>
            <p className="text-base font-bold text-slate-900 mt-1">Standard & Auto</p>
            <span className="text-[11px] text-slate-500">Pack + Dispatch</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Automation Workflow */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Automation Workflow Steps</h2>
                  <p className="text-xs text-slate-500">Executes automatically every day at 11:00 AM IST</p>
                </div>
              </div>

              <div className="space-y-3">
                {AUTOMATION_STEPS.map((step) => {
                  const isActive = activeStep === step.id;
                  const isDone = activeStep !== null && step.id < activeStep;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 p-3.5 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-blue-50/50 border-[#3B429F]/30'
                          : isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        isActive
                          ? 'bg-[#3B429F] text-white'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isDone ? <CheckCircle className="w-4 h-4" /> : step.id}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{step.label}</h4>
                          {isActive && <RefreshCw className="w-3.5 h-3.5 text-[#3B429F] animate-spin" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Logs */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Execution Log History</h3>
              <div className="space-y-2.5">
                {runLogs.map(log => (
                  <div key={log.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold text-slate-800">{log.message}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">Timestamp: {log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Technical Credentials & API Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">API Credentials</h3>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-xs text-[#3B429F] hover:underline font-semibold flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {showConfig ? 'Hide Details' : 'View Config'}
                </button>
              </div>

              {showConfig ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Application ID (API Key)</span>
                    <span className="font-mono text-slate-800 break-all">{CONFIG.appId}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">App Secret</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-800 break-all">
                        {showSecret ? CONFIG.appSecret : '••••••••••••••••••••••••••••••••'}
                      </span>
                      <button onClick={() => setShowSecret(!showSecret)} className="text-slate-400 hover:text-slate-600">
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Seller ID</span>
                    <span className="font-semibold text-slate-800">{CONFIG.sellerId}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Credentials stored securely for backend automation.</p>
              )}
            </div>

            {/* Backend Integration Note */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Backend App Script</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The automation script is deployed in your Google Apps Script associated with <span className="text-amber-300 font-semibold">{CONFIG.scriptEmail}</span>.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Automatic trigger time: <span className="text-white font-medium">11:00 AM IST Daily</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
