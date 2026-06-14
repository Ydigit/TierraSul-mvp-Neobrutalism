import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function ForOperatorsPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      {/* Hero */}
      <section className="bg-black text-white border-b-4 border-black py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <BrutalBadge variant="yellow" className="mb-6">
                ★ FOR TOUR OPERATORS
              </BrutalBadge>
              <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-8">
                STOP <span className="text-[#FF6B9D]">CHASING</span> LEADS.<br />
                START{" "}
                <span className="bg-[#C6FF00] text-black px-3">CLOSING</span>{" "}
                TOURS.
              </h1>
              <p className="text-xl font-medium mb-8 max-w-xl">
                Pre-formed groups of 4-8 backpackers. Confirmed dates.
                Confirmed destinations. From €16.99/month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <BrutalButton href="/sign-up" variant="primary" size="lg">
                    APPLY FOR FOUNDING 50 →
                  </BrutalButton>
                <BrutalButton href="/pricing" variant="secondary" size="lg">
                    SEE PRICING
                  </BrutalButton>
              </div>
              <p className="text-[#FF6B9D] font-black mt-4">
                ★ Only 14 spots left
              </p>
            </div>
            <div className="md:col-span-5 space-y-4">
              <div
                className="bg-[#FF6B9D] border-4 border-black p-6 shadow-[8px_8px_0_#000]"
                style={{ transform: "rotate(1deg)" }}
              >
                <div className="text-5xl font-black">500+</div>
                <div className="font-bold uppercase text-sm mt-2">
                  TRAVELERS
                </div>
              </div>
              <div
                className="bg-[#00E5FF] border-4 border-black p-6 shadow-[8px_8px_0_#000]"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="text-5xl font-black">4</div>
                <div className="font-bold uppercase text-sm mt-2">
                  COUNTRIES
                </div>
              </div>
              <div
                className="bg-[#FFEB3B] border-4 border-black p-6 shadow-[8px_8px_0_#000] text-black"
                style={{ transform: "rotate(2deg)" }}
              >
                <div className="text-5xl font-black">€16.99</div>
                <div className="font-bold uppercase text-sm mt-2">
                  STARTING PRICE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Pain */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-12 text-center">
          MARKETING IS{" "}
          <span className="line-through decoration-8 decoration-[#FF3B3B]">
            EATING
          </span>{" "}
          DESTROYING<br />YOUR MARGIN
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <TrendingUp
              className="w-12 h-12 mb-4 text-[#FF3B3B]"
              strokeWidth={3}
            />
            <div className="text-5xl font-black mb-2 text-[#FF3B3B]">+35%</div>
            <p className="font-bold uppercase">CAC INCREASE SINCE 2023</p>
          </div>
          <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <div className="text-5xl font-black mb-2">€106</div>
            <p className="font-bold uppercase">AVG COST PER LEAD</p>
          </div>
          <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <TrendingDown
              className="w-12 h-12 mb-4 text-[#FF3B3B]"
              strokeWidth={3}
            />
            <div className="text-5xl font-black mb-2">HALF</div>
            <p className="font-bold uppercase">GROUP TOURS GO UNFILLED</p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="bg-white border-y-4 border-black py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-12 text-center">
            WE DELIVER{" "}
            <span className="bg-[#FFEB3B] px-3 border-4 border-black shadow-[4px_4px_0_#000]">
              GROUPS,
            </span>
            <br />NOT CONTACTS.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000]">
              <h3 className="text-2xl font-black uppercase mb-4">
                REAL GROUPS<br />NOT COLD LEADS
              </h3>
              <p className="font-medium">
                4-8 travelers who already agreed on dates & destination. No
                chasing.
              </p>
            </div>
            <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000]">
              <h3 className="text-2xl font-black uppercase mb-4">
                DIRECT CONTACT<br />NO MIDDLEMEN
              </h3>
              <p className="font-medium">
                Get their emails & phones. Pitch directly. Close on your terms.
              </p>
            </div>
            <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000]">
              <h3 className="text-2xl font-black uppercase mb-4">
                PAY MONTHLY<br />NOT PER BOOKING
              </h3>
              <p className="font-medium">
                Predictable cost. No commissions. Keep 100% of your margin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-12 text-center">
          SIMPLE <span className="text-[#FF6B9D]">PRICING</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <h3 className="text-sm font-black uppercase mb-2">STARTER</h3>
            <div className="text-5xl font-black mb-4">€16.99</div>
            <p className="font-bold uppercase text-sm mb-6">
              5 CONTACTS/MO
            </p>
            <BrutalButton href="/pricing" variant="secondary"
                size="sm"
                className="w-full">
                LEARN MORE
              </BrutalButton>
          </div>
          <div
            className="bg-[#FFEB3B] border-4 border-black p-8 shadow-[12px_12px_0_#000] relative"
            style={{ transform: "rotate(1deg)" }}
          >
            <BrutalBadge
              variant="pink"
              className="absolute -top-3 -right-3"
              rotation={-6}
            >
              MOST POPULAR
            </BrutalBadge>
            <h3 className="text-sm font-black uppercase mb-2">GROWTH</h3>
            <div className="text-5xl font-black mb-4">€59</div>
            <p className="font-bold uppercase text-sm mb-6">
              30 CONTACTS/MO
            </p>
            <BrutalButton href="/pricing" variant="black" size="sm" className="w-full">
                LEARN MORE
              </BrutalButton>
          </div>
          <div className="bg-[#00E5FF] border-4 border-black p-8 shadow-[6px_6px_0_#000]">
            <h3 className="text-sm font-black uppercase mb-2">PRO</h3>
            <div className="text-5xl font-black mb-4">€129</div>
            <p className="font-bold uppercase text-sm mb-6">
              100 CONTACTS/MO
            </p>
            <BrutalButton href="/pricing" variant="secondary"
                size="sm"
                className="w-full">
                LEARN MORE
              </BrutalButton>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#FFEB3B] border-4 border-black p-12 md:p-20 shadow-[12px_12px_0_#000]">
          <h2 className="text-5xl md:text-8xl font-black uppercase leading-none mb-6">
            STOP CHASING.<br />START CLOSING.
          </h2>
          <BrutalButton href="/sign-up" variant="black" size="lg">
              APPLY NOW →
            </BrutalButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}
