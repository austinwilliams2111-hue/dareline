import React from 'react';
import { Award, Flame, Globe, Monitor, Repeat, Trophy, Users } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

export type ActiveTab = 'games' | 'dares' | 'friends';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  actionRequiredDaresCount: number;
  pendingFriendsCount: number;
  onSwitchPlayer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  actionRequiredDaresCount,
  pendingFriendsCount,
  onSwitchPlayer,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand + Multiplayer Mode Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('games')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Dareline</span>
            </div>
          </button>

          {isSupabaseConfigured ? (
            <span
              title="Connected to Supabase Realtime for cross-device multiplayer"
              className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/30 sm:inline-flex"
            >
              <Globe className="h-3 w-3" /> Live Cloud Multiplayer
            </span>
          ) : (
            <span
              title="Open another browser tab to test real-time two-player dares!"
              className="hidden items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-sky-500/30 sm:inline-flex"
            >
              <Monitor className="h-3 w-3" /> Multi-Tab Sync Ready
            </span>
          )}
        </div>

        {/* 3 Core Views Navigation */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 ring-1 ring-slate-800">
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'games'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Live Games</span>
          </button>

          <button
            onClick={() => setActiveTab('dares')}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'dares'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>My Dares</span>
            {actionRequiredDaresCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-xs font-bold ${
                  activeTab === 'dares'
                    ? 'bg-slate-950 text-emerald-400'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {actionRequiredDaresCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              activeTab === 'friends'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Friends</span>
            {pendingFriendsCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-xs font-bold ${
                  activeTab === 'friends'
                    ? 'bg-slate-950 text-emerald-400'
                    : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {pendingFriendsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Active Player Pill & Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 ring-1 ring-slate-800 md:flex">
            <Award className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">@{user.username}</span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
              {user.daresKept} Kept
            </span>
          </div>
          <button
            onClick={onSwitchPlayer}
            title="Switch Player Handle"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <Repeat className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Switch Player</span>
          </button>
        </div>
      </div>
    </header>
  );
};
