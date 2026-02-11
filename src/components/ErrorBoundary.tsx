"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-kasi-charcoal mb-2">Something went wrong</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm">
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="btn-primary text-sm flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
