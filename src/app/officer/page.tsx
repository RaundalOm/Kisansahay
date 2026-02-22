"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { VerificationList } from "@/components/Officer/VerificationList";
import { AuditViewer } from "@/components/Shared/AuditViewer";
import { useStore } from "@/lib/store";

export default function OfficerPortal() {
    const { user, token } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!token) router.push('/login');
        else if (user && user.role !== 'officer' && user.role !== 'admin') router.push('/');
    }, [token, user, router]);
    return (
        <main className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-16 text-center">
                    <div className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] mb-4 border border-green-200 shadow-sm">
                        Verification Workflow
                    </div>
                    <h1 className="text-5xl font-black text-green-900 mb-4 tracking-tighter italic uppercase">Field <span className="text-green-500">Workbench</span></h1>
                    <p className="text-green-800/60 font-bold text-lg max-w-2xl mx-auto">Confirm Physical Authenticity & Finalize Digital Disbursements.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <VerificationList />
                    </div>
                    <div className="lg:col-span-4">
                        <AuditViewer />
                    </div>
                </div>
            </div>
        </main>
    );
}
