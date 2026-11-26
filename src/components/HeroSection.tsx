import { useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import HERO_IMAGE_SRC from '../assets/images/grinch_gifts.jpg';

interface HeroSectionProps {
  onComposeClick: () => void;
}

export function HeroSection({ onComposeClick }: HeroSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="border-b border-[#E4DDD0] bg-[#FBF9F5]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
                Zero Database · Non-Reciprocal Guarantee · Private Links
              </p>

              <h1 className="font-display mt-5 text-4xl font-medium leading-[1.08] tracking-tight text-[#1C1917] sm:text-5xl lg:text-[3.5rem]">
                Private Secret Santa, sealed without a server.
              </h1>

              <p className="mt-6 max-w-prose text-base leading-relaxed text-[#5C534A]">
                Organize a thoughtful gift exchange for your friends without renting a database,
                configuring email relays, or trusting third-party sites with anyone&apos;s name.
                Every draw runs locally in your browser and produces self-contained, encrypted
                reveal letters.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5 pt-2">
              <button
                type="button"
                onClick={onComposeClick}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#8C2D25] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#73231C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Compose Your Exchange</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <a
                href="#approach"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#1C1917] underline decoration-[#E4DDD0] underline-offset-4 hover:decoration-[#8C2D25] transition-colors whitespace-nowrap shrink-0"
              >
                How zero-infrastructure links work
              </a>
            </div>
          </div>

          <div className="flex flex-col lg:col-span-6">
            <figure className="flex h-full flex-col">
              <div className="relative flex-1 overflow-hidden rounded-lg border border-[#E4DDD0] bg-[#F4EFE6]">
                {!imageFailed ? (
                  <img
                    src={HERO_IMAGE_SRC}
                    alt="Cindy Lou Who and the Grinch in How the Grinch Stole Christmas"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className="h-64 w-full object-cover sm:h-80 lg:h-full lg:min-h-[340px]"
                  />
                ) : (
                  <div className="flex h-64 w-full flex-col items-center justify-center bg-[#F4EFE6] p-8 text-center sm:h-80 lg:h-full lg:min-h-[340px]">
                    <div className="h-14 w-14 rounded-full border border-[#8C2D25]/30 bg-[#8C2D25]/10" />
                    <p className="font-display mt-4 text-2xl text-[#1C1917]">
                      Sealed Winter Correspondence
                    </p>
                    <p className="mt-1 text-sm text-[#5C534A]">
                      Encrypted locally · Opened privately
                    </p>
                  </div>
                )}
              </div>
              <figcaption className="mt-3 font-display text-sm italic text-[#5C534A]">
                Fig. 1 — &ldquo;Maybe Christmas doesn&apos;t come from a store. Maybe Christmas,
                perhaps, means a little bit more!&rdquo; — How the Grinch Stole Christmas
              </figcaption>
            </figure>
          </div>
        </div>

        <div
          id="approach"
          className="mt-14 grid grid-cols-1 gap-8 border-t border-[#E4DDD0] pt-10 md:grid-cols-3"
        >
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A] tabular-nums">
              01. Static Hosting
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium text-[#1C1917]">
              Hosted once, zero upkeep
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
              This page is served as a lightweight static web app—already hosted via your shared app
              URL—with no backend database or mail server to maintain.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A] tabular-nums">
              02. Browser Encryption
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium text-[#1C1917]">
              Sealed in URL fragments
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
              Each friend&apos;s match is encrypted with AES-GCM inside the link&apos;s{' '}
              <code className="text-xs text-[#1C1917]">#reveal=</code> fragment, which browsers
              never transmit to web servers.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A] tabular-nums">
              03. Self-Contained Letters
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium text-[#1C1917]">
              Zero-lookup matching
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
              Both the recipient&apos;s name and their assigned match live inside their encrypted
              token, while the organizer&apos;s desk hides matches so everyone can join.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
