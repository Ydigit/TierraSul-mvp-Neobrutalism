"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface PhotonProperties {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  osm_key?: string;
  osm_value?: string;
  type?: string;
}

interface PhotonFeature {
  properties: PhotonProperties;
}

interface CityAutocompleteProps {
  /** ISO 3166-1 alpha-2 code (optional). When present, results are filtered to that country. */
  country?: string;
  value: string;
  onChange: (next: string) => void;
  /**
   * Fired when the user picks a result from the dropdown — gives both the
   * city name and the country code Photon resolved for it. Lets parents save
   * `{ country, city }` as a coherent pair (mirrors the API response shape).
   */
  onSelect?: (picked: { city: string; country?: string }) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

// Photon tags inhabited places under osm_key="place" (city, town, village,
// hamlet, municipality, locality, suburb, etc). Some capitals (Tokyo, Berlin)
// are *also* tagged as administrative units — they show up under
// osm_key="boundary". Restaurants, stations, hotels, peaks, etc. use other
// keys (amenity, railway, tourism, natural) and are filtered out.
const ALLOWED_OSM_KEYS = new Set(["place", "boundary"]);

const PHOTON_URL = "https://photon.komoot.io/api";

export const CityAutocomplete = forwardRef<
  HTMLInputElement,
  CityAutocompleteProps
>(function CityAutocomplete(
  { country, value, onChange, onSelect, label, placeholder, id },
  ref
) {
  const reactId = useId();
  const inputId = id ?? `city-${reactId}`;
  const listboxId = `${inputId}-listbox`;

  const [query, setQuery] = useState(value);
  const [items, setItems] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hi, setHi] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Sync external value (e.g. when user changes country and we reset city upstream).
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced Photon query.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const url = `${PHOTON_URL}?q=${encodeURIComponent(
          q
        )}&limit=15&lang=en`;
        const r = await fetch(url, { signal: ac.signal });
        if (!r.ok) throw new Error(`Photon ${r.status}`);
        const data: { features?: PhotonFeature[] } = await r.json();
        let features = data.features ?? [];
        features = features.filter((f) => {
          const k = (f.properties.osm_key ?? "").toLowerCase();
          return ALLOWED_OSM_KEYS.has(k);
        });
        if (country) {
          const cc = country.toUpperCase();
          features = features.filter(
            (f) => (f.properties.countrycode ?? "").toUpperCase() === cc
          );
        }
        // Dedup by displayed label
        const seen = new Set<string>();
        const unique = features.filter((f) => {
          const key = labelFor(f);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(unique.slice(0, 8));
        setHi(unique.length > 0 ? 0 : -1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Network errors: stay quiet, just clear the list. Input stays free-form.
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, country]);

  // Close on click outside.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (f: PhotonFeature) => {
    const v = labelFor(f);
    setQuery(v);
    onChange(v);
    onSelect?.({
      city: v,
      country: f.properties.countrycode?.toUpperCase(),
    });
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(items.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (open && hi >= 0 && items[hi]) {
        e.preventDefault();
        pick(items[hi]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && (loading || items.length > 0);

  return (
    <div ref={wrapRef} className="w-full relative">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 font-bold uppercase text-sm"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type="text"
        value={query}
        placeholder={placeholder ?? "Start typing your city…"}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (items.length > 0 || query.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          hi >= 0 && items[hi] ? `${listboxId}-${hi}` : undefined
        }
        className="w-full bg-white border-4 border-black px-4 py-3 font-bold uppercase text-sm shadow-[4px_4px_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_#000] transition-all"
      />

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0_#000] max-h-72 overflow-auto"
        >
          {loading && items.length === 0 && (
            <li className="px-4 py-3 font-bold uppercase text-xs text-[#666]">
              SEARCHING…
            </li>
          )}
          {items.map((f, i) => {
            const selected = i === hi;
            return (
              <li
                key={i}
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => {
                  // mousedown fires before input blur; prevents the input losing focus
                  // before pick() runs.
                  e.preventDefault();
                  pick(f);
                }}
                onMouseEnter={() => setHi(i)}
                className={`px-4 py-2 border-b-3 border-black last:border-b-0 cursor-pointer font-bold text-sm ${
                  selected ? "bg-[#FFEB3B]" : "bg-white hover:bg-[#FFF8E7]"
                }`}
              >
                <span className="uppercase">{f.properties.name}</span>
                <span className="font-medium normal-case text-xs text-[#666] ml-2">
                  {[f.properties.state, f.properties.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

function labelFor(f: PhotonFeature): string {
  return f.properties.name ?? f.properties.city ?? "";
}
