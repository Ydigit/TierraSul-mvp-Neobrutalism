import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-black uppercase mb-6">404</h1>
        <p className="text-2xl font-bold mb-8">PAGE NOT FOUND</p>
        <Link
          href="/"
          className="bg-[#FFEB3B] text-black border-4 border-black px-8 py-4 font-black uppercase shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000] transition-all duration-100 inline-block"
        >
          GO HOME
        </Link>
      </div>
    </div>
  );
}
