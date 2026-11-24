import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, Flame, ShieldCheck, Users } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface PlayerLobbyScreenProps {
  onJoined: (profile: UserProfile) => void;
}

export const PlayerLobbyScreen: React.FC<PlayerLobbyScreenProps> = ({ onJoined }) => {
  const [username, setUsername] = useState('');
  const [existingPlayers, setExistingPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authService.listExistingPlayers().then(setExistingPlayers).catch(() => {});
  }, []);

  const handleEnter = async (handleToUse: string) => {
    setError('');
    setLoading(true);
    try {
      const profile = await authService.joinOrSwitchPlayer(handleToUse);
      onJoined(profile);
    } catch (err: any) {
      setError(err.message || 'Could not join lobby.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEnter(username);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40">
            <Flame className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Dareline</h1>
          <p className="mt-1 text-sm text-slate-400">
            Friendly sports dares. Bet Your Ego, Not Your Wallet.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            {isSupabaseConfigured
              ? 'Live Cloud Multiplayer Active: Create a handle on your device and have your friend join with their handle on theirs!'
              : 'Multi-Player Ready: Pick a handle below (or open a second browser tab with another handle) to send friend requests, negotiate dares, and verify punishments.'}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enter Your Player Handle
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
                placeholder="e.g. alex_clutch"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-8 pr-3.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <span>{loading ? 'Joining...' : 'Join as Player'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick-Join Existing Profiles */}
        {existingPlayers.length > 0 && (
          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              Or Tap an Existing Player Profile
            </p>
            <div className="grid grid-cols-2 gap-2">
              {existingPlayers.slice(0, 6).map((p) => (
                <button
                  key={p.uid}
                  type="button"
                  onClick={() => handleEnter(p.username)}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-left transition hover:border-emerald-500/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${p.avatarColor}`}
                    >
                      {p.username.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-xs font-semibold text-white">
                      @{p.username}
                    </span>
                  </div>
                  <span className="ml-1 flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                    <Award className="h-3 w-3" /> {p.daresKept}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
