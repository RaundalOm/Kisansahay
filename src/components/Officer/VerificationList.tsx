"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { createAuditLog } from '@/lib/engines/audit';
import { FarmerApplication } from '@/types';
import { ReviewModal } from '@/components/Admin/ReviewModal';

export const VerificationList = () => {
    const { applications, addAuditLog, fetchData } = useStore();
    const [selectedApp, setSelectedApp] = useState<FarmerApplication | null>(null);

    const queuedReviews = applications.filter(a => {
        const s = a.status.toUpperCase();
        const hasDocs = a.document_7_12 || a.income_certificate || a.ration_card;
        return (s === 'PROVISIONALLY_APPROVED' || s === 'PENDING') && hasDocs;
    });

    const handleVerify = async (app: FarmerApplication, isValid: boolean) => {
        try {
            const newStatus = isValid ? 'approved' : 'rejected';
            const result = await api.post(`/admin/applications/${app.application_id || app.id}/status?new_status=${newStatus}`, {});

            if (result.error) throw new Error(result.error);

            await fetchData();

            addAuditLog(createAuditLog(
                isValid ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
                'OFFICER',
                `Officer ${newStatus} application ${app.application_id || app.id}. Backend handled promotions.`
            ));

            if (!isValid) {
                alert("Verification failed. Waitlist candidate promoted.");
            } else {
                alert("Farmer officially approved!");
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-3xl font-black text-green-900 italic uppercase tracking-tighter">Officer Workbench</h2>
                    <p className="text-green-600/60 font-bold text-sm mt-1">Review & Authenticate Provisional Allocations</p>
                </div>
                <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-black text-[10px] border border-green-200 uppercase tracking-widest shadow-sm">
                    {queuedReviews.length} ACTIVE REVIEWS
                </div>
            </div>

            {queuedReviews.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="text-6xl mb-6">✨</div>
                    <p className="text-green-900 font-black text-xl italic uppercase tracking-tighter">
                        Pipeline Fully Cleared
                    </p>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">
                        Waitlist automated processing active
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Applicant Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Region</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Impact</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI Verdict</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {queuedReviews.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-green-900">{app.applicant_name || app.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{app.category} Quota</div>
                                            <span className="bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded text-[8px] uppercase tracking-tighter shadow-sm border border-blue-200">
                                                Ready for Review
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-gray-500">{app.district}</td>
                                    <td className="px-8 py-6">
                                        <span className="bg-green-900 text-white font-black px-3 py-1 rounded-md text-[10px] shadow-md">
                                            {app.impact_score ?? app.impactScore}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${app.ai_validation_status === 'VALID' ? 'text-green-600' : 'text-orange-500'
                                                }`}>
                                                {app.ai_validation_status || 'QUEUED'}
                                            </span>
                                            {app.ai_validation_report?.confidence_score && (
                                                <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                                    Confidence: <span className="text-green-500">{(app.ai_validation_report.confidence_score * 100).toFixed(0)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="bg-green-100 text-green-700 hover:bg-green-900 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                Review File
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedApp && (
                <ReviewModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={() => fetchData && fetchData()}
                    title="Officer Verification Workbench"
                />
            )}
        </div>
    );
};
