import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6 text-sm">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left overflow-auto border border-gray-200">
                <p className="text-red-600 font-mono text-xs font-bold mb-2">Developer Details:</p>
                <pre className="text-[10px] text-gray-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
