"use client";

import { useState } from "react";
import Link from "next/link";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useToast } from "@/components/ui/toast";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthed>
      <ForgotPasswordForm />
    </RedirectIfAuthed>
  );
}

function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Mock — backend will trigger Supabase reset email
    setSent(true);
    toast(`Reset link sent to ${email}`, "success");
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-black uppercase">TierraSul</h1>
        </Link>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 md:p-12">
          {!sent ? (
            <>
              <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-6">
                FORGOT<br />PASSWORD?
              </h1>
              <p className="font-medium mb-8">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>

              <form onSubmit={submit} className="space-y-6">
                <BrutalInput
                  label="EMAIL"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <BrutalButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  type="submit"
                >
                  SEND RESET LINK
                </BrutalButton>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-[#C6FF00] border-4 border-black w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Mail className="w-12 h-12" strokeWidth={3} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase leading-none mb-4">
                CHECK YOUR EMAIL
              </h1>
              <p className="font-medium mb-2">We sent a reset link to</p>
              <p className="font-black bg-[#FFEB3B] inline-block px-3 py-1 border-3 border-black mb-8">
                {email}
              </p>
              <BrutalButton
                variant="secondary"
                size="md"
                className="w-full mb-6"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                USE DIFFERENT EMAIL
              </BrutalButton>
            </div>
          )}

          <div className="text-center mt-6 pt-6 border-t-3 border-black">
            <Link
              href="/sign-in"
              className="font-bold uppercase text-sm hover:underline"
            >
              ← BACK TO SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
