"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PRIVACY_NOTICE =
  "This personal passcode gate keeps your roast data private on shared devices.";

export default function AccessPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/access/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        setError(null);
        router.replace("/");
        return;
      }

      if (response.status === 401) {
        setPasscode("");
        setError("Incorrect passcode");
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Unable to unlock. Please try again.");
    } catch {
      setError("Unable to unlock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2c2218]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
        <section className="w-full rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-8 shadow-[0_24px_70px_-45px_rgba(44,34,24,0.65)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8f7d6a]">
            Private access
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Private Roast Timer</h1>
          <p className="mt-2 text-sm text-[#8f7d6a]">{PRIVACY_NOTICE}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
                Passcode
              </span>
              <div className="flex items-center gap-3">
                <input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  autoComplete="current-password"
                  className="h-12 flex-1 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
                  placeholder="Enter passcode"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  className="h-12 rounded-full border border-[#c8b8a5] px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2c2218] transition hover:bg-[#f5efe6]"
                  aria-pressed={showPasscode}
                >
                  {showPasscode ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-2xl border border-[#f1c6c0] bg-[#fff3f1] px-4 py-3 text-sm text-[#7a2f2a]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-[#2c2218] text-sm font-semibold uppercase tracking-[0.3em] text-[#f7f2ea] transition hover:bg-[#3a2f24] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Unlocking..." : "Unlock"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
