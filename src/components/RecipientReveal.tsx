import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { RevealPayload } from '../lib/cryptoLinks';
import SEAL_IMAGE_SRC from '../assets/images/wax_seal_emblem_1795714537367.jpg';

interface RecipientRevealProps {
  payload: RevealPayload | null;
  error: string | null;
  isLoading: boolean;
  isSamplePreview?: boolean;
  onExitToHost: () => void;
}

export function RecipientReveal({
  payload,
  error,
  isLoading,
  isSamplePreview = false,
  onExitToHost,
}: RecipientRevealProps) {
  const [unsealed, setUnsealed] = useState(false);
  const [sealImgFailed, setSealImgFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
        <div className="rounded-lg border border-[#E4DDD0] bg-[#FFFFFF] p-10 text-center">
          <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
            Decrypting Locally
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium text-[#1C1917]">
            Unpacking your private letter…
          </h1>
        </div>
      </section>
    );
  }

  if (error || !payload) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
        <div className="rounded-lg border border-[#E4DDD0] bg-[#FFFFFF] p-8 sm:p-12">
          <p className="text-xs font-medium tracking-widest uppercase text-[#8C2D25]">
            Unable to Open Letter
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium text-[#1C1917] sm:text-4xl">
            This invite link looks incomplete
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#5C534A]">
            {error || 'The encrypted seal could not be verified.'} Messaging apps occasionally wrap
            or trim long URLs—ask your organizer to copy and send your private link once more.
          </p>
          <div className="mt-8 border-t border-[#E4DDD0] pt-6">
            <button
              type="button"
              onClick={onExitToHost}
              className="inline-flex min-h-[42px] items-center justify-center rounded-md bg-[#8C2D25] px-5 py-2 text-sm font-medium text-white hover:bg-[#73231C] transition-colors cursor-pointer"
            >
              Host a New Exchange
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 lg:py-20">
      {isSamplePreview && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#E4DDD0] bg-[#F4EFE6] px-4 py-3 text-xs text-[#1C1917]">
          <span>
            Sample preview only — your friends&apos; real matches remain hidden from you.
          </span>
          <button
            type="button"
            onClick={onExitToHost}
            className="font-medium text-[#8C2D25] underline underline-offset-4 hover:text-[#73231C] cursor-pointer whitespace-nowrap"
          >
            Back to Distribution Ledger
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E4DDD0] bg-[#FFFFFF]">
        {!unsealed ? (
          <div className="p-8 text-center sm:p-12">
            <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
              {payload.eventName}
              {payload.exchangeDate ? ` · ${payload.exchangeDate}` : ''}
            </p>

            <h1 className="font-display mt-4 text-4xl font-medium text-[#1C1917] sm:text-5xl">
              A Private Letter for {payload.giver}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#5C534A]">
              Make sure nobody is glancing over your shoulder, then break the wax seal to reveal
              who you are gifting to.
            </p>

            <div className="mx-auto mt-8 w-44 overflow-hidden rounded-lg border border-[#E4DDD0] bg-[#F4EFE6]">
              {!sealImgFailed ? (
                <img
                  src={SEAL_IMAGE_SRC}
                  alt="Deep crimson winter pine wax seal on cream cotton stationery"
                  referrerPolicy="no-referrer"
                  onError={() => setSealImgFailed(true)}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-[#F4EFE6]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#8C2D25] text-white font-display text-2xl">
                    H&amp;S
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setUnsealed(true)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-md bg-[#8C2D25] px-8 py-3 text-sm font-medium text-white hover:bg-[#73231C] transition-colors cursor-pointer whitespace-nowrap"
              >
                Break Seal &amp; Reveal Match
              </button>
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#5C534A]">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Decrypted locally in your browser · Never stored on a server</span>
            </p>
          </div>
        ) : (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-12"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4DDD0] pb-6">
              <div>
                <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
                  {payload.eventName}
                </p>
                <p className="mt-1 text-sm text-[#5C534A]">Addressed to {payload.giver}</p>
              </div>

              <button
                type="button"
                onClick={() => setUnsealed(false)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#E4DDD0] bg-[#FBF9F5] px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Re-Seal Screen</span>
              </button>
            </div>

            <div className="py-10 text-center">
              <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
                You are Secret Santa for
              </p>
              <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-[#8C2D25] sm:text-6xl">
                {payload.recipient}
              </h1>
            </div>

            <dl className="divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0] text-sm">
              {payload.budget && (
                <div className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-xs font-medium tracking-wide uppercase text-[#5C534A]">
                    Suggested Budget
                  </dt>
                  <dd className="font-medium text-[#1C1917] tabular-nums">{payload.budget}</dd>
                </div>
              )}

              {payload.exchangeDate && (
                <div className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-xs font-medium tracking-wide uppercase text-[#5C534A]">
                    Exchange Date
                  </dt>
                  <dd className="font-medium text-[#1C1917]">{payload.exchangeDate}</dd>
                </div>
              )}

              {payload.hostNote && (
                <div className="py-3.5">
                  <dt className="text-xs font-medium tracking-wide uppercase text-[#5C534A]">
                    Note from Organizer
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-[#1C1917]">{payload.hostNote}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 space-y-2 text-xs leading-relaxed text-[#5C534A]">
              {payload.nonReciprocal && (
                <p className="flex items-center gap-2 font-medium text-[#1E4631]">
                  <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Non-reciprocal guarantee: {payload.recipient} did not draw you.
                  </span>
                </p>
              )}
              <p>
                Keep this link bookmarked if you want to check the details later—your match lives
                only inside this URL.
              </p>
            </div>

            <div className="mt-8 border-t border-[#E4DDD0] pt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onExitToHost}
                className="text-xs font-medium text-[#8C2D25] underline underline-offset-4 hover:text-[#73231C] cursor-pointer"
              >
                {isSamplePreview ? 'Return to Distribution Ledger' : 'Host your own Secret Santa'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
