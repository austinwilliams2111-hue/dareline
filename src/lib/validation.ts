import { ValidationResult } from '../types';

const CURRENCY_SYMBOL_REGEX = /[$€£¥₿₹₩]/;

const FINANCIAL_KEYWORDS = [
  'dollar', 'dollars', 'buck', 'bucks', 'cash', 'venmo', 'paypal',
  'etransfer', 'e-transfer', 'zelle', 'cashapp', 'cash app',
  'crypto', 'btc', 'bitcoin', 'eth', 'ethereum', 'usdt', 'usdc',
  'bet', 'bets', 'betting', 'wager', 'wagers', 'gamble', 'gambling',
  'pay', 'paying', 'payment', 'paid', 'money', 'cent', 'cents',
  'transfer', 'wire', 'bank', 'venmoing', 'splitwise', 'stake', 'odds', 'payout'
];

const SAFE_NUMERIC_UNITS = [
  'pushup', 'pushups', 'push-up', 'push-ups',
  'situp', 'situps', 'squat', 'squats', 'burpee', 'burpees',
  'minute', 'minutes', 'min', 'mins', 'hour', 'hours', 'hr', 'hrs',
  'day', 'days', 'week', 'weeks', 'lap', 'laps', 'mile', 'miles',
  'km', 'star', 'stars', 'word', 'words', 'second', 'seconds', 'sec', 'secs',
  'calorie', 'calories', 'oz', 'cup', 'cups', 'slice', 'slices', 'wing', 'wings'
];

export function validateNonMonetaryDare(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValid: false, reason: 'Please enter a creative dare or select a preset.' };
  }

  const symbolMatch = trimmed.match(CURRENCY_SYMBOL_REGEX);
  if (symbolMatch) {
    return {
      isValid: false,
      flaggedTerm: symbolMatch[0],
      reason: `Dareline is strictly a zero-money platform. Currency symbols like "${symbolMatch[0]}" are not allowed.`
    };
  }

  const lower = trimmed.toLowerCase();
  for (const kw of FINANCIAL_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        isValid: false,
        flaggedTerm: kw,
        reason: `Dareline is strictly a zero-money platform. Financial or betting terms like "${kw}" are blocked.`
      };
    }
  }

  const numberMatches = [...lower.matchAll(/\b\d+(?:\.\d+)?\b/g)];
  for (const match of numberMatches) {
    const numStr = match[0];
    const startIndex = match.index ?? 0;
    const afterText = lower.slice(startIndex + numStr.length).trim();
    const beforeText = lower.slice(0, startIndex).trim();

    if (/^k\b/.test(afterText)) {
      return {
        isValid: false,
        flaggedTerm: `${numStr}k`,
        reason: `Dareline is strictly a zero-money platform. Numeric financial amounts like "${numStr}k" are not permitted.`
      };
    }

    const nextWord = afterText.split(/[\s.,!?;:]+/)[0] || '';
    const isSafeUnit = SAFE_NUMERIC_UNITS.includes(nextWord);
    const hasFinancialContext =
      /\b(for|worth|send|owe|owes|give|gives|put|puts|drop|drops)\b/.test(beforeText.split(/\s+/).slice(-2).join(' ')) &&
      !isSafeUnit;

    if (!isSafeUnit && (hasFinancialContext || !nextWord)) {
      return {
        isValid: false,
        flaggedTerm: numStr,
        reason: `Dareline is strictly a zero-money platform. Standalone numbers like "${numStr}" look like wagers—specify a fun non-monetary unit (e.g., "${numStr} pushups" or "${numStr} hours")!`
      };
    }
  }

  return { isValid: true };
}
