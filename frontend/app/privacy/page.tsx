import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata = {
  title: "Privacy Policy — TierraSul",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-4">
          PRIVACY<br />POLICY
        </h1>
        <p className="text-sm font-bold uppercase mb-12 text-[#999]">
          Last updated: May 7, 2026
        </p>

        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[8px_8px_0_#000] space-y-8">
          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              1. INFORMATION WE COLLECT
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>Name, email address, and contact information</li>
              <li>Country, city, and age</li>
              <li>Tour preferences and descriptions</li>
              <li>Phone number (optional, per-tour basis)</li>
              <li>Payment information (for operators)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              2. HOW WE USE YOUR INFORMATION
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>Provide and maintain the TierraSul platform</li>
              <li>Connect travelers with tour operators</li>
              <li>Process payments and subscriptions</li>
              <li>Send service-related communications</li>
              <li>Improve and personalize your experience</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              3. INFORMATION SHARING
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              <strong>For Travelers:</strong> When you join a tour group, your
              contact information (name, email, country, age, and optionally
              phone) will be shared with verified tour operators who pay to
              access that group.
            </p>
            <p className="font-medium leading-relaxed mb-4">
              <strong>For Operators:</strong> Your company information and
              contact details are visible to travelers in groups you contact.
            </p>
            <p className="font-medium leading-relaxed">
              We do not sell your personal information to third parties for
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              4. DATA SECURITY
            </h2>
            <p className="font-medium leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              5. YOUR RIGHTS
            </h2>
            <p className="font-medium leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium ml-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and associated data</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              6. COOKIES
            </h2>
            <p className="font-medium leading-relaxed">
              We use cookies and similar technologies to maintain sessions,
              remember preferences, and analyze platform usage. You can control
              cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              7. DATA RETENTION
            </h2>
            <p className="font-medium leading-relaxed">
              We retain your information as long as your account is active or
              as needed to provide services. You may request deletion at any
              time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              8. CHILDREN&apos;S PRIVACY
            </h2>
            <p className="font-medium leading-relaxed">
              TierraSul is not intended for users under 18 years of age. We do
              not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              9. CHANGES TO THIS POLICY
            </h2>
            <p className="font-medium leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or platform
              notification.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase mb-4 border-b-4 border-[#FFEB3B] pb-2 inline-block">
              10. CONTACT US
            </h2>
            <p className="font-medium leading-relaxed">
              For privacy questions or to exercise your rights, contact us at
              privacy@tierrasul.com
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
