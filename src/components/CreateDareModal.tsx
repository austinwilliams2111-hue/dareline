import React, { useState } from 'react';
import { AlertTriangle, Flame, ShieldCheck, Sparkles, X } from 'lucide-react';
import { PRESET_DARES } from '../data/mockGames';
import { validateNonMonetaryDare } from '../lib/validation';
import { dareService } from '../services/dareService';
import { Game, UserProfile } from '../types';

interface CreateDareModalProps {
  game: Game;
  currentUser: UserProfile;
  friends: { uid: string; username: string }[];
  onClose: () => void;
  onDareCreated: () => void;
  onNavigateToFriends: () => void;
}

export const CreateDareModal: React.FC<CreateDareModalProps> = ({
  game,
  currentUser,
  friends,
  onClose,
  onDareCreated,
  onNavigateToFriends,
}) => {
  const [selectedFriendId, setSelectedFriendId] = useState(friends[0]?.uid || '');
  const [conditionType, setConditionType] = useState<'winner' | 'total'>('winner');
  const [selectedPick, setSelectedPick] = useState<string>(game.homeTeam.abbr);
  const [dareText, setDareText] = useState(PRESET_DARES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validation = validateNonMonetaryDare(dareText);

  const getSides = () => {
    if (conditionType === 'winner') {
      const challengerSide =
        selectedPick === game.homeTeam.abbr
          ? `${game.homeTeam.name} Wins`
          : `${game.awayTeam.name} Wins`;
      const opponentSide =
        selectedPick === game.homeTeam.abbr
          ? `${game.awayTeam.name} Wins`
          : `${game.homeTeam.name} Wins`;
      return {
        label: 'Matchup Winner',
        challengerSide,
        opponentSide,
      };
    } else {
      const challengerSide = `Over ${game.totalPointsLine} Total Points`;
      const opponentSide = `Under ${game.totalPointsLine} Total Points`;
      return {
        label: `Over/Under ${game.totalPointsLine}`,
        challengerSide: selectedPick === 'OVER' ? challengerSide : opponentSide,
        opponentSide: selectedPick === 'OVER' ? opponentSide : challengerSide,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validation.isValid) return;

    const friend = friends.find((f) => f.uid === selectedFriendId);
    if (!friend) {
      setSubmitError('Please select a friend to challenge.');
      return;
    }

    const sides = getSides();
    setSubmitting(true);
    try {
      await dareService.createDare({
        game,
        challenger: currentUser,
        opponent: friend,
        conditionLabel: sides.label,
        challengerSide: sides.challengerSide,
        opponentSide: sides.opponentSide,
        dareText,
      });
      onDareCreated();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send dare.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {game.league} • {game.awayTeam.abbr} @ {game.homeTeam.abbr}
            </span>
            <h2 className="text-lg font-bold">Challenge a Friend</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {friends.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-300">
              You haven’t added any friends yet! Add a friend first to send a friendly dare.
            </p>
            <button
              onClick={() => {
                onClose();
                onNavigateToFriends();
              }}
              className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Find or Invite Friends
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Pick Opponent
              </label>
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {friends.map((f) => (
                  <option key={f.uid} value={f.uid}>
                    @{f.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                2. Your Prediction
              </label>
              <div className="mb-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConditionType('winner');
                    setSelectedPick(game.homeTeam.abbr);
                  }}
                  className={`rounded-xl py-2 text-xs font-semibold transition ${
                    conditionType === 'winner'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Game Winner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConditionType('total');
                    setSelectedPick('OVER');
                  }}
                  className={`rounded-xl py-2 text-xs font-semibold transition ${
                    conditionType === 'total'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Over / Under ({game.totalPointsLine})
                </button>
              </div>

              {conditionType === 'winner' ? (
                <div className="grid grid-cols-2 gap-2">
                  {[game.awayTeam, game.homeTeam].map((team) => (
                    <button
                      key={team.abbr}
                      type="button"
                      onClick={() => setSelectedPick(team.abbr)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                        selectedPick === team.abbr
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {team.name} Wins
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(['OVER', 'UNDER'] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setSelectedPick(side)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                        selectedPick === side
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {side} {game.totalPointsLine} Points
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  3. The Dare (Zero Money)
                </label>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Anti-Gambling Guardrail Active
                </span>
              </div>

              <textarea
                rows={3}
                value={dareText}
                onChange={(e) => setDareText(e.target.value)}
                placeholder="e.g., Loser wears the rival jersey to coffee tomorrow..."
                className={`w-full rounded-xl border bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                  !validation.isValid && dareText.trim().length > 0
                    ? 'border-amber-500 ring-1 ring-amber-500'
                    : 'border-slate-700 focus:border-emerald-500'
                }`}
              />

              {!validation.isValid && dareText.trim().length > 0 && (
                <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 p-3 text-xs text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-bold text-amber-300">Zero-Money Policy Triggered</p>
                    <p className="mt-0.5 leading-relaxed">{validation.reason}</p>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <Sparkles className="h-3 w-3 text-emerald-400" /> Quick Safe Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DARES.slice(0, 4).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDareText(preset)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-left text-[11px] text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={!validation.isValid || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Flame className="h-4 w-4" />
              <span>{submitting ? 'Sending Dare...' : 'Send Friendly Dare'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
