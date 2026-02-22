"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

const DISTRICTS = ['Pune', 'Nagpur', 'Nashik'];
const CATEGORIES = ['General', 'SC', 'ST'];

export const ApplicationForm = () => {
    const router = useRouter();
    const { token, fetchData, activeUploadAppId, setActiveUploadAppId } = useStore();

    type Step = 'DETAILS' | 'SCHEME_SELECTION' | 'UPLOADS';
    const [step, setStep] = useState<Step>('DETAILS');

    const [formData, setFormData] = useState({
        scheme_id: '',
        name: '',
        aadhaar: '',
        income: '',
        landSize: '',
        district: DISTRICTS[0],
        category: CATEGORIES[0],
    });

    const [eligibleSchemes, setEligibleSchemes] = useState<any[]>([]);
    const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        doc_7_12: null,
        income_cert: null,
        ration_card: null
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle detached upload trigger
    useEffect(() => {
        if (activeUploadAppId) {
            setSubmittedAppId(activeUploadAppId);
            setStep('UPLOADS');
            setMessage(null);
            // Scroll to form
            const formElement = document.getElementById('application-form-root');
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeUploadAppId]);

    if (!token) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center border-t-8 border-red-500 animate-fade-in">
                <h3 className="text-2xl font-black text-red-600 mb-4">Authentication Required</h3>
                <p className="text-gray-600 font-medium mb-8">Please login to securely apply for government schemes.</p>
                <button
                    onClick={() => router.push('/login')}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95"
                >
                    Go to Secure Login
                </button>
            </div>
        );
    }

    const handleCheckEligibility = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await api.post<any[]>('/schemes/eligible', {
                income: Number(formData.income),
                land_size: Number(formData.landSize),
                district: formData.district,
                category: formData.category
            });

            if (res.data) {
                setEligibleSchemes(res.data);
                if (res.data.length > 0) {
                    setStep('SCHEME_SELECTION');
                } else {
                    setMessage({ type: 'error', text: 'No schemes found matching your criteria. Please check your details.' });
                }
            } else if (res.error) {
                setMessage({ type: 'error', text: res.error });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Eligibility check failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (schemeId: string) => {
        setLoading(true);
        try {
            const res = await api.post<any>(`/apply/${schemeId}`, {
                scheme_id: Number(schemeId),
                applicant_name: formData.name,
                aadhaar_number: formData.aadhaar,
                income: Number(formData.income),
                land_size: Number(formData.landSize),
                district: formData.district,
                category: formData.category
            });

            if (res.data) {
                setSubmittedAppId(res.data.application_id);
                setStep('UPLOADS');
                setMessage({ type: 'success', text: 'Registration successful! Please upload documents below.' });
                if (fetchData) fetchData();
            } else if (res.error) {
                setMessage({ type: 'error', text: res.error });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Application failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submittedAppId) return;
        setLoading(true);

        try {
            const uploadData = new FormData();
            if (files.doc_7_12) uploadData.append('doc_7_12', files.doc_7_12);
            if (files.income_cert) uploadData.append('income_cert', files.income_cert);
            if (files.ration_card) uploadData.append('ration_card', files.ration_card);

            const result = await api.upload(`/applications/${submittedAppId}/upload`, uploadData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Documents verified! Application complete.' });
                setSubmittedAppId(null);
                setStep('DETAILS');
                setFormData({
                    ...formData,
                    scheme_id: '',
                    name: '',
                    aadhaar: '',
                    income: '',
                    landSize: '',
                });
                setFiles({ doc_7_12: null, income_cert: null, ration_card: null });
                setActiveUploadAppId(null); // Clear the trigger
                if (fetchData) fetchData();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="application-form-root" className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 animate-fade-in relative overflow-hidden">
            {/* Visual Header Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>

            <div className="mb-8">
                <div className="flex items-center space-x-4 mb-2">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">
                        {step === 'DETAILS' ? '1' : step === 'SCHEME_SELECTION' ? '2' : '3'}
                    </div>
                    <h2 className="text-3xl font-black text-green-900 italic uppercase tracking-tighter">
                        {step === 'DETAILS' ? 'Check Eligibility' : step === 'SCHEME_SELECTION' ? 'Select Scheme' : 'Documentation'}
                    </h2>
                </div>
                <p className="text-gray-500 font-bold border-l-4 border-green-500 pl-4">
                    {step === 'DETAILS' ? 'Enter your profile to find matching support.' :
                        step === 'SCHEME_SELECTION' ? `Found ${eligibleSchemes.length} matching programs.` :
                            `Application ID: #${submittedAppId}`}
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 font-bold border-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
            )}

            {step === 'DETAILS' && (
                <form onSubmit={handleCheckEligibility} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Full Name (As per Aadhaar)</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Aadhaar Number</label>
                        <input
                            type="text"
                            required
                            pattern="\d{12}"
                            value={formData.aadhaar}
                            onChange={e => setFormData({ ...formData, aadhaar: e.target.value })}
                            placeholder="0000 0000 0000"
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none tracking-widest"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Annual Income (₹)</label>
                        <input
                            type="number"
                            required
                            value={formData.income}
                            onChange={e => setFormData({ ...formData, income: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Land Size (Acres)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.landSize}
                            onChange={e => setFormData({ ...formData, landSize: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">District</label>
                        <select
                            required
                            value={formData.district}
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl focus:border-green-500 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                        >
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Category</label>
                        <div className="grid grid-cols-3 gap-4">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`p-4 rounded-xl font-black transition-all ${formData.category === cat ? 'bg-green-900 text-white shadow-lg' : 'bg-gray-50 text-gray-500 border-2 border-gray-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-900 hover:bg-green-800 text-white font-black py-5 rounded-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-lg"
                        >
                            {loading ? 'Analyzing Profile...' : 'Find Eligible Schemes'}
                        </button>
                    </div>
                </form>
            )}

            {step === 'SCHEME_SELECTION' && (
                <div className="space-y-4">
                    {eligibleSchemes.map(scheme => (
                        <div key={scheme.id} className="p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all bg-white group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-green-900 uppercase tracking-tight group-hover:text-green-600 transition-colors">{scheme.title}</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-1">{scheme.eligibility_criteria}</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                                    Eligible
                                </div>
                            </div>
                            <p className="text-gray-600 font-medium mb-6 line-clamp-2">{scheme.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleApply(scheme.id)}
                                    disabled={loading}
                                    className="bg-green-900 hover:bg-green-800 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-widest"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setStep('DETAILS')}
                        className="w-full text-center py-4 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-green-900 transition-colors"
                    >
                        ← Back to Details
                    </button>
                </div>
            )}

            {step === 'UPLOADS' && (
                <form onSubmit={handleFileUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-green-800 uppercase tracking-widest mb-2">7/12 Extract Document (PNG/JPG)</label>
                        <input
                            type="file"
                            onChange={e => setFiles({ ...files, doc_7_12: e.target.files?.[0] || null })}
                            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-2xl focus:border-green-500 transition-all font-bold text-gray-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-green-800 uppercase tracking-widest mb-2">Income Certificate</label>
                            <input
                                type="file"
                                onChange={e => setFiles({ ...files, income_cert: e.target.files?.[0] || null })}
                                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-xl focus:border-green-500 transition-all font-bold text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-green-800 uppercase tracking-widest mb-2">Ration Card</label>
                            <input
                                type="file"
                                onChange={e => setFiles({ ...files, ration_card: e.target.files?.[0] || null })}
                                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-xl focus:border-green-500 transition-all font-bold text-gray-500"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-900 hover:bg-green-800 text-white font-black py-5 rounded-xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-lg"
                        >
                            {loading ? 'Verifying Documents...' : 'Finalize Digital Submission'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep('DETAILS');
                                setSubmittedAppId(null);
                                setActiveUploadAppId(null);
                                setMessage({ type: 'error', text: 'Application paused. You can complete it later from the Status Tracker.' });
                            }}
                            className="w-full text-center py-2 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-green-900 transition-colors"
                        >
                            Pause & Complete Later
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
