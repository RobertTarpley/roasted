import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="w-full rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-8 shadow-[0_24px_70px_-45px_rgba(44,34,24,0.65)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f7d6a]">
            Offline
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Inventory is offline</h1>
          <p className="mt-2 text-sm text-[#8f7d6a]">
            You can still open your inventory shell, but updates will sync when
            you reconnect.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[#d9cabb] bg-white/70 px-4 py-5 text-sm text-[#9a8774]">
            Keep roasting notes handy. Reconnect to save new changes.
          </div>
          <Link
            href="/inventory"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-[#c8b8a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#2c2218] transition hover:bg-[#f5efe6]"
          >
            Return to inventory
          </Link>
        </section>
      </main>
    </div>
  );
}
