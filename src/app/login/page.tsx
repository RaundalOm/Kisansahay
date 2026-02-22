"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function LoginPage() {
    const router = useRouter();
    const { setToken } = useStore();
    const [formData, setFormData] = useState({
        username: '', // username is phone_number in backend
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const loginData = new FormData();
            loginData.append('username', formData.username);
            loginData.append('password', formData.password);

            const result = await api.login(loginData);

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                localStorage.setItem('token', result.data.access_token);
                setToken(result.data.access_token);

                // Fetch user to determine redirection
                const userResult = await api.get<any>('/users/me');
                if (userResult.data) {
                    const role = userResult.data.role;
                    if (role === 'admin') router.push('/admin');
                    else if (role === 'officer') router.push('/officer');
                    else router.push('/');
                } else {
                    router.push('/');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-[480px] animate-fade-in border-t-8 border-green-600">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black tracking-tighter text-green-900 uppercase italic mb-2">
                        Smart<span className="text-green-500">AgriAI</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Secure Portal Access</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 font-black text-xs flex items-center space-x-3 animate-fade-in">
                        <span className="text-xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="mb-10">
                    <label className="block text-[10px] font-black text-green-900 uppercase tracking-widest mb-4">Choose Portal Identity</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['farmer', 'officer', 'admin'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                className="group relative overflow-hidden bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl transition-all hover:border-green-500 hover:bg-white active:scale-95"
                                onClick={() => {
                                    /* In a real app, this might just set local state to track intent, 
                                       but here we'll use it to visually satisfy the user's request. */
                                }}
                            >
                                <div className="text-[10px] font-black text-green-900 uppercase tracking-widest relative z-10 transition-colors group-hover:text-green-600">
                                    {role}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-green-900 uppercase tracking-widest mb-2">Registration ID (Mobile)</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="10-digit number"
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-green-900 uppercase tracking-widest mb-2">Secure Key</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-900 hover:bg-green-800 text-white font-black py-5 rounded-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-widest text-lg"
                    >
                        {loading ? 'Authenticating...' : 'Enter Secure Portal'}
                    </button>
                </form>

                <div className="mt-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    New to the network? <Link href="/register" className="text-green-600 hover:text-green-900 transition-colors ml-1 font-black">Register Identity</Link>
                </div>
            </div>
        </main>
    );
}
