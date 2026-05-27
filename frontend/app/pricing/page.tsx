import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-6xl md:text-9xl font-black uppercase leading-none mb-6 text-center">
          SIMPLE PRICING.<br />
          <span className="text-[#FF6B9D]">ZERO COMMISSIONS.</span>
        </h1>
        <p className="text-xl font-medium text-center mb-16 max-w-2xl mx-auto">
          Transparent monthly plans. Cancel anytime. No hidden fees. Keep 100%
          of your booking revenue.
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[8px_8px_0_#000]">
            <h3 className="text-sm font-black uppercase mb-2">STARTER</h3>
            <div className="text-6xl font-black mb-1">€16.99</div>
            <p className="font-bold uppercase text-sm mb-6 text-[#666]">
              /MONTH
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">5 group contacts/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">1 country access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">Email & phone numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <X
                  className="w-5 h-5 mt-1 shrink-0 text-[#FF3B3B]"
                  strokeWidth={3}
                />
                <span className="font-medium text-[#999]">
                  Priority support
                </span>
              </li>
            </ul>
            <BrutalButton href="/sign-up" variant="secondary" size="md" className="w-full">
                GET STARTED
              </BrutalButton>
          </div>

          <div
            className="bg-[#FFEB3B] border-4 border-black p-8 shadow-[12px_12px_0_#000] relative"
            style={{ transform: "scale(1.05)" }}
          >
            <BrutalBadge
              variant="pink"
              className="absolute -top-3 -right-3"
              rotation={-6}
            >
              MOST POPULAR
            </BrutalBadge>
            <h3 className="text-sm font-black uppercase mb-2">GROWTH</h3>
            <div className="text-6xl font-black mb-1">€59</div>
            <p className="font-bold uppercase text-sm mb-6">/MONTH</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">30 group contacts/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">3 countries access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">Email & phone numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">Priority support</span>
              </li>
            </ul>
            <BrutalButton href="/sign-up" variant="black" size="md" className="w-full">
                GET STARTED
              </BrutalButton>
          </div>

          <div className="bg-[#00E5FF] border-4 border-black p-8 shadow-[8px_8px_0_#000]">
            <h3 className="text-sm font-black uppercase mb-2">PRO</h3>
            <div className="text-6xl font-black mb-1">€129</div>
            <p className="font-bold uppercase text-sm mb-6">/MONTH</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">100 group contacts/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">ALL countries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">Email & phone numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
                <span className="font-medium">Dedicated support</span>
              </li>
            </ul>
            <BrutalButton href="/sign-up" variant="secondary" size="md" className="w-full">
                GET STARTED
              </BrutalButton>
          </div>
        </div>

        {/* Founding 50 Banner */}
        <div className="bg-[#FF6B9D] border-4 border-black p-12 shadow-[8px_8px_0_#000] mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black uppercase mb-4">
                FOUNDING 50: 14 SPOTS LEFT
              </h2>
              <ul className="space-y-2">
                <li className="font-bold">★ 50% off first 3 months</li>
                <li className="font-bold">★ Lifetime priority support</li>
                <li className="font-bold">★ Early access to new features</li>
              </ul>
            </div>
            <BrutalButton href="/sign-up" variant="black" size="lg">
                CLAIM YOUR SPOT →
              </BrutalButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
