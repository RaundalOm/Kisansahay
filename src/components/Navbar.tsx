"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut, Home, Shield, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { token, user, logout } = useStore();
    const { t } = useLanguage();

    const allLinks = [
        { nameKey: 'portal', href: '/', icon: Home, roles: ['farmer', 'admin', 'officer'] },
        { nameKey: 'admin', href: '/admin', icon: Shield, roles: ['admin'] },
        { nameKey: 'officer', href: '/officer', icon: LayoutDashboard, roles: ['officer', 'admin'] },
    ];

    const links = allLinks.filter(link => !user || link.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="bg-green-900 text-white shadow-xl relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 no-underline">
                            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                                Kisan<span className="text-green-400">Sahay</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {token && links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-bold transition-all no-underline ${pathname === link.href
                                    ? 'bg-green-800 text-white ring-1 ring-green-400'
                                    : 'text-green-100 hover:bg-green-800 hover:text-white'
                                    }`}
                            >
                                <link.icon size={16} />
                                <span>{t(link.nameKey)}</span>
                            </Link>
                        ))}

                        {!token ? (
                            <div className="flex space-x-4">
                                <Link href="/login" className="bg-white text-green-900 px-6 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors no-underline">
                                    {t('portalLogin')}
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
                            >
                                <LogOut size={16} />
                                <span>{t('logout')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
