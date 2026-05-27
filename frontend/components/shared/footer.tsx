import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-black uppercase mb-4">TierraSul</h3>
            <p className="font-medium">
              Anti-corporate travel for real backpackers.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-3 text-[#FFEB3B]">
              TRAVELERS
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/tours" className="hover:text-[#FFEB3B]">
                  Browse Tours
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#FFEB3B]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-[#FFEB3B]">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-3 text-[#00E5FF]">
              OPERATORS
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/for-operators" className="hover:text-[#00E5FF]">
                  For Operators
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#00E5FF]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-[#00E5FF]">
                  Partner Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-3 text-[#FF6B9D]">COMPANY</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/#about" className="hover:text-[#FF6B9D]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#FF6B9D]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FF6B9D]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FF6B9D]">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-white pt-8 text-center font-bold uppercase text-sm">
          © 2026 TIERRASUL · BUILT FOR BACKPACKERS
        </div>
      </div>
    </footer>
  );
}
