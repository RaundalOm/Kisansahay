"use client";

import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { createAuditLog } from '@/lib/engines/audit';

export const AllocationControl = () => {
    const { schemes, applications, setApplications, setSchemes, addAuditLog, fetchData } = useStore();
    const scheme = schemes[0];

    const handleAllocation = async () => {
        if (!scheme) return;

        if (Date.now() < scheme.deadline) {
            if (!confirm("The scheme deadline has not passed yet. Triggering allocation early is usually not recommended in real government systems. Proceed anyway for demonstration?")) {
                return;
            }
        }

        try {
            const result = await api.post(`/schemes/${scheme.id}/allocate`, {});
            if (result.error) throw new Error(result.error);

            // Refresh data to see new statuses
            await fetchData();

            addAuditLog(createAuditLog('ALLOCATION_TRIGGERED', 'ADMIN', `Backend allocation processed for ${scheme.title}. Results saved to database.`));
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (!scheme) return null;

    const isDeadlinePassed = Date.now() > scheme.deadline;

    return (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 border-t-8 border-green-600 animate-fade-in">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-black text-green-900 italic uppercase tracking-tighter">Allocation Brain</h2>
                    <p className="text-green-600 font-bold text-sm mt-1">Automated Quota Distribution Engine</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${scheme.allocationDone
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-green-900 text-white border-green-900'
                    }`}>
                    {scheme.allocationDone ? 'Ledger Locked' : 'Active Channel'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Scheme</label>
                    <p className="text-green-900 font-black truncate">{scheme.title}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Quota</label>
                    <p className="text-green-900 font-black">{scheme.totalQuota} Units</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deadline</label>
                    <p className={`font-black ${isDeadlinePassed ? 'text-red-600' : 'text-green-700'}`}>
                        {new Date(scheme.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Network Sync</label>
                    <p className="text-green-700 font-black">{scheme.allocationDone ? 'Finalized' : 'Ready Post-Deadline'}</p>
                </div>
            </div>

            <button
                onClick={handleAllocation}
                disabled={scheme.allocationDone}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 uppercase tracking-widest ${scheme.allocationDone
                        ? 'bg-green-50 text-green-200 cursor-not-allowed shadow-none'
                        : 'bg-green-900 hover:bg-green-800 text-white hover:-translate-y-1'
                    }`}
            >
                {scheme.allocationDone ? '✓ Decisions Cryptographically Locked' : '🚀 Trigger AI Allocation'}
            </button>

            {scheme.allocationDone && (
                <p className="mt-8 text-[10px] text-green-600/60 text-center font-bold uppercase tracking-widest">
                    AI-driven allocation protocol is immutable for this cycle.
                </p>
            )}
        </div>
    );
}
