import Link from "next/link";
import { BrutalButton } from "@/components/ui/brutal-button";
import { RequireBanned } from "@/components/auth/require-banned";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Account suspended — TierraSul",
};

export default function BannedPage() {
  return (
    <RequireBanned>
      <BannedContent />
    </RequireBanned>
  );
}

function BannedContent() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-black uppercase">TierraSul</h1>
        </Link>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 md:p-12">
          <div className="bg-[#FF3B3B] border-4 border-black w-24 h-24 mx-auto mb-8 flex items-center justify-center text-white">
            <ShieldAlert className="w-12 h-12" strokeWidth={3} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-6 text-center">
            ACCOUNT<br />SUSPENDED
          </h1>

          <p className="font-medium mb-6 text-center">
            Your account has been suspended for violating our community
            guidelines.
          </p>

          <div className="bg-[#FFF8E7] border-3 border-black p-5 mb-8">
            <p className="font-bold uppercase text-sm mb-2">WHAT NOW?</p>
            <p className="font-medium text-sm">
              If you believe this is a mistake, contact us at{" "}
              <a
                href="mailto:support@tierrasul.com"
                className="font-black underline"
              >
                support@tierrasul.com
              </a>{" "}
              with your registered email and a brief explanation.
            </p>
          </div>

          <BrutalButton
            href="mailto:support@tierrasul.com"
            variant="primary"
            size="lg"
            className="w-full"
          >
            CONTACT SUPPORT
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}
