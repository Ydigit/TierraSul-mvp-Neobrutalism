"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heart, TrendingDown, Euro, Users as UsersIcon } from "lucide-react";

export default function AdminCohesionPage() {
  // Mock data points T-30 → T-3 (day 30 before tour start → 3 before start).
  // Each entry: cohesion percent (members still in / min target), aggregated.
  const series = useMemo(() => {
    const days = 28;
    const out: { day: string; cohesion: number; leaves: number }[] = [];
    for (let i = 0; i < days; i++) {
      const t = 30 - i;
      // smooth slow erosion + variance — illustrative only
      const c = Math.round(
        96 - i * 0.4 - (i > 18 ? (i - 18) * 1.2 : 0) + Math.sin(i / 2) * 1
      );
      const leaves = Math.max(0, Math.round((30 - c) / 6 + (i % 4 === 0 ? 1 : 0)));
      out.push({ day: `T-${t}`, cohesion: Math.max(70, c), leaves });
    }
    return out;
  }, []);

  const avgCohesion = Math.round(
    series.reduce((a, e) => a + e.cohesion, 0) / series.length
  );
  const totalLeaves = series.reduce((a, e) => a + e.leaves, 0);

  const problematic = useMemo(
    () => [
      {
        id: "1",
        title: "SALAR DE UYUNI 4D/3N",
        country: "🇧🇴 BOLIVIA",
        startSize: 6,
        nowSize: 4,
        loss: 33,
        operators: 1,
      },
      {
        id: "5",
        title: "MACHU PICCHU CLASSIC",
        country: "🇵🇪 PERU",
        startSize: 7,
        nowSize: 4,
        loss: 43,
        operators: 0,
      },
      {
        id: "8",
        title: "RAINBOW MOUNTAIN",
        country: "🇵🇪 PERU",
        startSize: 8,
        nowSize: 5,
        loss: 38,
        operators: 2,
      },
    ],
    []
  );

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-3">
        COHESION
      </h1>
      <p className="font-medium mb-12 max-w-3xl">
        How well groups hold together between close and start. Higher cohesion
        means more groups depart as planned; drops correlate with operator
        cancellations and exit-fee revenue spikes.
      </p>

      {/* KPIs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard
          label="AVG COHESION"
          value={`${avgCohesion}%`}
          color="#C6FF00"
          icon={<Heart className="w-6 h-6" strokeWidth={3} />}
        />
        <KpiCard
          label="TOTAL LEAVES (30D)"
          value={String(totalLeaves)}
          color="#FF6B9D"
          icon={<TrendingDown className="w-6 h-6" strokeWidth={3} />}
        />
        <KpiCard
          label="EXIT FEES PAID"
          value="€85"
          color="#FFEB3B"
          icon={<Euro className="w-6 h-6" strokeWidth={3} />}
        />
        <KpiCard
          label="DATA-SHARE EXITS"
          value="12"
          color="#00E5FF"
          icon={<UsersIcon className="w-6 h-6" strokeWidth={3} />}
        />
      </div>

      {/* Cohesion timeline */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
          COHESION EVOLUTION · T-30 → T-3
        </h2>
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_#000]">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="#000" strokeOpacity={0.1} />
                <XAxis
                  dataKey="day"
                  stroke="#000"
                  strokeWidth={2}
                  tick={{ fontSize: 11, fontWeight: 700, fill: "#000" }}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  stroke="#000"
                  strokeWidth={2}
                  tick={{ fontSize: 12, fontWeight: 700, fill: "#000" }}
                  tickLine={false}
                  unit="%"
                  domain={[70, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#000",
                    border: "3px solid #000",
                    color: "#FFEB3B",
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.06)" }}
                  labelStyle={{ color: "#fff", marginBottom: 4 }}
                  formatter={(v: number, name) =>
                    name === "cohesion" ? `${v}%` : v
                  }
                />
                <Line
                  type="monotone"
                  dataKey="cohesion"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{
                    fill: "#C6FF00",
                    stroke: "#000",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#000",
                    strokeWidth: 3,
                    fill: "#C6FF00",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="font-medium text-xs text-[#666] mt-3">
            Each point aggregates all open + closed groups whose start date
            falls on T-N from today. Erosion in the last 10 days correlates
            strongly with operator-side cancellations.
          </p>
        </div>
      </section>

      {/* Problematic groups */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
          GROUPS LOSING &gt; 30%
        </h2>
        <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FFEB3B] border-b-4 border-black">
              <tr>
                <th className="px-4 py-3 text-left font-black uppercase text-xs">
                  GROUP
                </th>
                <th className="px-4 py-3 text-left font-black uppercase text-xs">
                  COUNTRY
                </th>
                <th className="px-4 py-3 text-right font-black uppercase text-xs">
                  START
                </th>
                <th className="px-4 py-3 text-right font-black uppercase text-xs">
                  NOW
                </th>
                <th className="px-4 py-3 text-right font-black uppercase text-xs">
                  LOSS
                </th>
                <th className="px-4 py-3 text-right font-black uppercase text-xs">
                  OPS PAID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {problematic.map((g) => (
                <tr key={g.id} className="hover:bg-[#FFF8E7]">
                  <td className="px-4 py-3 font-bold">
                    <Link
                      href={`/tours/${g.id}`}
                      className="hover:underline decoration-2"
                    >
                      {g.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{g.country}</td>
                  <td className="px-4 py-3 font-bold text-right">
                    {g.startSize}
                  </td>
                  <td className="px-4 py-3 font-bold text-right">{g.nowSize}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-[#FF6B9D] border-2 border-black px-2 py-0.5 font-black text-xs">
                      -{g.loss}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-right">
                    {g.operators}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Aggregated insights */}
      <section>
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
          INSIGHTS
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InsightCard
            label="EXIT CHOICE SPLIT"
            value="€5 fee 41% · share data 59%"
            tone="info"
          />
          <InsightCard
            label="REOPEN RATE"
            value="3% of closed groups reopened in last 30d"
            tone="info"
          />
          <InsightCard
            label="GRACE-DEFICIT RESOLUTION"
            value="68% recovered before 24h window closed"
            tone="success"
          />
          <InsightCard
            label="AVG TIME IN CLOSING WINDOW"
            value="29h before fully closing"
            tone="info"
          />
        </div>
      </section>

      <p className="font-medium text-xs text-[#666] mt-8">
        ★ Demo data — wire to /api/admin/cohesion when the backend lands.
        Future: per-group timeline drill-in.
      </p>
    </>
  );
}

function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="border-4 border-black p-6 shadow-[6px_6px_0_#000] bg-white"
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase">{label}</div>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-black">{value}</div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "info" | "success" | "warning";
}) {
  const bg = tone === "success" ? "#C6FF00" : tone === "warning" ? "#FF6B9D" : "#FFF8E7";
  return (
    <div
      className="border-4 border-black p-5 shadow-[4px_4px_0_#000]"
      style={{ background: bg }}
    >
      <p className="font-black uppercase text-xs mb-2">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
