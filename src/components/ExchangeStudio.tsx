import { useMemo, useState } from 'react';
import { Check, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { ExclusionRule, solveNonReciprocalDraw } from '../lib/solver';

export interface ExchangeConfig {
  eventName: string;
  budget: string;
  exchangeDate: string;
  hostNote: string;
  participants: string[];
  exclusions: ExclusionRule[];
}

interface ExchangeStudioProps {
  onGenerateDraw: (config: ExchangeConfig) => Promise<void>;
  isGenerating: boolean;
  generationError: string | null;
}

const SAMPLE_FRIENDS = ['Alice', 'Marco', 'Elena', 'Julian', 'Nora'];

export function ExchangeStudio({
  onGenerateDraw,
  isGenerating,
  generationError,
}: ExchangeStudioProps) {
  const [eventName, setEventName] = useState('Winter Gathering 2026');
  const [budget, setBudget] = useState('$30');
  const [exchangeDate, setExchangeDate] = useState('December 20, 2026');
  const [hostNote, setHostNote] = useState(
    'Wrap your gift in brown paper and include a short handwritten note.'
  );

  const [participants, setParticipants] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const [exclusions, setExclusions] = useState<ExclusionRule[]>([]);
  const [exclGiver, setExclGiver] = useState('');
  const [exclTarget, setExclTarget] = useState('');
  const [exclMutual, setExclMutual] = useState(true);

  const solvability = useMemo(() => {
    if (participants.length < 3) {
      return {
        ok: false,
        reason: `Add ${3 - participants.length} more friend${3 - participants.length === 1 ? '' : 's'} (minimum 3 for non-reciprocal draws).`,
      };
    }
    return solveNonReciprocalDraw(participants, exclusions, true);
  }, [participants, exclusions]);

  function addParticipant(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const exists = participants.some((p) => p.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setInputError(`"${trimmed}" is already on your guest list.`);
      return;
    }
    setParticipants((prev) => [...prev, trimmed]);
    setNameInput('');
    setInputError(null);
  }

  function handleBulkImport() {
    const tokens = bulkText
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      setInputError('Paste at least one name separated by commas or new lines.');
      return;
    }

    const existingLower = new Set(participants.map((p) => p.toLowerCase()));
    const added: string[] = [];
    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (!existingLower.has(lower)) {
        existingLower.add(lower);
        added.push(token);
      }
    }

    if (added.length > 0) {
      setParticipants((prev) => [...prev, ...added]);
    }
    setBulkText('');
    setBulkOpen(false);
    setInputError(null);
  }

  function removeParticipant(nameToRemove: string) {
    setParticipants((prev) => prev.filter((p) => p !== nameToRemove));
    setExclusions((prev) =>
      prev.filter((rule) => rule.giver !== nameToRemove && rule.excluded !== nameToRemove)
    );
    if (exclGiver === nameToRemove) setExclGiver('');
    if (exclTarget === nameToRemove) setExclTarget('');
    setInputError(null);
  }

  function loadSampleGroup() {
    setParticipants(SAMPLE_FRIENDS);
    setExclusions([]);
    setInputError(null);
  }

  function addExclusionRule() {
    if (!exclGiver || !exclTarget || exclGiver === exclTarget) return;
    const duplicate = exclusions.some(
      (r) =>
        (r.giver === exclGiver && r.excluded === exclTarget && r.mutual === exclMutual) ||
        (r.mutual && r.giver === exclTarget && r.excluded === exclGiver)
    );
    if (duplicate) return;

    setExclusions((prev) => [
      ...prev,
      {
        id: `${exclGiver}-${exclTarget}-${Date.now()}`,
        giver: exclGiver,
        excluded: exclTarget,
        mutual: exclMutual,
      },
    ]);
    setExclGiver('');
    setExclTarget('');
  }

  function removeExclusion(id: string) {
    setExclusions((prev) => prev.filter((rule) => rule.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!solvability.ok || isGenerating) return;
    await onGenerateDraw({
      eventName: eventName.trim() || 'Secret Santa Exchange',
      budget: budget.trim(),
      exchangeDate: exchangeDate.trim(),
      hostNote: hostNote.trim(),
      participants,
      exclusions,
    });
  }

  return (
    <section id="studio" className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
            Organizer Desk
          </p>
          <h2 className="font-display mt-2 text-3xl font-medium text-[#1C1917] sm:text-4xl">
            Compose your exchange
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
            Set your gathering details, add at least three friends, and seal individual invite links
            with a guaranteed non-reciprocal draw.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Exchange Details & Guest Roster */}
          <div className="space-y-8 lg:col-span-7">
            <div className="rounded-lg border border-[#E4DDD0] bg-[#FFFFFF] p-6 sm:p-8">
              <h3 className="font-display text-2xl font-medium text-[#1C1917]">
                01. Gathering details
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="event-name"
                    className="block text-xs font-medium tracking-wide uppercase text-[#5C534A]"
                  >
                    Exchange title
                  </label>
                  <input
                    id="event-name"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Winter Cabin Exchange"
                    className="mt-2 min-h-[42px] w-full rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gift-budget"
                    className="block text-xs font-medium tracking-wide uppercase text-[#5C534A]"
                  >
                    Gift budget
                  </label>
                  <input
                    id="gift-budget"
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. $30 or €25"
                    className="mt-2 min-h-[42px] w-full rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="exchange-date"
                    className="block text-xs font-medium tracking-wide uppercase text-[#5C534A]"
                  >
                    Exchange date
                  </label>
                  <input
                    id="exchange-date"
                    type="text"
                    value={exchangeDate}
                    onChange={(e) => setExchangeDate(e.target.value)}
                    placeholder="e.g. December 20, 2026"
                    className="mt-2 min-h-[42px] w-full rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="host-note"
                    className="block text-xs font-medium tracking-wide uppercase text-[#5C534A]"
                  >
                    Note included in every letter (optional)
                  </label>
                  <textarea
                    id="host-note"
                    rows={2}
                    value={hostNote}
                    onChange={(e) => setHostNote(e.target.value)}
                    placeholder="Dress code, gift theme, or drop-off instructions"
                    className="mt-2 w-full rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#E4DDD0] bg-[#FFFFFF] p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-medium text-[#1C1917]">
                    02. Friend roster
                  </h3>
                  <p className="mt-1 text-xs text-[#5C534A] tabular-nums">
                    {participants.length} added · Minimum 3 required
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setBulkOpen((v) => !v)}
                    className="text-[#5C534A] underline underline-offset-4 hover:text-[#1C1917] cursor-pointer whitespace-nowrap"
                  >
                    {bulkOpen ? 'Single entry' : 'Paste list'}
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleGroup}
                    className="text-[#8C2D25] underline underline-offset-4 hover:text-[#73231C] cursor-pointer whitespace-nowrap"
                  >
                    Load 5-friend sample
                  </button>
                </div>
              </div>

              {!bulkOpen ? (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="friend-name" className="sr-only">
                    Friend name
                  </label>
                  <input
                    id="friend-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addParticipant(nameInput);
                      }
                    }}
                    placeholder="Type a friend's name (e.g. Alice)"
                    className="min-h-[42px] flex-1 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addParticipant(nameInput)}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border border-[#E4DDD0] bg-[#F4EFE6] px-5 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#EBE3D5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add Friend</span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <textarea
                    rows={3}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Paste names separated by commas or new lines (e.g. Alice, Marco, Elena, Julian)"
                    className="w-full rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#5C534A]/60 focus:border-[#8C2D25] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setBulkOpen(false)}
                      className="min-h-[40px] px-4 py-2 text-sm text-[#5C534A] hover:text-[#1C1917] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      className="min-h-[40px] rounded-md bg-[#1C1917] px-5 py-2 text-sm font-medium text-white hover:bg-[#332E2A] cursor-pointer"
                    >
                      Import Names
                    </button>
                  </div>
                </div>
              )}

              {inputError && (
                <p role="alert" className="mt-3 text-xs font-medium text-[#8C2D25]">
                  {inputError}
                </p>
              )}

              {participants.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-md border border-dashed border-[#E4DDD0] bg-[#FBF9F5] px-6 py-8 text-center">
                  <Users className="h-5 w-5 text-[#5C534A]" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium text-[#1C1917]">No friends added yet</p>
                  <p className="mt-1 max-w-sm text-xs text-[#5C534A]">
                    Add your friends one by one, paste a group list, or load the 5-friend sample to
                    try generating sealed links.
                  </p>
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
                  {participants.map((person, index) => (
                    <li
                      key={person}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="w-6 text-xs text-[#5C534A] tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate font-medium text-[#1C1917]">{person}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(person)}
                        aria-label={`Remove ${person}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#5C534A] hover:bg-[#F4EFE6] hover:text-[#8C2D25] transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Ruleset & Draw Action */}
          <div id="ruleset" className="space-y-6 lg:col-span-5">
            <div className="rounded-lg border border-[#E4DDD0] bg-[#F4EFE6] p-6 sm:p-8">
              <h3 className="font-display text-2xl font-medium text-[#1C1917]">
                03. Matching ruleset
              </h3>

              <div className="mt-5 rounded-md border border-[#1E4631]/25 bg-[#FBF9F5] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#1E4631]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">
                      No reciprocal exchanges (Active)
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#5C534A]">
                      Strictly forbids two-person loops. If Alice buys for Marco, Marco cannot buy
                      for Alice—every match circulates in a ring of 3 or more friends.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#E4DDD0] pt-6">
                <p className="text-xs font-medium tracking-wide uppercase text-[#5C534A]">
                  Optional pair exclusions
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#5C534A]">
                  Prevent partners, housemates, or last year&apos;s pairs from drawing each other.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      aria-label="First friend in exclusion rule"
                      value={exclGiver}
                      onChange={(e) => setExclGiver(e.target.value)}
                      disabled={participants.length < 2}
                      className="min-h-[40px] rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917] disabled:opacity-50"
                    >
                      <option value="">Select person</option>
                      {participants.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Second friend in exclusion rule"
                      value={exclTarget}
                      onChange={(e) => setExclTarget(e.target.value)}
                      disabled={participants.length < 2}
                      className="min-h-[40px] rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3 py-2 text-sm text-[#1C1917] disabled:opacity-50"
                    >
                      <option value="">Cannot draw</option>
                      {participants
                        .filter((p) => p !== exclGiver)
                        .map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex min-h-[40px] items-center gap-2 text-xs text-[#1C1917] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exclMutual}
                        onChange={(e) => setExclMutual(e.target.checked)}
                        className="h-4 w-4 accent-[#8C2D25]"
                      />
                      <span>Mutual (neither can draw the other)</span>
                    </label>

                    <button
                      type="button"
                      onClick={addExclusionRule}
                      disabled={!exclGiver || !exclTarget || exclGiver === exclTarget}
                      className="min-h-[40px] rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-4 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#FFFFFF] disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Add Exclusion
                    </button>
                  </div>
                </div>

                {exclusions.length > 0 && (
                  <ul className="mt-4 divide-y divide-[#E4DDD0] border-t border-[#E4DDD0]">
                    {exclusions.map((rule) => (
                      <li
                        key={rule.id}
                        className="flex items-center justify-between gap-3 py-2.5 text-xs text-[#1C1917]"
                      >
                        <span>
                          {rule.giver} {rule.mutual ? '↔' : '→'} {rule.excluded}{' '}
                          <span className="text-[#5C534A]">
                            ({rule.mutual ? 'mutual' : 'one-way'})
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExclusion(rule.id)}
                          className="min-h-[36px] px-2 text-[#5C534A] hover:text-[#8C2D25] cursor-pointer"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 border-t border-[#E4DDD0] pt-6">
                <div className="flex items-start gap-2.5 text-xs">
                  {solvability.ok ? (
                    <>
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#1E4631]"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-[#1E4631]">
                        Ready to draw: valid non-reciprocal assignment verified.
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-[#5C534A]">{solvability.reason}</span>
                  )}
                </div>

                {generationError && (
                  <p role="alert" className="mt-3 text-xs font-medium text-[#8C2D25]">
                    {generationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!solvability.ok || isGenerating}
                  className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-md bg-[#8C2D25] px-6 py-3 text-sm font-medium text-white hover:bg-[#73231C] disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isGenerating ? 'Sealing Private Links…' : 'Seal & Generate Private Links'}
                </button>

                <p className="mt-3 text-xs leading-relaxed text-[#5C534A]">
                  Recipients are hidden on the next screen so you can copy and send your own link
                  without spoiling the surprise.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
