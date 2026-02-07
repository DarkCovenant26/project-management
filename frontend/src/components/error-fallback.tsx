'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
    error?: Error;
    resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    const router = useRouter();

    return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                Something went wrong
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                {error?.message || "An unexpected error occurred. We've been notified and are looking into it."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                    onClick={resetErrorBoundary}
                    variant="default"
                    className="gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try again
                </Button>
                <Button
                    onClick={() => {
                        resetErrorBoundary();
                        router.push('/dashboard');
                    }}
                    variant="outline"
                    className="gap-2"
                >
                    <Home className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && error?.stack && (
                <pre className="mt-8 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs text-muted-foreground">
                    {error.stack}
                </pre>
            )}
        </div>
    );
}
