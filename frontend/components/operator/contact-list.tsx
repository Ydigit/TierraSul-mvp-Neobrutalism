"use client";

import { Mail, Phone, Copy } from "lucide-react";
import { useToast } from "../ui/toast";

export interface ContactRow {
  name: string;
  country: string;
  countryFlag: string;
  age: number;
  email: string;
  phone?: string;
  languages: string[];
  bio?: string;
}

interface ContactListProps {
  contacts: ContactRow[];
}

export function ContactList({ contacts }: ContactListProps) {
  const { toast } = useToast();

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied to clipboard`, "success");
    } catch {
      toast("Could not copy — select & copy manually", "error");
    }
  };

  return (
    <div className="space-y-4">
      {contacts.map((c) => (
        <div
          key={c.email}
          className="bg-white border-3 border-black p-6 shadow-[4px_4px_0_#000]"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
            <div>
              <h3 className="text-xl font-black uppercase">{c.name}</h3>
              <p className="font-bold text-sm">
                {c.countryFlag} {c.country} · {c.age} years
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.languages.map((lang) => (
                <span
                  key={lang}
                  className="bg-[#FFF8E7] border-2 border-black px-2 py-1 font-bold text-xs"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {c.bio && (
            <p className="font-medium text-sm mb-4 italic border-l-4 border-black pl-3">
              &ldquo;{c.bio}&rdquo;
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Mail className="w-5 h-5" strokeWidth={3} />
              <span className="font-bold bg-[#FFEB3B] px-3 py-1 border-2 border-black break-all">
                {c.email}
              </span>
              <button
                onClick={() => copy(c.email, "Email")}
                aria-label={`Copy ${c.name}'s email`}
                className="bg-white border-2 border-black px-3 py-1 hover:bg-[#FFF8E7] transition-colors flex items-center gap-1 font-bold uppercase text-xs"
              >
                <Copy className="w-3 h-3" strokeWidth={3} /> COPY
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Phone className="w-5 h-5" strokeWidth={3} />
              {c.phone ? (
                <>
                  <span className="font-bold">{c.phone}</span>
                  <button
                    onClick={() => copy(c.phone!, "Phone")}
                    aria-label={`Copy ${c.name}'s phone`}
                    className="bg-white border-2 border-black px-3 py-1 hover:bg-[#FFF8E7] transition-colors flex items-center gap-1 font-bold uppercase text-xs"
                  >
                    <Copy className="w-3 h-3" strokeWidth={3} /> COPY
                  </button>
                </>
              ) : (
                <span className="font-bold text-[#999] uppercase text-sm">
                  Not shared
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
