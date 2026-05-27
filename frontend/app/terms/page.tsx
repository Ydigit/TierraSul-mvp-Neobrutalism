import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata = {
  title: "Terms of Service — TierraSul",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-4">
          TERMS OF<br />SERVICE
        </h1>
        <p className="text-sm font-bold uppercase mb-12 text-[#999]">
          Last updated: May 7, 2026
        </p>

        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[8px_8px_0_#000] space-y-8">
          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              1. ACCEPTANCE OF TERMS
            </h2>
            <p className="font-medium leading-relaxed">
              By accessing and using TierraSul (&quot;the Platform&quot;), you
              accept and agree to be bound by the terms and provisions of this
              agreement. If you do not agree to these Terms of Service, please
              do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              2. DESCRIPTION OF SERVICE
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              TierraSul is a marketplace platform that connects:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>Travelers seeking to form group tours in South America</li>
              <li>Tour operators seeking pre-formed groups of travelers</li>
            </ul>
            <p className="font-medium leading-relaxed mt-4">
              TierraSul acts as an intermediary platform and is not responsible
              for the actual tour services provided by operators.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              3. USER ACCOUNTS
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Updating your information to keep it current</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              4. TRAVELER OBLIGATIONS
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              As a traveler, you agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>
                Tour operators who pay for access may receive your contact
                information
              </li>
              <li>You will respond to legitimate inquiries from tour operators</li>
              <li>
                You will not use the platform for any illegal or unauthorized
                purpose
              </li>
              <li>Information you provide is accurate and up-to-date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              5. OPERATOR OBLIGATIONS
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              As a tour operator, you agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>
                You will only use traveler information for legitimate tour
                offers
              </li>
              <li>
                You will not share, sell, or misuse traveler contact information
              </li>
              <li>
                You hold all necessary licenses and insurance for tour
                operations
              </li>
              <li>You will maintain professional communication standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              6. PAYMENT TERMS
            </h2>
            <p className="font-medium leading-relaxed">
              Operator subscriptions are billed monthly in advance. TierraSul
              reserves the right to change pricing with 30 days notice. Refunds
              are not provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              7. LIMITATION OF LIABILITY
            </h2>
            <p className="font-medium leading-relaxed">
              TierraSul is not responsible for the actual tour services, safety,
              or conduct of tour operators. We are a marketplace platform only.
              All bookings and tours are arranged directly between travelers and
              operators.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              8. TERMINATION
            </h2>
            <p className="font-medium leading-relaxed">
              We reserve the right to terminate or suspend accounts that violate
              these terms, engage in fraudulent activity, or misuse the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              9. CONTACT
            </h2>
            <p className="font-medium leading-relaxed">
              For questions about these Terms, contact us at legal@tierrasul.com
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
