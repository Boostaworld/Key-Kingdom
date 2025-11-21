"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCENT = "#14A5FF";
const CARD_BG = "#0A0F14";
const CANVAS_BG = "#03060A";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [username, password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      const next = searchParams.get("next") || "/admin/products";
      router.push(next);
    } catch (fetchError) {
      console.error(fetchError);
      setError("We hit a network issue. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: CANVAS_BG }}
    >
      <div className="w-full max-w-xl">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#1F2933] p-[1px] shadow-[0_0_30px_rgba(31,176,255,0.24)]"
          style={{ background: "linear-gradient(135deg, #102033, #050709)" }}
        >
          <div
            className="relative h-full w-full rounded-[15px] p-10"
            style={{ background: CARD_BG }}
          >
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[rgba(31,176,255,0.18)] blur-3xl" />
            <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-[rgba(101,225,255,0.15)] blur-3xl" />

            <div className="relative mb-8 flex flex-col gap-2 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-[rgba(31,176,255,0.75)]">
                Key-Kingdom Admin
              </p>
              <h1 className="text-3xl font-semibold">Secure access</h1>
              <p className="text-sm text-[#9CA3AF]">
                Sign in to manage products with the same neon control panel used across
                the kingdom.
              </p>
            </div>

            <form className="relative flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-white">
                Username
                <input
                  className="rounded-lg border border-[#1F2933] bg-[#050709] px-4 py-3 text-white shadow-[0_0_16px_rgba(31,176,255,0.15)] outline-none focus:border-[rgba(20,165,255,0.6)] focus:shadow-[0_0_22px_rgba(31,176,255,0.38)]"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white">
                Password
                <input
                  type="password"
                  className="rounded-lg border border-[#1F2933] bg-[#050709] px-4 py-3 text-white shadow-[0_0_16px_rgba(31,176,255,0.15)] outline-none focus:border-[rgba(20,165,255,0.6)] focus:shadow-[0_0_22px_rgba(31,176,255,0.38)]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-lg border border-[#3B1C1C] bg-[#1A0E10] px-4 py-3 text-sm text-[#FCA5A5] shadow-[0_0_16px_rgba(252,165,165,0.25)]">
                  {error}
                </div>
              ) : (
                <div className="rounded-lg border border-transparent bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[#9CA3AF]">
                  Use your admin credentials to unlock the control surface.
                </div>
              )}

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-[rgba(20,165,255,0.45)] bg-[rgba(20,165,255,0.16)] px-4 py-3 text-base font-semibold text-white shadow-[0_0_28px_rgba(31,176,255,0.45)] transition hover:translate-y-[-1px] hover:shadow-[0_0_36px_rgba(31,176,255,0.65)] focus:outline-none focus:ring-2 focus:ring-[rgba(20,165,255,0.75)] disabled:opacity-70"
                style={{ boxShadow: `0 0 25px ${ACCENT}40` }}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Enter admin panel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
