"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "worker" | "company" | null;

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<Role>(null);
  const [displayName, setDisplayName] = useState("");

  // Worker fields
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [isHiring, setIsHiring] = useState(true);

  const handleNext = () => {
    if (step === 1 && !role) {
      setError("Please select a role to continue");
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      role,
      displayName,
      ...(role === "company"
        ? { companyInfo: { companyName, isHiring } }
        : { workerInfo: { skills: skills.split(",").map(s => s.trim()), yearsExperience: parseInt(experience, 10) || 0 } }
      )
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/app");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong saving your profile.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100 relative">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? "Role Selection" : "Profile Details"}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome to BlindMerge</h2>
            <p className="text-slate-500 mt-2">How do you plan to use our platform?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => { setRole("worker"); setError(null); }}
              className={`p-6 rounded-xl border-2 text-left transition-all ${role === "worker" ? "border-indigo-600 bg-indigo-50 scale-[1.02]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">I am a Professional</h3>
              <p className="text-sm text-slate-500">I want to showcase my skills and find great companies to work with.</p>
            </button>

            <button
              onClick={() => { setRole("company"); setError(null); }}
              className={`p-6 rounded-xl border-2 text-left transition-all ${role === "company" ? "border-indigo-600 bg-indigo-50 scale-[1.02]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">I am a Company</h3>
              <p className="text-sm text-slate-500">I want to discover talented professionals and hire the best fit.</p>
            </button>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-indigo-100"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tell us about yourself</h2>
            <p className="text-slate-500 mt-2">Just a few more details to complete your profile.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name (Optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Leave blank to use your Google account info.</p>
            </div>

            {role === "worker" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Skills <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Next.js, Node, Firebase"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Separate skills with commas.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </>
            )}

            {role === "company" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50 mt-2">
                  <input
                    type="checkbox"
                    id="isHiring"
                    checked={isHiring}
                    onChange={(e) => setIsHiring(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="isHiring" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                    We are actively hiring
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all focus:ring-4 focus:ring-indigo-100 disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
