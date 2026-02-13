import Link from "next/link";

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="w-full rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-8 shadow-[0_24px_70px_-45px_rgba(44,34,24,0.65)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f7d6a]">
            Install on iPhone
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Add Roasted to Home Screen</h1>
          <p className="mt-2 text-sm text-[#8f7d6a]">
            Safari handles installs for iOS. Follow these quick steps to save
            the app as Roasted.
          </p>

          <ol className="mt-6 space-y-3 text-sm text-[#2c2218]">
            <li className="rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3">
              1. Tap the Share icon in Safari.
            </li>
            <li className="rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3">
              2. Choose Add to Home Screen.
            </li>
            <li className="rounded-2xl border border-[#eadfce] bg-white/70 px-4 py-3">
              3. Confirm the name Roasted, then tap Add.
            </li>
          </ol>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Install prompts are browser-driven, no button required.
          </p>

          <Link
            href="/inventory"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-[#c8b8a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#2c2218] transition hover:bg-[#f5efe6]"
          >
            Back to inventory
          </Link>
        </section>
      </main>
    </div>
  );
}
