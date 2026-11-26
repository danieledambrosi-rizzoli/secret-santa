export interface ExclusionRule {
  id: string;
  giver: string;
  excluded: string;
  mutual: boolean;
}

export interface MatchPair {
  giver: string;
  recipient: string;
}

export type SolveResult =
  | {
      ok: true;
      matches: MatchPair[];
    }
  | {
      ok: false;
      reason: string;
    };

function shuffleInPlace<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildBlockedMap(
  participants: string[],
  exclusions: ExclusionRule[]
): Map<string, Set<string>> {
  const blocked = new Map<string, Set<string>>();
  for (const person of participants) {
    blocked.set(person, new Set([person]));
  }

  for (const rule of exclusions) {
    if (blocked.has(rule.giver) && blocked.has(rule.excluded)) {
      blocked.get(rule.giver)!.add(rule.excluded);
      if (rule.mutual) {
        blocked.get(rule.excluded)!.add(rule.giver);
      }
    }
  }

  return blocked;
}

/**
 * Solves a Secret Santa assignment enforcing:
 * 1. No self-matches (A -> A)
 * 2. Custom exclusions (directional or mutual)
 * 3. No reciprocal exchanges (no 2-cycles: if A -> B, then B -> A is forbidden)
 */
export function solveNonReciprocalDraw(
  rawParticipants: string[],
  exclusions: ExclusionRule[],
  forbidReciprocal = true
): SolveResult {
  const participants = rawParticipants.map((p) => p.trim()).filter(Boolean);

  if (participants.length < (forbidReciprocal ? 3 : 2)) {
    return {
      ok: false,
      reason: forbidReciprocal
        ? 'At least 3 friends are required so nobody gets paired in a reciprocal exchange.'
        : 'At least 2 friends are required to run a draw.',
    };
  }

  const uniqueCheck = new Set(participants.map((p) => p.toLowerCase()));
  if (uniqueCheck.size !== participants.length) {
    return {
      ok: false,
      reason: 'Every participant needs a unique name so invite links stay distinct.',
    };
  }

  const blocked = buildBlockedMap(participants, exclusions);

  const allowedCandidates = new Map<string, string[]>();
  for (const giver of participants) {
    const blockedSet = blocked.get(giver)!;
    const candidates = participants.filter((candidate) => !blockedSet.has(candidate));
    if (candidates.length === 0) {
      return {
        ok: false,
        reason: `${giver} has no valid recipients left under the current exclusion rules.`,
      };
    }
    allowedCandidates.set(giver, shuffleInPlace(candidates));
  }

  // Order givers by fewest options first (MRV heuristic) with random tie-breaking
  const orderedGivers = shuffleInPlace(participants).sort(
    (a, b) => allowedCandidates.get(a)!.length - allowedCandidates.get(b)!.length
  );

  const assignment = new Map<string, string>();
  const usedRecipients = new Set<string>();
  const n = orderedGivers.length;
  let stepBudget = 120000;

  function hasDeadEnd(startIndex: number): boolean {
    for (let i = startIndex; i < n; i++) {
      const giver = orderedGivers[i];
      const candidates = allowedCandidates.get(giver)!;
      let validCount = 0;
      for (const candidate of candidates) {
        if (usedRecipients.has(candidate)) continue;
        if (forbidReciprocal && assignment.get(candidate) === giver) continue;
        validCount++;
        break;
      }
      if (validCount === 0) return true;
    }
    return false;
  }

  function backtrack(index: number): boolean {
    if (stepBudget-- <= 0) return false;
    if (index === n) return true;

    const giver = orderedGivers[index];
    const candidates = allowedCandidates.get(giver)!;

    for (const candidate of candidates) {
      if (usedRecipients.has(candidate)) continue;
      if (forbidReciprocal && assignment.get(candidate) === giver) continue;

      assignment.set(giver, candidate);
      usedRecipients.add(candidate);

      if (!hasDeadEnd(index + 1) && backtrack(index + 1)) {
        return true;
      }

      assignment.delete(giver);
      usedRecipients.delete(candidate);
    }

    return false;
  }

  const solved = backtrack(0);
  if (!solved) {
    return {
      ok: false,
      reason:
        'No valid non-reciprocal assignment exists with these exclusion rules. Try removing one exclusion or adding another friend.',
    };
  }

  // Preserve original participant order in the ledger
  const matches: MatchPair[] = participants.map((giver) => ({
    giver,
    recipient: assignment.get(giver)!,
  }));

  return { ok: true, matches };
}
