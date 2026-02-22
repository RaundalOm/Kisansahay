"use client";

import { useStore } from '@/lib/store';

export const AuditViewer = () => {
    const { auditLogs } = useStore();

    return (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 h-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black text-green-900 italic uppercase tracking-tighter">Secure Audit Trail</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Immutable Network Ledger</p>
                </div>
                <div className="bg-green-900 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-900 shadow-lg">
                    Verified Sync
                </div>
            </div>

            <div className="space-y-4">
                {auditLogs.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <div className="text-5xl mb-4">🛡️</div>
                        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">No entries in secure ledger</p>
                    </div>
                ) : (
                    [...auditLogs].reverse().map(log => (
                        <div key={log.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-green-700 font-black text-xs uppercase tracking-widest group-hover:text-green-500 transition-colors">@{log.actor}</span>
                                <span className="text-[10px] font-bold text-gray-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <strong className="text-green-900 font-black text-sm uppercase tracking-tighter italic">
                                    {log.action.replace('_', ' ')}
                                </strong>
                                <p className="text-gray-500 font-bold text-xs leading-relaxed">
                                    <span className="text-green-500 mr-2">→</span> {log.details}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
