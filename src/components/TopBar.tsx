interface TopBarProps {
  isRecipientView: boolean;
  onStartDraw: () => void;
  onGoHome: () => void;
}

export function TopBar({ isRecipientView, onStartDraw, onGoHome }: TopBarProps) {
  return (
    <header className="border-b border-[#E4DDD0] bg-[#FBF9F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
        <button
          type="button"
          onClick={onGoHome}
          className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#8C2D25] transition-colors"
        >
          Hearth &amp; Seal
        </button>

        {!isRecipientView ? (
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C534A]"
          >
            <a
              href="#approach"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Approach
            </a>
            <a
              href="#studio"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Compose Draw
            </a>
            <a
              href="#ruleset"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ruleset
            </a>
            <a
              href="#privacy"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Privacy
            </a>
          </nav>
        ) : (
          <nav
            aria-label="Letter navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C534A]"
          >
            <button
              type="button"
              onClick={onGoHome}
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Zero-Server Privacy
            </button>
          </nav>
        )}

        <div className="shrink-0">
          <button
            type="button"
            onClick={isRecipientView ? onGoHome : onStartDraw}
            className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#8C2D25] px-5 py-2 text-sm font-medium text-white hover:bg-[#73231C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRecipientView ? 'Host Your Own' : 'Start a Draw'}
          </button>
        </div>
      </div>
    </header>
  );
}
