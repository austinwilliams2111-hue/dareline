import React from 'react';
import { Flame, PlayCircle, Radio } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onChallenge: (game: Game) => void;
  onSimulateFinish: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onChallenge,
  onSimulateFinish,
}) => {
  const isLive = game.status === 'LIVE';
  const isFinal = game.status === 'FINAL';

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-700">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-300">
            {game.league}
          </span>

          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              {game.clock}
            </span>
          ) : isFinal ? (
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
              FINAL
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">{game.startTime}</span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-inner"
                style={{ backgroundColor: game.awayTeam.color }}
              >
                {game.awayTeam.abbr}
              </div>
              <span className="font-semibold text-white">{game.awayTeam.name}</span>
            </div>
            <span className="font-mono text-xl font-bold text-white">
              {game.status === 'UPCOMING' ? '-' : game.awayTeam.score}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-inner"
                style={{ backgroundColor: game.homeTeam.color }}
              >
                {game.homeTeam.abbr}
              </div>
              <span className="font-semibold text-white">{game.homeTeam.name}</span>
            </div>
            <span className="font-mono text-xl font-bold text-white">
              {game.status === 'UPCOMING' ? '-' : game.homeTeam.score}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
          <span>O/U Total Line</span>
          <span className="font-mono font-semibold text-slate-200">{game.totalPointsLine} pts</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() => onChallenge(game)}
          disabled={isFinal}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          <Flame className="h-4 w-4" />
          <span>{isFinal ? 'Game Ended' : 'Challenge a Friend'}</span>
        </button>

        {!isFinal && (
          <button
            onClick={() => onSimulateFinish(game.id)}
            title="Simulate Game Finish"
            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-400 transition hover:border-slate-600 hover:text-white"
          >
            <PlayCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
