"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ApplicationForm } from "@/components/Farmer/ApplicationForm";
import { StatusTracker } from "@/components/Farmer/StatusTracker";
import { useStore } from "@/lib/store";
import { ArrowRight, CheckCircle, Users, Sprout, Landmark, ShieldCheck, History, ListChecks } from "lucide-react";

export default function FarmerPortal() {
  const router = useRouter();
  const { token, user } = useStore();

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'officer') router.push('/officer');
    }
  }, [token, user, router]);

  if (token) {
    return (
      <main className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-green-900 mb-2">Farmer Support Portal</h1>
            <p className="text-lg text-gray-600 font-medium">Transparent, AI-driven scheme allocation for a better agricultural future.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <ApplicationForm />
            </div>
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-t-8 border-green-600 transform transition-all hover:scale-[1.02]">
                <div className="flex items-center space-x-3 mb-4">
                  <Landmark className="text-green-600" size={28} />
                  <h3 className="text-xl font-bold text-green-900">Active High-Priority Scheme</h3>
                </div>
                <p className="text-gray-900 font-extrabold text-lg mb-2">PM-Kisan Vulnerable Support 2026</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                  Direct financial aid targeted at small-scale farmers. Focused quotas available for verified SC/ST categories to ensure equitable distribution.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-bold text-green-700 bg-green-50 p-2 rounded-lg">
                    <CheckCircle size={16} />
                    <span>Annual Income ≤ ₹2,00,000</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm font-bold text-green-700 bg-green-50 p-2 rounded-lg">
                    <CheckCircle size={16} />
                    <span>Total Land Holding ≤ 5 Acres</span>
                  </div>
                </div>
              </div>
              <StatusTracker />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef"
          alt="Green Fields"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow"
        />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-6xl font-black mb-6 leading-tight tracking-tight">
              AI-Based Government <br /><span className="text-green-400 font-black">Scheme Allocation</span>
            </h1>
            <p className="text-2xl mb-10 text-gray-100 font-medium">
              A fair, transparent, and fully automated system ensuring government benefits reach the most deserving farmers first.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-xl font-black text-xl flex items-center space-x-3 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                <span>Apply Now (Farmer Portal)</span>
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-900 text-white py-20 relative z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
            <div className="space-y-4">
              <div className="text-5xl font-black text-green-400">10K+</div>
              <div className="text-lg font-bold opacity-80 uppercase tracking-widest">Farmers Registered</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-black text-green-400">200+</div>
              <div className="text-lg font-bold opacity-80 uppercase tracking-widest">Schemes Distributed</div>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-black text-green-400">50+</div>
              <div className="text-lg font-bold opacity-80 uppercase tracking-widest">Districts Covered</div>
            </div>
            <div className="space-y-4 flex flex-col items-center">
              <ShieldCheck size={48} className="text-green-400 mb-2" />
              <div className="text-lg font-bold opacity-80 uppercase tracking-widest">AI Powered Selection</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black text-center text-green-900 mb-20 uppercase tracking-tighter italic">How the System Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "1. Farmer Applies", desc: "Farmers securely register and enter land size, income, and district details.", icon: Users },
              { title: "2. Eligibility check", desc: "Our AI engine instantly cross-references data with scheme requirements.", icon: ListChecks },
              { title: "3. AI Ranking", desc: "Vulnerability scoring ensures focus on small-scale and high-need farmers.", icon: Sprout },
              { title: "4. Allocation", desc: "Fair distribution based on merit, quota, and reservation compliance.", icon: Landmark },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-green-500 hover:-translate-y-4 transition-all duration-300">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                  <step.icon size={32} />
                </div>
                <h3 className="font-black text-2xl text-green-900 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-green-50 p-10 rounded-3xl border border-green-100">
              <ShieldCheck size={40} className="text-green-600 mb-6" />
              <h3 className="text-2xl font-black text-green-900 mb-4">Tamper Proof Selection</h3>
              <p className="text-gray-700 font-medium">Allocation protocols are mathematically locked to prevent political bias or administrative tampering.</p>
            </div>
            <div className="bg-green-50 p-10 rounded-3xl border border-green-100">
              <History size={40} className="text-green-600 mb-6" />
              <h3 className="text-2xl font-black text-green-900 mb-4">Audit Transparency</h3>
              <p className="text-gray-700 font-medium">Full audit logs for every decision made by the AI, accessible to verification officers in real-time.</p>
            </div>
            <div className="bg-green-50 p-10 rounded-3xl border border-green-100">
              <ListChecks size={40} className="text-green-600 mb-6" />
              <h3 className="text-2xl font-black text-green-900 mb-4">Waitlist Automation</h3>
              <p className="text-gray-700 font-medium">If an allocated farmer fails verification, the next highest-ranked eligible candidate is instantly promoted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12 border-t border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center opacity-80 font-bold uppercase tracking-widest text-sm text-center md:text-left gap-6">
          <div>Smart AgriAI | Next-Gen Farmer Support Ecosystem</div>
          <div>© 2026 Government Welfare Division | Hackathon Edition</div>
        </div>
      </footer>
    </main>
  );
}
