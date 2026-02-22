"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AllocationControl } from "@/components/Admin/AllocationControl";
import { AuditViewer } from "@/components/Shared/AuditViewer";
import { SMSHistory } from "@/components/Admin/SMSHistory";
import { ReviewModal } from "@/components/Admin/ReviewModal";
import { useStore } from "@/lib/store";
import { FarmerApplication } from "@/types";

export default function AdminDashboard() {
    const { applications, fetchData, user, token } = useStore();
    const router = useRouter();
    const [selectedApp, setSelectedApp] = useState<FarmerApplication | null>(null);

    useEffect(() => {
        if (!token) router.push('/login');
        else if (user && user.role !== 'admin') router.push('/');
    }, [token, user, router]);

    return (
        <main className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* ... existing header ... */}
                <header className="mb-16 text-center">
                    <div className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] mb-4 border border-green-200 shadow-sm">
                        Oversight & Governance
                    </div>
                    <h1 className="text-5xl font-black text-green-900 mb-4 tracking-tighter italic uppercase">Administrative <span className="text-green-500">Console</span></h1>
                    <p className="text-green-800/60 font-bold text-lg max-w-2xl mx-auto">AI-Assisted Quota Management & Verification Workflow Management.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-10">
                        <AllocationControl />
                        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 border-t-8 border-green-400 transform transition-all hover:scale-[1.02]">
                            <h3 className="text-2xl font-black text-green-900 mb-8 italic uppercase tracking-tighter">Network Vitals</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Active Applicants</span>
                                    <strong className="text-green-900 text-2xl font-black">{applications.length}</strong>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Pending Review</span>
                                    <strong className="text-green-600 text-2xl font-black">{applications.filter(a => a.status === 'PENDING').length}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Total Allocations</span>
                                    <strong className="text-green-900 text-2xl font-black">{applications.filter(a => a.status === 'PROVISIONALLY_APPROVED' || a.status === 'APPROVED').length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-10">
                        <AuditViewer />
                        <SMSHistory />
                    </div>
                </div>

                <div className="mt-16 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                    <div className="p-8 bg-green-900 flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Master Application Ledger</h2>
                        <div className="bg-white/10 px-4 py-2 rounded-lg text-green-100 font-bold text-xs uppercase tracking-widest">
                            Real-time Sync Active
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Farmer Identity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Region</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Impact Score</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Income (₹)</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Network Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-green-900">{app.applicant_name || app.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{app.category} Quota</div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-500">{app.district}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-md text-xs border border-green-200">
                                                {app.impact_score ?? app.impactScore}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-green-900">₹{app.income.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${app.status.toUpperCase() === 'APPROVED' ? 'bg-green-500 text-white' :
                                                app.status.toUpperCase() === 'REJECTED' ? 'bg-red-500 text-white' :
                                                    'bg-green-900 text-white'
                                                }`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="bg-green-100 text-green-700 hover:bg-green-900 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedApp && (
                <ReviewModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={() => fetchData && fetchData()}
                />
            )}
        </main>
    );
}
