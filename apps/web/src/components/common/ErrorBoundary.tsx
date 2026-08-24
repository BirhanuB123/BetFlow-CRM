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
        <div className="p-6 my-4 bg-destructive/10 dark:bg-destructive border border-destructive/20 dark:border-destructive rounded-xl text-destructive dark:text-destructive shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 dark:bg-destructive rounded-lg shrink-0">
              <svg
                className="w-6 h-6 text-destructive dark:text-destructive"
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
              <h3 className="text-base font-semibold text-destructive dark:text-destructive">
                {this.props.fallbackTitle || 'Component Render Error'}
              </h3>
              <p className="mt-1 text-sm text-destructive dark:text-destructive">
                {this.props.fallbackMessage ||
                  'An unexpected error occurred while rendering this section of the page.'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3 text-xs bg-destructive/10/50 dark:bg-destructive p-2.5 rounded font-mono overflow-auto max-h-40">
                  <summary className="cursor-pointer font-medium text-destructive dark:text-destructive mb-1">
                    Technical Stack Trace
                  </summary>
                  {this.state.error.toString()}
                </details>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive active:bg-destructive rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-xs font-semibold text-destructive dark:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive rounded-lg transition-colors cursor-pointer"
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
