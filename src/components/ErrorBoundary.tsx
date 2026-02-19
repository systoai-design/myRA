import React, { Component, ErrorInfo, ReactNode } from "react";

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
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 border border-red-200">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Application Crashed</h1>
                        <p className="text-gray-700 mb-4">Something went wrong while rendering the application.</p>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-96">
                            <code className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                                {this.state.error?.toString()}
                                {this.state.error?.stack}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
