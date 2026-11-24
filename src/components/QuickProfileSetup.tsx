import React, { useState } from 'react';
import { ArrowRight, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface QuickProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export const QuickProfileSetup: React.FC<QuickProfileSetupProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleStart = (chosenName: string) => {
    setError('');
    try {
      const profile = authService.createDemoProfile(chosenName);
      onComplete(profile);
    } catch (err: any) {
      setError(err.message || 'Please enter a valid display handle.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStart(username);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40">
            <Flame className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Dareline</h1>
          <p className="mt-1 text-sm text-slate-400">
            All the thrill of live sports banter. Zero money on the line.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Interactive Demo: No email or password needed. Pick a handle to jump right in.</span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Choose a Display Handle
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="clutch_fan"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-8 pr-3.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            <span>Enter Dareline</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-5 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={() => handleStart('sports_fan_demo')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>1-Click Instant Demo (@sports_fan_demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
