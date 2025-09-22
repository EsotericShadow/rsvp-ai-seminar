'use client';

import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  editorName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function EditorErrorBoundary({ 
  children, 
  editorName, 
  onError 
}: EditorErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log editor-specific errors
    console.error(`Error in ${editorName}:`, error, errorInfo);
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // In production, you might want to send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to Sentry, LogRocket, etc.
      console.error('Editor Error:', {
        editor: editorName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const editorFallback = (
    <div className="min-h-[300px] flex items-center justify-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Editor Error
        </h3>
        <p className="text-sm text-yellow-600 mb-4">
          The {editorName} encountered an error. Your work has been automatically saved, but the editor needs to be reset.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Reload Editor
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={editorFallback}
      onError={handleError}
      resetKeys={[editorName]}
    >
      {children}
    </ErrorBoundary>
  );
}

// Specific error boundaries for different editors
export function TemplateEditorErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <EditorErrorBoundary editorName="Template Editor">
      {children}
    </EditorErrorBoundary>
  );
}

export function GlobalHTMLTemplateErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <EditorErrorBoundary editorName="Global HTML Template Editor">
      {children}
    </EditorErrorBoundary>
  );
}

export function GlobalTemplateSettingsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <EditorErrorBoundary editorName="Global Template Settings Editor">
      {children}
    </EditorErrorBoundary>
  );
}

