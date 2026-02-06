'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register/', { username, email, password });
            router.push('/login');
        } catch (err: unknown) {
            console.error(err);
            setError('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <Card className="w-[350px] border-slate-800 bg-slate-900/50 backdrop-blur-xl text-slate-50">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription className="text-slate-400">Start managing tasks today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-200">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="jdoe"
                                className="bg-slate-950/50 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jdoe@example.com"
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
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Register</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-400">
                        Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign In</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
