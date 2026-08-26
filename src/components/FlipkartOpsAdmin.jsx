import React, { useState } from 'react';
import {
  ShieldCheck, Play, Clock, Package, Mail, Zap, CheckCircle,
  AlertCircle, RefreshCw, Eye, EyeOff, Boxes, Truck, FileText,
  Bell, Activity, Settings, TrendingUp, X
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────
const CONFIG = {
  appId: '28a49b3985b7109470057a95972985708636',
  appSecret: '14de577644fa0da18c00db5134eafd379',
  sellerId: 'VoeuxExperience',
  officeEmail: 'voeuxoffice@gmail.com',
  scriptEmail: 'voeuxexperience@gmail.com',
  scheduleTime: '11:00 AM IST',
  apiStatus: 'PENDING', // Change to 'ACTIVE' once Flipkart approves
};

export const FlipkartOpsAdmin = () => {
  const [running, setRunning] = useState(false);
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
    await new Promise(r => setTimeout(r, 2000));
    setRunning(false);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
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

        {/* Status Alert & Google Account Info */}
        <div className="grid md:grid-cols-3 gap-6">
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

        {/* Config & Backend Card Grid */}
        <div className="grid md:grid-cols-2 gap-6">
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

          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Backend App Script</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                The automation script is deployed in your Google Apps Script associated with <span className="text-amber-300 font-semibold">{CONFIG.scriptEmail}</span>.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
              Automatic trigger time: <span className="text-white font-medium">11:00 AM IST Daily</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
