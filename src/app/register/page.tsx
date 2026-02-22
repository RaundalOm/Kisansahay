"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        password: '',
        role: 'farmer'
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const lang = localStorage.getItem('appLanguage');
        if (!lang) router.replace('/language-select');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await api.post('/register', formData);
            if (result.error) setError(result.error);
            else router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-[480px] animate-fade-in border-t-8 border-green-400">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black tracking-tighter text-green-900 uppercase italic mb-2">
                        Kisan<span className="text-green-500">Sahay</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t('identityRegistration')}</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 font-black text-xs flex items-center space-x-3 animate-fade-in">
                        <span className="text-xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2">{t('fullName')}</label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder={t('namePlaceholder')}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2">{t('mobileNumber')}</label>
                        <input
                            type="text"
                            required
                            value={formData.phone_number}
                            onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                            placeholder={t('phonePlaceholder')}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2">{t('password')}</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder={t('passwordPlaceholder')}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2">{t('role')}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['farmer', 'officer', 'admin'] as const).map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.role === role
                                        ? 'bg-green-900 border-green-900 text-white shadow-lg'
                                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-green-200'
                                        }`}
                                >
                                    {t(role)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white font-black py-5 rounded-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-widest text-lg"
                    >
                        {loading ? t('registering') : t('submitRegister')}
                    </button>
                </form>

                <div className="mt-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t('alreadyRegistered')} <Link href="/login" className="text-green-600 hover:text-green-900 transition-colors ml-1 font-black">{t('portalAccess')}</Link>
                </div>
                <div className="mt-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <button
                        onClick={() => { localStorage.removeItem('appLanguage'); router.push('/language-select'); }}
                        className="text-gray-400 hover:text-green-600 transition-colors font-black"
                    >
                        {t('changeLanguage')}
                    </button>
                </div>
            </div>
        </main>
    );
}
