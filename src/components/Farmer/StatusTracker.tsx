import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ReviewModal } from '@/components/Admin/ReviewModal';
import { FarmerApplication } from '@/types';

export const StatusTracker = () => {
    const { applications, setActiveUploadAppId } = useStore();
    const [selectedApp, setSelectedApp] = useState<FarmerApplication | null>(null);

    return (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-green-900 italic uppercase tracking-tighter">Track Your Status</h2>
                <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-black text-xs border border-green-200 uppercase tracking-widest">
                    {applications.length} Active Requests
                </div>
            </div>

            <div className="space-y-6">
                {applications.length === 0 ? (
                    <div className="text-center py-16 opacity-40">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="font-bold text-gray-500 max-w-[200px] mx-auto text-sm">No active applications found in our network.</p>
                    </div>
                ) : (
                    applications.map((app: any) => (
                        <div key={app.application_id || app.id} className="p-6 rounded-2xl border-l-8 transition-all hover:bg-gray-50 bg-white shadow-sm border border-gray-100" style={{
                            borderLeftColor: app.status.toUpperCase() === 'APPROVED' ? '#16a34a' :
                                app.status.toUpperCase() === 'REJECTED' ? '#dc2626' :
                                    app.status.toUpperCase() === 'PROVISIONALLY_APPROVED' ? '#d97706' :
                                        '#064e3b'
                        }}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-green-900 font-black text-lg">#{app.application_id}</span>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        AI: {app.ai_validation_status?.replace('_', ' ') || 'QUEUED'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${app.status.toUpperCase() === 'APPROVED' ? 'bg-green-500 text-white' :
                                        app.status.toUpperCase() === 'REJECTED' ? 'bg-red-500 text-white' :
                                            'bg-green-900 text-white'
                                        }`}>
                                        {app.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-gray-900 font-extrabold text-lg leading-tight">
                                    {app.scheme_title || 'Agricultural Support Plan'}
                                </h4>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400">
                                        📅 {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date Pending'}
                                    </p>
                                    <div className="flex space-x-2">
                                        {app.ai_validation_status === 'PENDING' && (
                                            <button
                                                onClick={() => {
                                                    setActiveUploadAppId(app.application_id);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="text-[10px] font-black text-white uppercase tracking-widest bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Complete Upload
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="text-[10px] font-black text-green-700 uppercase tracking-widest hover:text-green-900 transition-colors bg-green-50 px-3 py-1 rounded-md"
                                        >
                                            View Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedApp && (
                <ReviewModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    readOnly={true}
                    title="Application Details"
                />
            )}
        </div>
    );
};
