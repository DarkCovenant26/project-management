'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    // Removed unused email state
    // Backend uses 'username' and 'password'.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login/', { username, password });
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            // Set cookie for middleware
            document.cookie = `access=${response.data.access}; path=/; max-age=86400; SameSite=Lax`;
            router.push('/dashboard');
        } catch (err: unknown) {
            console.error(err);
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <Card className="w-[350px] border-slate-800 bg-slate-900/50 backdrop-blur-xl text-slate-50">
                <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription className="text-slate-400">Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-200">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="bg-slate-950/50 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="bg-slate-950/50 border-slate-800 text-slate-200"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Sign In</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-400">
                        Don&apos;t have an account? <Link href="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
