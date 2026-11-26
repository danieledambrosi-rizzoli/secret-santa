export function PrivacyNotes() {
  return (
    <section id="privacy" className="border-t border-[#E4DDD0] bg-[#F4EFE6] py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-widest uppercase text-[#5C534A]">
              Architecture &amp; Privacy
            </p>
            <h2 className="font-display mt-2 text-3xl font-medium text-[#1C1917]">
              How it runs with zero backend
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5C534A]">
              Instead of saving names and pairings in a cloud database, Hearth &amp; Seal treats
              each invite URL as a self-contained sealed envelope.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-7">
            <div>
              <h3 className="font-display text-xl font-medium text-[#1C1917]">
                Never sent to server logs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
                Everything after the <code className="text-xs text-[#1C1917]">#</code> symbol in a
                URL stays strictly inside the browser. Static web servers only deliver the page
                code—they never see who drew whom.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-medium text-[#1C1917]">
                Safe in group chat previews
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
                Because each payload is encrypted with AES-GCM via the browser&apos;s Web Crypto
                API, messaging apps and link unfurlers cannot read participant names from the link.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-medium text-[#1C1917]">
                Organizer blindness
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
                Your Distribution Ledger keeps each friend&apos;s name paired with their encrypted
                link locally while hiding their assigned recipient—so you can play too.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-medium text-[#1C1917]">
                No reciprocal pairs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C534A]">
                The constraint solver rejects all two-person loops. If you draw someone, they are
                mathematically guaranteed to be buying for someone else.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
