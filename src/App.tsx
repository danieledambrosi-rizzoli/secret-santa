import { useEffect, useState } from 'react';
import { DistributionLedger } from './components/DistributionLedger';
import { ExchangeConfig, ExchangeStudio } from './components/ExchangeStudio';
import { HeroSection } from './components/HeroSection';
import { PrivacyNotes } from './components/PrivacyNotes';
import { RecipientReveal } from './components/RecipientReveal';
import { TopBar } from './components/TopBar';
import {
  BlindLedgerEntry,
  RevealPayload,
  buildInviteMessage,
  buildRevealUrl,
  extractTokenFromHash,
  sealRevealPayload,
  unsealRevealToken,
} from './lib/cryptoLinks';
import { solveNonReciprocalDraw } from './lib/solver';

interface StoredDrawState {
  eventName: string;
  budget: string;
  exchangeDate: string;
  hostNote: string;
  createdAt: string;
  entries: BlindLedgerEntry[];
}

const SESSION_STORAGE_KEY = 'hearth_and_seal_ledger_v1';

function getDefaultBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

export default function App() {
  const [hashToken, setHashToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? extractTokenFromHash(window.location.hash) : null
  );

  const [revealPayload, setRevealPayload] = useState<RevealPayload | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const [samplePreviewPayload, setSamplePreviewPayload] = useState<RevealPayload | null>(null);

  const [baseUrl, setBaseUrl] = useState<string>(() => getDefaultBaseUrl());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [drawState, setDrawState] = useState<StoredDrawState | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as StoredDrawState;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function handleHashChange() {
      setHashToken(extractTokenFromHash(window.location.hash));
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let active = true;

    async function decryptToken(token: string) {
      setRevealLoading(true);
      setRevealError(null);
      setRevealPayload(null);

      try {
        const decoded = await unsealRevealToken(token);
        if (active) {
          setRevealPayload(decoded);
        }
      } catch (err) {
        if (active) {
          setRevealError(err instanceof Error ? err.message : 'Unable to decrypt this link.');
        }
      } finally {
        if (active) {
          setRevealLoading(false);
        }
      }
    }

    if (hashToken) {
      decryptToken(hashToken);
    } else {
      setRevealPayload(null);
      setRevealError(null);
      setRevealLoading(false);
    }

    return () => {
      active = false;
    };
  }, [hashToken]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (drawState) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(drawState));
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [drawState]);

  function scrollToStudio() {
    const el = document.getElementById('studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleGoHome() {
    setSamplePreviewPayload(null);
    if (hashToken) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
      setHashToken(null);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleGenerateDraw(config: ExchangeConfig) {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = solveNonReciprocalDraw(config.participants, config.exclusions, true);
      if (!result.ok) {
        setGenerationError(result.reason);
        return;
      }

      const createdAt = new Date().toISOString().slice(0, 10);
      const currentBase = baseUrl || getDefaultBaseUrl();

      const entries: BlindLedgerEntry[] = await Promise.all(
        result.matches.map(async (pair) => {
          const token = await sealRevealPayload({
            v: 1,
            giver: pair.giver,
            recipient: pair.recipient,
            eventName: config.eventName,
            budget: config.budget,
            exchangeDate: config.exchangeDate,
            hostNote: config.hostNote,
            nonReciprocal: true,
            createdAt,
          });
          const revealUrl = buildRevealUrl(currentBase, token);
          return {
            giver: pair.giver,
            revealUrl,
            shareMessage: buildInviteMessage(pair.giver, config.eventName, revealUrl),
            sent: false,
          };
        })
      );

      setDrawState({
        eventName: config.eventName,
        budget: config.budget,
        exchangeDate: config.exchangeDate,
        hostNote: config.hostNote,
        createdAt,
        entries,
      });

      window.setTimeout(() => {
        scrollToStudio();
      }, 60);
    } catch (err) {
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Could not encrypt invite links in this browser.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToggleSent(giver: string) {
    setDrawState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.giver === giver ? { ...entry, sent: !entry.sent } : entry
        ),
      };
    });
  }

  function handleOpenSamplePreview() {
    if (!drawState) return;
    setSamplePreviewPayload({
      v: 1,
      giver: 'Sample Friend',
      recipient: 'Sample Match',
      eventName: drawState.eventName,
      budget: drawState.budget,
      exchangeDate: drawState.exchangeDate,
      hostNote: drawState.hostNote,
      nonReciprocal: true,
      createdAt: drawState.createdAt,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleResetDraw() {
    setDrawState(null);
    setSamplePreviewPayload(null);
    setGenerationError(null);
  }

  const isRecipientMode = Boolean(hashToken) || Boolean(samplePreviewPayload);

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#1C1917]">
      <TopBar
        isRecipientView={isRecipientMode}
        onStartDraw={scrollToStudio}
        onGoHome={handleGoHome}
      />

      <main className="flex-1">
        {hashToken ? (
          <RecipientReveal
            key={hashToken}
            payload={revealPayload}
            error={revealError}
            isLoading={revealLoading}
            onExitToHost={handleGoHome}
          />
        ) : samplePreviewPayload ? (
          <RecipientReveal
            key="sample-preview"
            payload={samplePreviewPayload}
            error={null}
            isLoading={false}
            isSamplePreview
            onExitToHost={() => setSamplePreviewPayload(null)}
          />
        ) : (
          <>
            <HeroSection onComposeClick={scrollToStudio} />

            {drawState ? (
              <DistributionLedger
                eventName={drawState.eventName}
                budget={drawState.budget}
                exchangeDate={drawState.exchangeDate}
                createdAt={drawState.createdAt}
                entries={drawState.entries}
                baseUrl={baseUrl}
                onBaseUrlChange={setBaseUrl}
                onToggleSent={handleToggleSent}
                onPreviewSample={handleOpenSamplePreview}
                onResetDraw={handleResetDraw}
              />
            ) : (
              <ExchangeStudio
                onGenerateDraw={handleGenerateDraw}
                isGenerating={isGenerating}
                generationError={generationError}
              />
            )}

            <PrivacyNotes />
          </>
        )}
      </main>

      <footer className="border-t border-[#E4DDD0] bg-[#FBF9F5] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-xs text-[#5C534A] sm:flex-row sm:items-center">
          <p>Hearth &amp; Seal · Zero-database Secret Santa correspondence</p>
          <p>AES-GCM client encryption · Non-reciprocal cycle guarantee</p>
        </div>
      </footer>
    </div>
  );
}
