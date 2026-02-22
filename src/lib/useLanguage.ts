"use client";
import { useState, useEffect } from 'react';
import { LangCode, t } from './i18n';

export function useLanguage() {
    const [lang, setLang] = useState<LangCode>('en');

    useEffect(() => {
        const saved = localStorage.getItem('appLanguage') as LangCode | null;
        if (saved) setLang(saved);
    }, []);

    return { lang, t: (key: string) => t(lang, key) };
}
