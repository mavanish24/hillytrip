import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[HillyTrip Critical Render Error]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 my-8 max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 mb-3">
            {this.props.fallbackTitle || 'Something went wrong with this view'}
          </h2>
          <p className="text-sm font-sans text-slate-500 dark:text-slate-400 max-w-md mb-8">
            {this.props.fallbackMessage || 'The travel intelligence panel encountered a rendering error. Our local network team has been notified.'}
            {this.state.error && (
              <span className="block mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-xs font-mono text-red-700 dark:text-red-300 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              Reset & Reload
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '#/';
              }}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Home size={14} />
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
