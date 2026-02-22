"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/useLanguage';

const LANGUAGES = [
    { code: 'en', nativeName: 'English', region: 'English', flag: '🇬🇧' },
    { code: 'hi', nativeName: 'हिन्दी', region: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', nativeName: 'मराठी', region: 'Marathi', flag: '🌾' },
    { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjabi', flag: '🌾' },
    { code: 'gu', nativeName: 'ગુજરાતી', region: 'Gujarati', flag: '🌾' },
    { code: 'bn', nativeName: 'বাংলা', region: 'Bengali', flag: '🌾' },
    { code: 'te', nativeName: 'తెలుగు', region: 'Telugu', flag: '🌾' },
    { code: 'ta', nativeName: 'தமிழ்', region: 'Tamil', flag: '🌾' },
    { code: 'kn', nativeName: 'ಕನ್ನಡ', region: 'Kannada', flag: '🌾' },
    { code: 'ml', nativeName: 'മലയാളം', region: 'Malayalam', flag: '🌾' },
    { code: 'or', nativeName: 'ଓଡ଼ିଆ', region: 'Odia', flag: '🌾' },
    { code: 'ur', nativeName: 'اردو', region: 'Urdu', flag: '🌾' },
];

export default function LanguageSelectPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selected, setSelected] = useState<string | null>(null);
    const [hovering, setHovering] = useState<string | null>(null);

    const handleSelect = (code: string) => {
        setSelected(code);
        localStorage.setItem('appLanguage', code);
        // Short delay so the user sees the selection animate before navigating
        setTimeout(() => router.push('/register'), 350);
    };

    return (
        <main style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>

            {/* Logo / Branding */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌾</div>
                <h1 style={{
                    color: '#ffffff',
                    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    margin: 0,
                }}>
                    Kisan <span style={{ color: '#4ade80' }}>Sahay</span>
                </h1>
                <p style={{
                    color: '#86efac',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginTop: '0.3rem',
                }}>
                    Farmer Support System
                </p>
            </div>

            {/* Card */}
            <div style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '2rem',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '640px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        color: '#ffffff',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        margin: '0 0 0.4rem 0',
                    }}>
                        {t('chooseLanguage')}
                    </h2>
                    <p style={{ color: '#a7f3d0', fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>
                        अपनी भाषा चुनें · ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ · మీ భాష ఎంచుకోండి
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.85rem',
                }}>
                    {LANGUAGES.map((lang) => {
                        const isSelected = selected === lang.code;
                        const isHovered = hovering === lang.code;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                onMouseEnter={() => setHovering(lang.code)}
                                onMouseLeave={() => setHovering(null)}
                                style={{
                                    background: isSelected
                                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                        : isHovered
                                            ? 'rgba(255,255,255,0.15)'
                                            : 'rgba(255,255,255,0.08)',
                                    border: isSelected
                                        ? '2px solid #4ade80'
                                        : isHovered
                                            ? '2px solid rgba(255,255,255,0.4)'
                                            : '2px solid rgba(255,255,255,0.1)',
                                    borderRadius: '1rem',
                                    padding: '1rem 0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    transform: isSelected
                                        ? 'scale(1.06)'
                                        : isHovered
                                            ? 'translateY(-3px) scale(1.02)'
                                            : 'scale(1)',
                                    boxShadow: isSelected
                                        ? '0 0 0 4px rgba(74,222,128,0.25), 0 8px 24px rgba(0,0,0,0.3)'
                                        : isHovered
                                            ? '0 8px 24px rgba(0,0,0,0.25)'
                                            : 'none',
                                }}
                            >
                                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                                    {isSelected ? '✅' : lang.flag}
                                </span>
                                <span style={{
                                    color: '#ffffff',
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    textAlign: 'center',
                                }}>
                                    {lang.nativeName}
                                </span>
                                <span style={{
                                    color: isSelected ? '#bbf7d0' : '#6ee7b7',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    {lang.region}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <p style={{
                    textAlign: 'center',
                    color: '#6ee7b7',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    marginTop: '1.75rem',
                    letterSpacing: '0.05em',
                    opacity: 0.7,
                }}>
                    {t('languageNote')}
                </p>
            </div>
        </main>
    );
}
