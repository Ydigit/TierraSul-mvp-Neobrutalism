"use client";

import type { ReactNode } from "react";

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No results",
  onRowClick,
}: AdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] p-12 text-center">
        <p className="font-black uppercase">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-[#FFF8E7] border-b-4 border-black">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-6 py-4 text-left font-black uppercase text-sm whitespace-nowrap ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              className={`border-b-2 border-black/30 last:border-0 ${
                i % 2 === 0 ? "bg-white" : "bg-[#FFF8E7]/40"
              } ${onRowClick ? "cursor-pointer hover:bg-[#FFEB3B]/20" : ""}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-6 py-4 align-middle ${c.className ?? ""}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
