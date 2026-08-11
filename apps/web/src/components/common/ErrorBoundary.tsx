'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Rendering Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-red-900 dark:text-red-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg shrink-0">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-900 dark:text-red-100">
                {this.props.fallbackTitle || 'Component Render Error'}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {this.props.fallbackMessage ||
                  'An unexpected error occurred while rendering this section of the page.'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3 text-xs bg-red-100/50 dark:bg-red-900/30 p-2.5 rounded font-mono overflow-auto max-h-40">
                  <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-1">
                    Technical Stack Trace
                  </summary>
                  {this.state.error.toString()}
                </details>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
