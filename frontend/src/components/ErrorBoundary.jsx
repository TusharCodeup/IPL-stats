import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]: Caught runtime crash:', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0b0f19] dark:bg-[#0b0f19] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 glass-card border border-red-500/20 bg-[#111827]/60 rounded-3xl shadow-2xl flex flex-col items-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Something Went Wrong</h2>
            <p className="text-gray-400 text-sm mt-3 mb-6">
              An unexpected rendering crash occurred. Details: <span className="text-red-400 italic block mt-1">{this.state.error?.message}</span>
            </p>
            <button 
              onClick={this.handleReset}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Reload App</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
