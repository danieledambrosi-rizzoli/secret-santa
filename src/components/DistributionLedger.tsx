import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Eye,
  Lock,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { BlindBackupFile, BlindLedgerEntry, buildInviteMessage, buildRevealUrl } from '../lib/cryptoLinks';

interface DistributionLedgerProps {
  eventName: string;
  budget: string;
  exchangeDate: string;
  createdAt: string;
  entries: BlindLedgerEntry[];
  baseUrl: string;
  onBaseUrlChange: (nextBaseUrl: string) => void;
  onToggleSent: (giver: string) => void;
  onPreviewSample: () => void;
  onResetDraw: () => void;
}

export function DistributionLedger({
  eventName,
  budget,
  exchangeDate,
  createdAt,
  entries,
  baseUrl,
  onBaseUrlChange,
  onToggleSent,
  onPreviewSample,
  onResetDraw,
}: DistributionLedgerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showUrlSettings, setShowUrlSettings] = useState(
    () => typeof window !== 'undefined' && window.location.hostname.includes('ais-dev-')
  );

  const sentCount = entries.filter((entry) => entry.sent).length;

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      // Fallback copy via temporary textarea
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    }
  }

  function getResolvedUrl(entry: BlindLedgerEntry): string {
    const hashPart = entry.revealUrl.split('#reveal=')[1] ?? '';
    return buildRevealUrl(baseUrl, hashPart);
  }

  function downloadBlindBackup() {
    const backup: BlindBackupFile = {
      app: 'Hearth & Seal',
      version: 1,
      eventName,
      exchangeDate,
      budget,
      createdAt,
      entries: entries.map((e) => ({
        giver: e.giver,
        revealUrl: getResolvedUrl(e),
      })),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'secret-santa';
    a.download = `${safeSlug}-blind-links.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="studio" className="py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-lg border border-[#E4DDD0] bg-[#FFFFFF] p-6 sm:p-10">
          <div className="flex flex-col gap-6 border-b border-[#E4DDD0] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#1E4631]">
                Draw Complete · Non-Reciprocal Verified
              </p>
              <h2 className="font-display mt-2 text-3xl font-medium text-[#1C1917] sm:text-4xl">
                {eventName}
              </h2>
              <p className="mt-2 text-sm text-[#5C534A] tabular-nums">
                {entries.length} sealed letters
                {budget ? ` · Budget ${budget}` : ''}
                {exchangeDate ? ` · ${exchangeDate}` : ''}
                {` · ${sentCount} of ${entries.length} marked sent`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPreviewSample}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-4 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Preview Sample Letter</span>
              </button>

              <button
                type="button"
                onClick={downloadBlindBackup}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-4 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Blind Backup</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-md border border-[#E4DDD0] bg-[#F4EFE6] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 text-xs text-[#1C1917]">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#5C534A]" aria-hidden="true" />
              <span>
                Assigned recipients are hidden here so you can join the exchange without seeing who
                each friend drew.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUrlSettings((v) => !v)}
              className="text-left text-xs font-medium text-[#8C2D25] underline underline-offset-4 hover:text-[#73231C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {showUrlSettings ? 'Hide link host' : 'Configure link host'}
            </button>
          </div>

          {showUrlSettings && (
            <div className="mt-4 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] p-4">
              <label
                htmlFor="share-base-url"
                className="block text-xs font-medium tracking-wide uppercase text-[#5C534A]"
              >
                Link host URL (where friends open their letter)
              </label>
              <input
                id="share-base-url"
                type="url"
                value={baseUrl}
                onChange={(e) => onBaseUrlChange(e.target.value)}
                className="mt-2 min-h-[40px] w-full rounded-md border border-[#E4DDD0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1C1917] focus:border-[#8C2D25] focus:outline-none"
              />
              <p className="mt-2 text-xs leading-relaxed text-[#5C534A]">
                If you are previewing in a private development tab, replace this with your public
                Shared App URL before messaging your friends.
              </p>
            </div>
          )}

          <ul className="mt-6 divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
            {entries.map((entry, index) => {
              const resolvedUrl = getResolvedUrl(entry);
              const resolvedMessage = buildInviteMessage(entry.giver, eventName, resolvedUrl);
              const linkCopied = copiedKey === `link-${entry.giver}`;
              const msgCopied = copiedKey === `msg-${entry.giver}`;

              return (
                <li
                  key={entry.giver}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="w-6 text-xs text-[#5C534A] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-[#1C1917]">{entry.giver}</p>
                      <p className="text-xs text-[#5C534A]">
                        {entry.sent ? 'Marked sent' : 'Sealed link ready'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => copyText(`link-${entry.giver}`, resolvedUrl)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#1E4631]" aria-hidden="true" />
                          <span className="text-[#1E4631]">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyText(`msg-${entry.giver}`, resolvedMessage)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {msgCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#1E4631]" aria-hidden="true" />
                          <span className="text-[#1E4631]">Message Copied</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSent(entry.giver)}
                      aria-pressed={entry.sent}
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        entry.sent
                          ? 'bg-[#1E4631] text-white hover:bg-[#173626]'
                          : 'border border-[#E4DDD0] bg-[#FFFFFF] text-[#5C534A] hover:text-[#1C1917]'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{entry.sent ? 'Sent' : 'Mark Sent'}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#5C534A]">
              Tip: Save the blind backup JSON before closing this tab in case a friend misplaces
              their message.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex min-h-[40px] items-center gap-2 text-xs font-medium text-[#5C534A] hover:text-[#8C2D25] transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Start a New Draw</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8C2D25]">Discard current links?</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(false);
                    onResetDraw();
                  }}
                  className="min-h-[36px] rounded-md bg-[#8C2D25] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#73231C] cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[36px] px-2 text-xs text-[#5C534A] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
