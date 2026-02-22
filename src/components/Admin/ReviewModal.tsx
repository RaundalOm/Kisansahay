"use client";

import React, { useState } from 'react';
import { FarmerApplication } from '@/types';
import { api } from '@/lib/api';

interface ReviewModalProps {
    application: FarmerApplication;
    onClose: () => void;
    onUpdate?: () => void;
    readOnly?: boolean;
    title?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ application, onClose, onUpdate, readOnly = false, title = "Application Review" }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusUpdate = async (newStatus: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // The status endpoint expects new_status as a query parameter
            const appId = application.application_id || application.id;
            const { error: apiError } = await api.post(`/admin/applications/${appId}/status?new_status=${newStatus}`, {});
            if (apiError) throw new Error(apiError);
            if (onUpdate) onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const docUrl = (path: string | undefined) => {
        if (!path) return null;
        // The path stored is like "uploads/APP-ID/filename.pdf"
        return `http://127.0.0.1:8000/${path}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 p-10 relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-10">
                    <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                        {title}
                    </div>
                    <h2 className="text-4xl font-black text-green-900 italic uppercase tracking-tighter mb-2">
                        {application.applicant_name || application.name}
                    </h2>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">ID: {application.application_id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Applicant Data</h3>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">Income</span>
                                    <span className="font-black text-green-900">₹{application.income.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">Land Size</span>
                                    <span className="font-black text-green-900">{application.land_size ?? application.landSize} Acres</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-500">Category</span>
                                    <span className="font-black text-green-900">{application.category}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
                                    <span className="font-bold text-gray-900">AI Impact Score</span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-black">{application.impact_score ?? application.impactScore}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">AI Validation Report</h3>
                            <div className={`p-6 rounded-2xl border ${application.ai_validation_status === 'SUCCESS' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${application.ai_validation_status === 'SUCCESS' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                    <span className="font-black text-xs uppercase tracking-widest">{application.ai_validation_status}</span>
                                </div>
                                {application.ai_validation_report?.discrepancies?.map((d, i) => (
                                    <p key={i} className="text-xs font-bold text-amber-700 mb-2">• {d}</p>
                                ))}
                                {(!application.ai_validation_report?.discrepancies || application.ai_validation_report.discrepancies.length === 0) && (
                                    <p className="text-xs font-bold text-green-700">No discrepancies detected by AI engine.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Supporting Documents</h3>
                            <div className="space-y-4">
                                {[
                                    { label: '7/12 Extract', path: application.document_7_12 },
                                    { label: 'Income Certificate', path: application.income_certificate },
                                    { label: 'Ration Card', path: application.ration_card }
                                ].map((doc, i) => (
                                    <div key={i} className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 hover:border-green-400 transition-all hover:shadow-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-xl text-green-600 group-hover:bg-green-50 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <span className="font-bold text-gray-700">{doc.label}</span>
                                        </div>
                                        {doc.path ? (
                                            <a
                                                href={docUrl(doc.path)!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-green-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-colors text-center"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Missing</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl font-bold text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {!readOnly && (
                    <div className="flex gap-4 border-t border-gray-100 pt-10">
                        <button
                            onClick={() => handleStatusUpdate('approved')}
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Approve Application'}
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={isSubmitting}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Reject Application'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
