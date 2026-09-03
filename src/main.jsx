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
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Something went wrong while loading this page section. Please click below to refresh and reload the store.
          </p>
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            className="bg-[#3B429F] hover:bg-[#2B308B] text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer"
          >
            Reload VOEUX Store
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
