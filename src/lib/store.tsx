"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { Scheme, FarmerApplication, AuditRecord } from '../types';
import { api } from './api';

interface User {
    id: number;
    phone_number: string;
    full_name: string;
    role: string;
}

interface StoreContextType {
    schemes: Scheme[];
    applications: FarmerApplication[];
    auditLogs: AuditRecord[];
    user: User | null;
    token: string | null;
    smsLogs: any[];
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
    addApplication: (app: FarmerApplication) => void;
    addAuditLog: (log: AuditRecord) => void;
    setApplications: (apps: any[]) => void;
    setSchemes: (schemes: any[]) => void;
    activeUploadAppId: string | null;
    setActiveUploadAppId: (id: string | null) => void;
    fetchData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [applications, setApplications] = useState<FarmerApplication[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [smsLogs, setSmsLogs] = useState<any[]>([]);
    const [activeUploadAppId, setActiveUploadAppId] = useState<string | null>(null);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setApplications([]);
        setAuditLogs([]);
        setSmsLogs([]);
        setActiveUploadAppId(null);
    };

    const fetchData = async () => {
        if (!token) return;

        // Fetch Current User
        const userResult = await api.get<User>('/users/me');
        let currentUser = user;
        if (userResult.data) {
            setUser(userResult.data);
            currentUser = userResult.data;
        }

        if (!currentUser) return;

        // Fetch Applications based on role
        const endpoint = (currentUser.role === 'admin' || currentUser.role === 'officer')
            ? '/admin/applications'
            : '/farmer/dashboard';

        const appsResult = await api.get<any[]>(endpoint);
        if (appsResult.data) {
            setApplications(appsResult.data);
        }

        // Fetch SMS Logs if admin
        if (currentUser.role === 'admin') {
            const smsResult = await api.get<any[]>('/admin/sms-logs');
            if (smsResult.data) setSmsLogs(smsResult.data);
        }

        // Fetch Schemes
        const schemesResult = await api.get<any[]>('/schemes');
        if (schemesResult.data) {
            setSchemes(schemesResult.data);
        }
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            setUser(null);
            setApplications([]);
        }
    }, [token]);

    const addApplication = (app: FarmerApplication) => {
        setApplications(prev => [...prev, app]);
    };

    const addAuditLog = (log: AuditRecord) => {
        setAuditLogs(prev => [log, ...prev]);
    };

    return (
        <StoreContext.Provider value={{
            schemes,
            applications,
            auditLogs,
            user,
            token,
            activeUploadAppId,
            smsLogs,
            setToken,
            setUser,
            setActiveUploadAppId,
            fetchData,
            logout,
            addApplication,
            addAuditLog,
            setApplications,
            setSchemes
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
