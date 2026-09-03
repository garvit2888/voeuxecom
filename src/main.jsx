import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VOEUX App ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-16 h-16 bg-[#3B429F] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight">VOEUX® Car Electronics</h1>
          <div className="p-4 bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-mono text-left max-w-xl rounded-xl overflow-x-auto">
            <p className="font-bold text-red-400">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-[10px] mt-2 opacity-80 whitespace-pre-wrap">{this.state.error && this.state.error.stack}</pre>
          </div>
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.search = '';
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer"
          >
            Clear Cache & Reload VOEUX Store
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
