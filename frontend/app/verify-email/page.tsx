"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  // Banned → /banned. Verified users keep access to this page only so the
  // submit handler can still run (typical case is signOut→/sign-in).
  useEffect(() => {
    if (loading || !user) return;
    if (user.status === "banned") {
      router.replace("/banned");
    }
  }, [loading, user, router]);

  const targetEmail = params.get("email") ?? user?.email ?? "your inbox";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const filled = code.length === CODE_LENGTH;

  const setDigit = (i: number, raw: string) => {
    // Allow paste of multi-digit strings into any cell
    const clean = raw.replace(/\D/g, "");
    if (clean.length === 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[i] = "";
        return next;
      });
      return;
    }
    setError(null);
    if (clean.length > 1) {
      // distribute starting at i
      setDigits((prev) => {
        const next = [...prev];
        for (let j = 0; j < clean.length && i + j < CODE_LENGTH; j++) {
          next[i + j] = clean[j];
        }
        return next;
      });
      const nextFocus = Math.min(i + clean.length, CODE_LENGTH - 1);
      inputsRef.current[nextFocus]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const onKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1)
      inputsRef.current[i + 1]?.focus();
  };

  const verify = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (verifying) return;
    if (!filled) {
      setError(`Enter all ${CODE_LENGTH} digits`);
      return;
    }
    setVerifying(true);
    setError(null);
    // Mock: any 6-digit code is accepted. Real impl will call
    // `supabase.auth.verifyOtp({ email: targetEmail, token: code, type: 'email' })`
    // and only proceed on success.
    setTimeout(() => {
      // Clear the half-baked session created during sign-up so the user logs
      // in fresh with email+password (mirrors a real verification handoff).
      signOut();
      toast("Email verified — sign in to continue", "success");
      router.push(
        `/sign-in?email=${encodeURIComponent(targetEmail)}&verified=1`
      );
    }, 400);
  };

  const resend = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
    toast(`New code sent to ${targetEmail}`, "success");
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-black uppercase">TierraSul</h1>
        </Link>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 md:p-12 text-center">
          <div className="bg-[#FFEB3B] border-4 border-black w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Mail className="w-12 h-12" strokeWidth={3} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-4">
            ENTER<br />THE CODE
          </h1>

          <p className="font-medium mb-2">We sent a 6-digit code to</p>
          <p className="font-black text-base sm:text-lg mb-8 bg-[#FFEB3B] px-3 py-1 border-3 border-black inline-block break-all max-w-full">
            {targetEmail}
          </p>

          <form onSubmit={verify}>
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-2"
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/^\d+$/.test(text)) {
                  e.preventDefault();
                  setDigit(0, text);
                }
              }}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={6}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-white border-4 border-black shadow-[4px_4px_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_#000] focus:bg-[#FFEB3B] transition-all"
                />
              ))}
            </div>

            {error && (
              <p className="font-bold uppercase text-xs text-[#FF3B3B] mb-4">
                {error}
              </p>
            )}

            <p className="font-bold uppercase text-xs text-[#666] mb-6 mt-4">
              ★ Demo: any 6 digits work
            </p>

            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mb-4"
              disabled={!filled || verifying}
            >
              {verifying ? "VERIFYING…" : "VERIFY EMAIL"}
            </BrutalButton>
          </form>

          <BrutalButton
            variant="secondary"
            size="md"
            className="w-full mb-6"
            onClick={resend}
          >
            RESEND CODE
          </BrutalButton>

          <Link
            href="/sign-in"
            className="font-bold uppercase text-sm hover:underline"
          >
            BACK TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
