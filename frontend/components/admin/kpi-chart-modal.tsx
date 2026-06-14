"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BrutalModal } from "@/components/ui/brutal-modal";

export type KpiKind = "mrr" | "operators" | "travelers" | "tours";

interface KpiChartModalProps {
  open: boolean;
  onClose: () => void;
  kind: KpiKind | null;
}

// Mock historical series. Each entry is one calendar month, last-12.
// Numbers picked to roughly back-fit the headline KPIs (MRR €1,247 etc.).
const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const mrrSeries = months.map((m, i) => ({
  month: m,
  mrr: Math.round(220 + i * 95 + (i > 6 ? i * 25 : 0)),
  churn: Math.round(20 + Math.random() * 30),
}));

const operatorSeries = months.map((m, i) => ({
  month: m,
  active: 4 + i * 2 + (i > 8 ? 2 : 0),
  new: i === 0 ? 4 : 1 + Math.round(Math.random() * 3),
}));

const travelerSeries = months.map((m, i) => ({
  month: m,
  total: Math.round(40 + i * 38 + (i > 7 ? i * 4 : 0)),
  active: Math.round(25 + i * 22),
}));

const toursSeries = months.map((m, i) => ({
  month: m,
  closed: Math.round(5 + i * 2.6 + (i > 8 ? 5 : 0)),
  expired: Math.round(2 + Math.random() * 3),
}));

const CFG: Record<KpiKind, {
  title: string;
  subtitle: string;
  headline: string;
  color: string;
  secondaryColor: string;
  /** Distinct KPI breakdown shown above the chart */
  breakdown: { label: string; value: string }[];
}> = {
  mrr: {
    title: "MRR · MONTHLY RECURRING REVENUE",
    subtitle: "Last 12 months. Excludes one-time charges, includes churn.",
    headline: "€1,247",
    color: "#FFEB3B",
    secondaryColor: "#FF6B9D",
    breakdown: [
      { label: "TODAY", value: "€1,247" },
      { label: "30D AGO", value: "€1,128" },
      { label: "GROWTH (MoM)", value: "+10.5%" },
      { label: "CHURN (MoM)", value: "-€42" },
    ],
  },
  operators: {
    title: "ACTIVE OPERATORS",
    subtitle: "Operators on a paid plan with at least 1 contact used in the last 30d.",
    headline: "23",
    color: "#00E5FF",
    secondaryColor: "#C6FF00",
    breakdown: [
      { label: "ACTIVE NOW", value: "23" },
      { label: "NEW (30D)", value: "+3" },
      { label: "CHURNED (30D)", value: "-1" },
      { label: "PIPELINE", value: "8 trials" },
    ],
  },
  travelers: {
    title: "TRAVELERS",
    subtitle: "Total signups. Active = joined a tour in the last 90 days.",
    headline: "487",
    color: "#FF6B9D",
    secondaryColor: "#00E5FF",
    breakdown: [
      { label: "TOTAL", value: "487" },
      { label: "ACTIVE (90D)", value: "298" },
      { label: "NEW (30D)", value: "+72" },
      { label: "RETENTION", value: "61%" },
    ],
  },
  tours: {
    title: "TOURS CLOSED · PER MONTH",
    subtitle: "Tours that hit min participants and went through the 48h window.",
    headline: "34/MO",
    color: "#C6FF00",
    secondaryColor: "#FF6B9D",
    breakdown: [
      { label: "THIS MONTH", value: "34" },
      { label: "AVG (12M)", value: "21" },
      { label: "EXPIRED (30D)", value: "5" },
      { label: "FILL RATE", value: "87%" },
    ],
  },
};

export function KpiChartModal({ open, onClose, kind }: KpiChartModalProps) {
  if (!kind) return null;
  const cfg = CFG[kind];

  return (
    <BrutalModal open={open} onClose={onClose} title={cfg.title} size="lg">
      <p className="font-medium text-sm text-[#666] mb-6">{cfg.subtitle}</p>

      {/* Headline + breakdown */}
      <div
        className="border-4 border-black p-4 md:p-5 mb-6 shadow-[4px_4px_0_#000]"
        style={{ background: cfg.color }}
      >
        <div className="text-5xl md:text-6xl font-black leading-none mb-3">
          {cfg.headline}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {cfg.breakdown.map((b) => (
            <div
              key={b.label}
              className="bg-white border-3 border-black px-3 py-2 shadow-[2px_2px_0_#000]"
            >
              <p className="font-bold uppercase text-[10px] text-[#666]">
                {b.label}
              </p>
              <p className="font-black text-lg leading-tight">{b.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border-4 border-black p-3 md:p-4 shadow-[4px_4px_0_#000]">
        <div className="h-72 w-full">
          {kind === "mrr" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrSeries}>
                <CartesianGrid stroke="#000" strokeOpacity={0.1} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} formatter={(v: number) => `€${v}`} />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{ fill: cfg.color, stroke: "#000", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#000", strokeWidth: 3, fill: cfg.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {kind === "operators" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={operatorSeries}>
                <CartesianGrid stroke="#000" strokeOpacity={0.1} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#000"
                  strokeWidth={3}
                  fill={cfg.color}
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {kind === "travelers" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={travelerSeries}>
                <CartesianGrid stroke="#000" strokeOpacity={0.1} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#000"
                  strokeWidth={3}
                  fill={cfg.color}
                  fillOpacity={0.85}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#000"
                  strokeWidth={3}
                  fill={cfg.secondaryColor}
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {kind === "tours" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toursSeries}>
                <CartesianGrid stroke="#000" strokeOpacity={0.1} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="closed" fill={cfg.color} stroke="#000" strokeWidth={2} />
                <Bar dataKey="expired" fill={cfg.secondaryColor} stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-bold uppercase">
          {kind === "mrr" && <LegendDot color={cfg.color} label="MRR (€)" />}
          {kind === "operators" && (
            <LegendDot color={cfg.color} label="Active operators" />
          )}
          {kind === "travelers" && (
            <>
              <LegendDot color={cfg.color} label="Total" />
              <LegendDot color={cfg.secondaryColor} label="Active (90d)" />
            </>
          )}
          {kind === "tours" && (
            <>
              <LegendDot color={cfg.color} label="Closed" />
              <LegendDot color={cfg.secondaryColor} label="Expired" />
            </>
          )}
        </div>
      </div>

      <p className="font-medium text-xs text-[#666] mt-4">
        ★ Demo data — wire to /api/admin/metrics when the backend lands.
      </p>
    </BrutalModal>
  );
}

const axisProps = {
  stroke: "#000",
  strokeWidth: 2,
  tick: { fontSize: 12, fontWeight: 700, fill: "#000" } as const,
  tickLine: false,
};

const tooltipProps = {
  contentStyle: {
    background: "#000",
    border: "3px solid #000",
    color: "#FFEB3B",
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase" as const,
    padding: "8px 12px",
  },
  cursor: { fill: "rgba(0,0,0,0.06)" },
  labelStyle: { color: "#fff", marginBottom: 4 },
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="w-3 h-3 border border-black"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
