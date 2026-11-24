import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Swords,
  ThumbsDown,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import { validateNonMonetaryDare } from '../lib/validation';
import { dareService } from '../services/dareService';
import { Dare, Game, UserProfile } from '../types';

interface DaresDashboardProps {
  currentUser: UserProfile;
  dares: Dare[];
  games: Game[];
  onRefresh: () => void;
}

export const DaresDashboard: React.FC<DaresDashboardProps> = ({
  currentUser,
  dares,
  games,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'pending' | 'active' | 'completed'>('pending');

  // Counter-dare negotiation state
  const [counteringDareId, setCounteringDareId] = useState<string | null>(null);
  const [counterText, setCounterText] = useState('');

  // Punishment proof submission state
  const [proofDareId, setProofDareId] = useState<string | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingDares = dares.filter((d) => d.status === 'pending');
  const activeDares = dares.filter(
    (d) => d.status === 'active' || d.status === 'proof_submitted'
  );
  const completedDares = dares.filter((d) => d.status === 'completed');

  const displayedDares =
    subTab === 'pending'
      ? pendingDares
      : subTab === 'active'
      ? activeDares
      : completedDares;

  const counterValidation = validateNonMonetaryDare(counterText);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAccept = async (dareId: string) => {
    setBusyId(dareId);
    try {
      await dareService.acceptDare(dareId);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (dareId: string) => {
    setBusyId(dareId);
    try {
      await dareService.declineDare(dareId);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleCounterSubmit = async (dare: Dare) => {
    if (!counterValidation.isValid) return;
    setBusyId(dare.id);
    try {
      await dareService.submitCounterDare(dare, currentUser, counterText);
      setCounteringDareId(null);
      setCounterText('');
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDeclareLoser = async (
    dare: Dare,
    loser: { uid: string; username: string }
  ) => {
    setBusyId(dare.id);
    try {
      await dareService.declareLoser(dare, loser);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmitProof = async (dare: Dare) => {
    setBusyId(dare.id);
    try {
      await dareService.submitPunishmentProof({
        dare,
        loser: currentUser,
        proofText,
        proofImageUrl,
      });
      // If playing against a seeded bot, auto-verify so single-player testing also completes smoothly
      const opponentId =
        dare.challengerId === currentUser.uid ? dare.opponentId : dare.challengerId;
      if (opponentId.startsWith('bot-')) {
        await dareService.verifyAndAwardBadge({
          ...dare,
          loserId: currentUser.uid,
          loserUsername: currentUser.username,
        });
        setSubTab('completed');
      }
      setProofDareId(null);
      setProofText('');
      setProofImageUrl('');
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleVerifyProof = async (dare: Dare) => {
    setBusyId(dare.id);
    try {
      await dareService.verifyAndAwardBadge(dare);
      onRefresh();
      setSubTab('completed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectProof = async (dareId: string) => {
    setBusyId(dareId);
    try {
      await dareService.rejectProofForRedo(dareId);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const incomingPendingCount = pendingDares.filter(
    (d) => d.opponentId === currentUser.uid
  ).length;
  const awaitingVerificationCount = activeDares.filter(
    (d) => d.status === 'proof_submitted' && d.winnerId === currentUser.uid
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">My Dares & Punishments</h1>
          <p className="text-sm text-slate-400">
            Accept challenges, lock in match losers, and verify proof to earn Dare Kept badges.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-900 p-1 ring-1 ring-slate-800">
          {(
            [
              {
                key: 'pending',
                label: 'Pending Invites',
                count: pendingDares.length,
                highlight: incomingPendingCount > 0,
              },
              {
                key: 'active',
                label: 'Active & Proof',
                count: activeDares.length,
                highlight: awaitingVerificationCount > 0,
              },
              {
                key: 'completed',
                label: 'Completed',
                count: completedDares.length,
                highlight: false,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                subTab === t.key
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>
                {t.label} ({t.count})
              </span>
              {t.highlight && subTab !== t.key && (
                <span className="h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dare Cards Grid */}
      {displayedDares.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Flame className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-300">
            No {subTab} dares right now.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Head to Live Games to challenge a friend on a matchup!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {displayedDares.map((dare) => {
            const isRecipient = dare.opponentId === currentUser.uid;
            const linkedGame = games.find((g) => g.id === dare.gameId);
            const isGameFinal = linkedGame?.status === 'FINAL';

            const isCurrentUserLoser = dare.loserId === currentUser.uid;
            const isCurrentUserWinner = dare.winnerId === currentUser.uid;

            return (
              <div
                key={dare.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                  dare.status === 'pending' && isRecipient
                    ? 'border-emerald-500/50 bg-slate-900 shadow-lg shadow-emerald-950/20'
                    : dare.status === 'proof_submitted'
                    ? 'border-amber-500/50 bg-slate-900'
                    : 'border-slate-800 bg-slate-900/85'
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-emerald-400">
                      <Swords className="h-3.5 w-3.5" />
                      {dare.league} • {dare.gameTitle}
                    </span>

                    {dare.status === 'pending' && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          isRecipient
                            ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isRecipient ? 'Your Turn to Respond' : 'Awaiting Opponent'}
                      </span>
                    )}

                    {dare.status === 'active' && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/30">
                        {dare.loserId ? 'Punishment Due' : 'Locked In'}
                      </span>
                    )}

                    {dare.status === 'proof_submitted' && (
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/40">
                        Proof Under Review
                      </span>
                    )}

                    {dare.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Settled
                      </span>
                    )}
                  </div>

                  {/* Face-Off Split Card */}
                  <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          @{dare.challengerUsername}
                        </span>
                        {dare.challengerId === currentUser.uid && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                            You
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-medium text-emerald-400">
                        {dare.challengerSide}
                      </p>
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-800">
                      VS
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {dare.opponentId === currentUser.uid && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                            You
                          </span>
                        )}
                        <span className="text-xs font-bold text-white">
                          @{dare.opponentUsername}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-sky-400">
                        {dare.opponentSide}
                      </p>
                    </div>
                  </div>

                  {/* Punishment / Dare Callout Box */}
                  <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-slate-950 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <Sparkles className="h-3 w-3" /> Agreed Punishment ($0 Stakes)
                      </span>
                      {dare.loserUsername && (
                        <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 ring-1 ring-rose-500/30">
                          Loser: @{dare.loserUsername}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold leading-snug text-white">
                      “{dare.dareText}”
                    </p>
                  </div>

                  {/* Submitted Proof Preview (for proof_submitted & completed) */}
                  {(dare.status === 'proof_submitted' || dare.status === 'completed') && (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          Proof from @{dare.loserUsername || dare.opponentUsername}:
                        </span>
                        {dare.status === 'completed' && (
                          <span className="flex items-center gap-1 font-bold text-emerald-400">
                            <Award className="h-4 w-4" /> Dare Kept Badge Awarded!
                          </span>
                        )}
                      </div>
                      {dare.proofText && (
                        <p className="mt-1.5 text-slate-300">“{dare.proofText}”</p>
                      )}
                      {dare.proofImageUrl && (
                        <img
                          src={dare.proofImageUrl}
                          alt="Punishment completion proof"
                          className="mt-2.5 max-h-48 w-full rounded-lg border border-slate-800 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* ============================================================
                    1. PENDING INVITES: Accept / Counter-Dare / Decline
                   ============================================================ */}
                {dare.status === 'pending' && (
                  <div className="mt-5 border-t border-slate-800/80 pt-4">
                    {isRecipient ? (
                      counteringDareId === dare.id ? (
                        <div className="space-y-2.5 rounded-xl border border-slate-700 bg-slate-950 p-3.5">
                          <label className="block text-xs font-bold text-white">
                            Counter-Offer a Different Punishment (Zero Money):
                          </label>
                          <textarea
                            rows={2}
                            value={counterText}
                            onChange={(e) => setCounterText(e.target.value)}
                            placeholder="Propose your counter-dare..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                          {!counterValidation.isValid && counterText.trim().length > 0 && (
                            <div className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-300">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                              <span>{counterValidation.reason}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCounterSubmit(dare)}
                              disabled={!counterValidation.isValid || busyId === dare.id}
                              className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
                            >
                              Send Counter-Dare
                            </button>
                            <button
                              onClick={() => setCounteringDareId(null)}
                              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium text-slate-400">
                            @{dare.challengerUsername} challenged you! Lock in this dare or propose a counter:
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(dare.id)}
                              disabled={busyId === dare.id}
                              className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-emerald-400"
                            >
                              <Check className="h-4 w-4" /> Accept Dare
                            </button>
                            <button
                              onClick={() => {
                                setCounteringDareId(dare.id);
                                setCounterText(dare.dareText);
                              }}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-white transition hover:border-emerald-500/50 hover:text-emerald-300"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Counter
                            </button>
                            <button
                              onClick={() => handleDecline(dare.id)}
                              title="Decline Dare"
                              className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-400 transition hover:border-rose-500/40 hover:text-rose-400"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 italic">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          Waiting for @{dare.opponentUsername} to accept or counter...
                        </span>
                        <button
                          onClick={() => handleDecline(dare.id)}
                          className="text-[11px] text-slate-500 hover:text-rose-400"
                        >
                          Cancel Invite
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================
                    2. ACTIVE DARES: Punishment Accountability Flow
                   ============================================================ */}
                {dare.status === 'active' && (
                  <div className="mt-5 border-t border-slate-800/80 pt-4">
                    {/* Sub-step A: Nobody has declared the loser yet */}
                    {!dare.loserId ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">
                            {isGameFinal
                              ? 'Game Final! Who lost this matchup?'
                              : 'Settle Matchup Result:'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Honest accountability
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              handleDeclareLoser(dare, {
                                uid: currentUser.uid,
                                username: currentUser.username,
                              })
                            }
                            disabled={busyId === dare.id}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500 hover:text-white"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" /> I Lost (Own It)
                          </button>
                          <button
                            onClick={() => {
                              const other =
                                dare.challengerId === currentUser.uid
                                  ? {
                                      uid: dare.opponentId,
                                      username: dare.opponentUsername,
                                    }
                                  : {
                                      uid: dare.challengerId,
                                      username: dare.challengerUsername,
                                    };
                              handleDeclareLoser(dare, other);
                            }}
                            disabled={busyId === dare.id}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-slate-950"
                          >
                            <Trophy className="h-3.5 w-3.5" /> I Won!
                          </button>
                        </div>
                      </div>
                    ) : isCurrentUserLoser ? (
                      /* Sub-step B: Current user is the loser -> Must submit proof */
                      proofDareId === dare.id ? (
                        <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-slate-950 p-3.5">
                          <p className="text-xs font-bold text-white">
                            Upload Proof of Punishment Completion
                          </p>
                          <input
                            type="text"
                            required
                            value={proofText}
                            onChange={(e) => setProofText(e.target.value)}
                            placeholder="Describe what you did (e.g., 'Wore the rival jersey all day!')"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white">
                              <Upload className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{proofImageUrl ? 'Photo Attached ✓' : 'Upload Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="url"
                              value={proofImageUrl.startsWith('data:') ? '' : proofImageUrl}
                              onChange={(e) => setProofImageUrl(e.target.value)}
                              placeholder="Or paste image/video link..."
                              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          {proofImageUrl && (
                            <img
                              src={proofImageUrl}
                              alt="Preview"
                              className="max-h-32 w-full rounded-lg object-cover"
                            />
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitProof(dare)}
                              disabled={busyId === dare.id}
                              className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                            >
                              Submit Proof to @{dare.winnerUsername}
                            </button>
                            <button
                              onClick={() => setProofDareId(null)}
                              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                          <div className="text-xs">
                            <p className="font-bold text-rose-200">
                              You lost this dare! Complete your punishment to earn your badge.
                            </p>
                          </div>
                          <button
                            onClick={() => setProofDareId(dare.id)}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                          >
                            <Camera className="h-3.5 w-3.5" /> Submit Proof
                          </button>
                        </div>
                      )
                    ) : (
                      /* Sub-step C: Current user is the winner waiting on the loser */
                      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="h-4 w-4 text-amber-400" />
                          Waiting for <strong className="text-white">@{dare.loserUsername}</strong> to submit punishment proof...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================
                    3. PROOF SUBMITTED: Winner Verifies Punishment Completion
                   ============================================================ */}
                {dare.status === 'proof_submitted' && (
                  <div className="mt-5 border-t border-slate-800/80 pt-4">
                    {isCurrentUserWinner ? (
                      <div className="space-y-2.5">
                        <p className="text-xs font-semibold text-amber-300">
                          Did @{dare.loserUsername} properly complete the punishment?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyProof(dare)}
                            disabled={busyId === dare.id}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                          >
                            <Award className="h-4 w-4" /> Verify & Award “Dare Kept” Badge
                          </button>
                          <button
                            onClick={() => handleRejectProof(dare.id)}
                            disabled={busyId === dare.id}
                            className="flex items-center justify-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500 hover:text-white"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" /> Redo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
                        <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>
                          Proof submitted! Waiting for <strong>@{dare.winnerUsername}</strong> to verify and award your badge.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
