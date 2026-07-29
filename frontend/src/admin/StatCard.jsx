import React from "react";
import { Link } from "react-router-dom";

const COLORS = {
  blue: "bg-[#0D9387]/10 dark:bg-[#0D9387]/20 text-[#0D9387] dark:text-teal-400",
  green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
  amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
};

export default function StatCard({ title, value, icon: Icon, hint, testId, color = "blue", to }) {
  const iconCls = COLORS[color] || COLORS.blue;

  const card = (
    <div
      data-testid={testId}
      className={`bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${
        to ? "hover:border-brand-turquoise/40 hover:shadow-md transition-all cursor-pointer group" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 group-hover:text-brand-turquoise transition-colors">{title}</span>
        {Icon ? (
          <div className={`h-9 w-9 rounded-[10px] flex items-center justify-center ${iconCls}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">{hint}</div> : null}
    </div>
  );

  if (to) return <Link to={to}>{card}</Link>;
  return card;
}
