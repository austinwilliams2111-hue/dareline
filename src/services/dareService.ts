import { multiplayerStore } from '../lib/multiplayerStore';
import { validateNonMonetaryDare } from '../lib/validation';
import { Dare, Game, UserProfile } from '../types';

export const dareService = {
  /**
   * Backend / Database insertion layer with mandatory anti-monetary guardrail
   */
  async createDare(params: {
    game: Game;
    challenger: UserProfile;
    opponent: { uid: string; username: string };
    conditionLabel: string;
    challengerSide: string;
    opponentSide: string;
    dareText: string;
  }): Promise<void> {
    const check = validateNonMonetaryDare(params.dareText);
    if (!check.isValid) {
      throw new Error(`[GUARDRAIL BLOCKED]: ${check.reason}`);
    }

    const now = Date.now();
    const newDare: Dare = {
      id: `dare-${now}-${Math.random().toString(36).slice(2, 6)}`,
      gameId: params.game.id,
      gameTitle: `${params.game.awayTeam.abbr} @ ${params.game.homeTeam.abbr}`,
      league: params.game.league,
      challengerId: params.challenger.uid,
      challengerUsername: params.challenger.username,
      opponentId: params.opponent.uid,
      opponentUsername: params.opponent.username,
      conditionLabel: params.conditionLabel,
      challengerSide: params.challengerSide,
      opponentSide: params.opponentSide,
      dareText: params.dareText.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await multiplayerStore.insertDare(newDare);
  },

  async acceptDare(dareId: string): Promise<void> {
    await multiplayerStore.updateDare(dareId, { status: 'active' });
  },

  async declineDare(dareId: string): Promise<void> {
    await multiplayerStore.updateDare(dareId, { status: 'declined' });
  },

  async submitCounterDare(
    dare: Dare,
    currentUser: UserProfile,
    newDareText: string
  ): Promise<void> {
    const check = validateNonMonetaryDare(newDareText);
    if (!check.isValid) {
      throw new Error(`[GUARDRAIL BLOCKED]: ${check.reason}`);
    }

    await multiplayerStore.updateDare(dare.id, {
      challengerId: currentUser.uid,
      challengerUsername: currentUser.username,
      opponentId: dare.challengerId,
      opponentUsername: dare.challengerUsername,
      challengerSide: dare.opponentSide,
      opponentSide: dare.challengerSide,
      dareText: newDareText.trim(),
      status: 'pending',
    });
  },

  /**
   * Step 1 of Punishment Settlement:
   * Either player locks in who lost the matchup, OR the loser submits proof directly.
   */
  async declareLoser(
    dare: Dare,
    loser: { uid: string; username: string }
  ): Promise<void> {
    const winner =
      loser.uid === dare.challengerId
        ? { uid: dare.opponentId, username: dare.opponentUsername }
        : { uid: dare.challengerId, username: dare.challengerUsername };

    await multiplayerStore.updateDare(dare.id, {
      loserId: loser.uid,
      loserUsername: loser.username,
      winnerId: winner.uid,
      winnerUsername: winner.username,
    });
  },

  /**
   * Step 2 of Punishment Settlement:
   * The losing player submits photo/text proof that they completed the punishment.
   */
  async submitPunishmentProof(params: {
    dare: Dare;
    loser: UserProfile;
    proofText: string;
    proofImageUrl?: string;
  }): Promise<void> {
    const winner =
      params.loser.uid === params.dare.challengerId
        ? { uid: params.dare.opponentId, username: params.dare.opponentUsername }
        : { uid: params.dare.challengerId, username: params.dare.challengerUsername };

    await multiplayerStore.updateDare(params.dare.id, {
      status: 'proof_submitted',
      loserId: params.loser.uid,
      loserUsername: params.loser.username,
      winnerId: winner.uid,
      winnerUsername: winner.username,
      proofText: params.proofText.trim() || 'Punishment completed!',
      proofImageUrl: params.proofImageUrl?.trim() || '',
    });
  },

  /**
   * Step 3 of Punishment Settlement:
   * The winning opponent verifies the proof (or loser self-settles against bot) to award the Dare Kept badge.
   */
  async verifyAndAwardBadge(dare: Dare): Promise<void> {
    const loserUid = dare.loserId || dare.opponentId;
    await multiplayerStore.updateDare(dare.id, {
      status: 'completed',
      badgeAwarded: true,
    });
    await multiplayerStore.incrementDaresKept(loserUid);
  },

  async rejectProofForRedo(dareId: string): Promise<void> {
    await multiplayerStore.updateDare(dareId, {
      status: 'active',
    });
  },
};
