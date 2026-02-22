"use client";

import { useStore } from '@/lib/store';
import { MessageSquare, Phone, Clock } from 'lucide-react';

export const SMSHistory = () => {
    const { smsLogs } = useStore();

    return (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 h-full animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black text-green-900 italic uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-green-500" />
                        Communication Hub
                    </h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time SMS Gateway Logs</p>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-200 shadow-sm">
                    {smsLogs.length} Outbound
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {smsLogs.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <div className="text-5xl mb-4">💬</div>
                        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">No messages transmitted</p>
                    </div>
                ) : (
                    smsLogs.map((log: any) => (
                        <div key={log.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-green-500" />
                                    <span className="text-green-900 font-black text-sm tracking-tight">{log.phone_number}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.sent_at).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-gray-600 font-medium text-xs leading-relaxed italic">
                                    "{log.message}"
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
