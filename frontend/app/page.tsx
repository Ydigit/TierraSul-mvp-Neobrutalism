import { ArrowRight, Users, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Marquee } from "@/components/shared/marquee";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { TourCard } from "@/components/tour/tour-card";
import { mockTours } from "@/data/mock-data";

export default function HomePage() {
  const featuredTours = mockTours.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8">
            <BrutalBadge variant="pink" rotation={-2} className="mb-6">
              ★ NOW IN 4 COUNTRIES
            </BrutalBadge>
            <h1 className="text-[72px] md:text-[140px] font-black uppercase leading-[0.9] tracking-tight mb-8">
              FIND YOUR<br />
              <span className="bg-[#FFEB3B] px-4 border-4 border-black shadow-[6px_6px_0_#000] inline-block my-2">
                TRIBE.
              </span><br />
              <span className="text-[#FF6B9D]">TRAVEL</span><br />
              <span className="text-[#00E5FF]">TOGETHER.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-12 max-w-2xl">
              Connect with backpackers heading to Salar de Uyuni, Patagonia,
              Atacama & more. Form groups, split costs, make memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <BrutalButton href="/tours" variant="primary" size="lg">
                  BROWSE GROUPS{" "}
                  <ArrowRight className="inline w-5 h-5" strokeWidth={3} />
                </BrutalButton>
              <BrutalButton href="/for-operators" variant="secondary" size="lg">
                  I&apos;M AN OPERATOR
                </BrutalButton>
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="md:col-span-4 space-y-6 mt-8 md:mt-24">
            <div
              className="bg-[#FF6B9D] border-4 border-black p-6 shadow-[8px_8px_0_#000]"
              style={{ transform: "rotate(2deg)" }}
            >
              <div className="text-6xl font-black leading-none">500+</div>
              <div className="text-sm font-bold uppercase mt-2">BACKPACKERS</div>
            </div>
            <div
              className="bg-[#C6FF00] border-4 border-black p-6 shadow-[8px_8px_0_#000]"
              style={{ transform: "rotate(-1deg)" }}
            >
              <div className="text-6xl font-black leading-none">50+</div>
              <div className="text-sm font-bold uppercase mt-2">TOUR OPERATORS</div>
            </div>
            <div
              className="bg-[#00E5FF] border-4 border-black p-6 shadow-[8px_8px_0_#000]"
              style={{ transform: "rotate(1deg)" }}
            >
              <div className="text-6xl font-black leading-none">4</div>
              <div className="text-sm font-bold uppercase mt-2">COUNTRIES</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <Marquee
        items={[
          "★ 500+ BACKPACKERS JOINED",
          "★ PERU",
          "★ BOLIVIA",
          "★ CHILE",
          "★ ARGENTINA",
          "★ JOIN THE TRIBE",
        ]}
        bgColor="#000"
        textColor="#FFEB3B"
      />

      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-white border-y-4 border-black py-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-16 text-center">
            HOW IT{" "}
            <span className="bg-[#FFEB3B] px-4 border-4 border-black shadow-[4px_4px_0_#000]">
              WORKS
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div
                className="absolute -top-6 -left-6 bg-[#FFEB3B] border-4 border-black w-16 h-16 flex items-center justify-center text-3xl font-black shadow-[4px_4px_0_#000]"
                style={{ transform: "rotate(-6deg)" }}
              >
                01
              </div>
              <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000] mt-4">
                <Calendar className="w-12 h-12 mb-4" strokeWidth={3} />
                <h3 className="text-2xl font-black uppercase mb-3">
                  FIND A TOUR
                </h3>
                <p className="font-medium">
                  Browse upcoming tours to South America&apos;s best
                  destinations. Filter by date, location, and vibe.
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -top-6 -left-6 bg-[#00E5FF] border-4 border-black w-16 h-16 flex items-center justify-center text-3xl font-black shadow-[4px_4px_0_#000]"
                style={{ transform: "rotate(3deg)" }}
              >
                02
              </div>
              <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000] mt-4">
                <Users className="w-12 h-12 mb-4" strokeWidth={3} />
                <h3 className="text-2xl font-black uppercase mb-3">
                  JOIN A GROUP
                </h3>
                <p className="font-medium">
                  Connect with other backpackers. Chat, plan, and form your
                  crew before departure.
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -top-6 -left-6 bg-[#FF6B9D] border-4 border-black w-16 h-16 flex items-center justify-center text-3xl font-black shadow-[4px_4px_0_#000]"
                style={{ transform: "rotate(-3deg)" }}
              >
                03
              </div>
              <div className="bg-[#FFF8E7] border-4 border-black p-8 shadow-[6px_6px_0_#000] mt-4">
                <TrendingUp className="w-12 h-12 mb-4" strokeWidth={3} />
                <h3 className="text-2xl font-black uppercase mb-3">
                  GO ADVENTURE
                </h3>
                <p className="font-medium">
                  Book with verified local operators. Split costs. Make
                  memories that last forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none">
            OPEN<br />GROUPS
          </h2>
          <BrutalButton href="/tours" variant="secondary" size="md">
              VIEW ALL →
            </BrutalButton>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#00E5FF] border-4 border-black p-12 md:p-20 shadow-[12px_12px_0_#000] relative">
          <div
            className="absolute -top-8 -right-8 bg-[#FF6B9D] border-4 border-black w-32 h-32 rounded-full flex items-center justify-center font-black text-2xl shadow-[6px_6px_0_#000]"
            style={{ transform: "rotate(12deg)" }}
          >
            FREE!
          </div>
          <h2 className="text-5xl md:text-8xl font-black uppercase leading-none mb-6">
            YOUR<br />
            <span className="bg-black text-[#FFEB3B] px-4 border-4 border-black">
              ADVENTURE
            </span><br />
            STARTS NOW
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-8 max-w-2xl">
            Join 500+ backpackers exploring South America. No fees. No
            corporate BS.
          </p>
          <BrutalButton href="/sign-up" variant="black" size="lg">
              CREATE ACCOUNT →
            </BrutalButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}
