
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex h-[50vh] w-full items-center justify-center p-4">
                    <Card className="w-full max-w-md border-destructive/50 bg-destructive/10">
                        <CardHeader className="text-destructive">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                An unexpected error occurred in this component.
                            </p>
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <pre className="mt-2 max-h-32 overflow-auto rounded bg-secondary p-2 text-xs text-secondary-foreground">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full"
                            >
                                Try again
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
